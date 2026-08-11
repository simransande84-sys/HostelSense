"""
complaints/utils.py
====================
ML prediction utilities for HostelSenseAI.

Design decisions
----------------
* All three pkl artifacts are loaded ONCE at module import time (singleton pattern).
  Subsequent calls to predict_priority() reuse the already-loaded objects, making
  the API response fast with no repeated disk I/O.
* The saved model (hostel_priority_model.pkl) is a full sklearn Pipeline
  (ColumnTransformer + LinearSVC), so it accepts raw DataFrames — no manual
  TF-IDF or scaling is needed here.
* NLP preprocessing (lowercase, punctuation removal, lemmatisation) is reproduced
  here to match exactly what was done during training (standalone_train_save.py).
"""
import os
import re
import logging

import joblib
import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from django.conf import settings

logger = logging.getLogger(__name__)

# ── NLTK data (downloaded once) ────────────────────────────────────────────────
nltk.download("stopwords", quiet=True)
nltk.download("wordnet",   quiet=True)
nltk.download("omw-1.4",   quiet=True)

# ── Load ML artifacts (once at import time) ────────────────────────────────────
_MODEL_DIR = settings.ML_MODEL_DIR

try:
    _model         = joblib.load(os.path.join(_MODEL_DIR, "hostel_priority_model.pkl"))
    _label_encoder = joblib.load(os.path.join(_MODEL_DIR, "label_encoder.pkl"))
    _domain_sw     = joblib.load(os.path.join(_MODEL_DIR, "domain_stopwords.pkl"))
    logger.info("ML artifacts loaded successfully from %s", _MODEL_DIR)
except Exception as exc:
    _model = _label_encoder = _domain_sw = None
    logger.error("Failed to load ML artifacts: %s", exc)

# ── Build combined stopword set ────────────────────────────────────────────────
_std_stopwords = set(stopwords.words("english")) if _domain_sw is not None else set()
_all_stopwords = _std_stopwords.union(_domain_sw or set())
_lemmatizer    = WordNetLemmatizer()


# ── Internal helpers ───────────────────────────────────────────────────────────

def _preprocess_text(text: str) -> str:
    """
    Apply the same NLP pipeline used during model training:
    lowercase → remove punctuation → remove digits → remove stopwords → lemmatise.
    """
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\d+", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    tokens = [
        _lemmatizer.lemmatize(w)
        for w in text.split()
        if w not in _all_stopwords and len(w) > 2
    ]
    return " ".join(tokens)


# ── Public API ─────────────────────────────────────────────────────────────────

def is_model_loaded() -> bool:
    """Return True if all ML artifacts were loaded successfully."""
    return _model is not None


def predict_priority(complaint_data: dict) -> str:
    """
    Predict the priority of a complaint using the trained LinearSVC pipeline.

    Parameters
    ----------
    complaint_data : dict
        Must contain the following keys (matching the training feature set):
            - complaint_text   (str)  raw complaint text
            - complaint_type   (str)  "Public" | "Private"
            - block            (str)  "A" | "B" | "C" | "D"
            - floor            (str)  "Ground" | "First" | "Second" | "Third"
            - category         (str)  e.g. "Cleanliness", "Mess", …
            - students_affected (int)
            - support_count    (int)

    Returns
    -------
    str
        One of: "Critical", "High", "Medium", "Low"
        Returns "Unknown" if the model is not loaded.
    """
    if not is_model_loaded():
        logger.error("predict_priority called but ML model is not loaded.")
        return "Unknown"

    # Apply same NLP preprocessing as training
    cleaned_text = _preprocess_text(complaint_data.get("complaint_text", ""))

    # Build a single-row DataFrame matching the training feature columns exactly
    row = pd.DataFrame([{
        "Cleaned_Text":      cleaned_text,
        "Complaint_Type":    complaint_data.get("complaint_type", "Public"),
        "Block":             complaint_data.get("block", "A"),
        "Floor":             complaint_data.get("floor", "Ground"),
        "Category":          complaint_data.get("category", "Other"),
        "Students_Affected": int(complaint_data.get("students_affected", 1)),
        "Support_Count":     int(complaint_data.get("support_count", 0)),
    }])

    # Pipeline predicts encoded label → decode back to string
    encoded_pred = _model.predict(row)
    priority     = _label_encoder.inverse_transform(encoded_pred)[0]
    logger.debug("Predicted priority: %s for text: %.60s", priority, cleaned_text)
    return priority


def get_model_info() -> dict:
    """Return basic metadata about the loaded model (for the health/dashboard endpoints)."""
    if not is_model_loaded():
        return {"loaded": False}
    return {
        "loaded":  True,
        "classes": _label_encoder.classes_.tolist(),
        "model":   type(_model).__name__,
    }


# ── Priority Escalation ────────────────────────────────────────────────────────

# Priority ladder — ordered from lowest to highest
PRIORITY_ORDER = ["Low", "Medium", "High", "Critical"]


def escalate_priority(base_priority: str, support_count: int) -> str:
    """
    Apply community-support escalation rules on top of ML-predicted priority.

    Rules:
        0–10    → No change
        11–25   → Increase by one level (always)
        26–50   → Increase by one level only if currently Low or Medium
        > 50    → Increase by one level (always)

    Constraints:
        - Never decreases priority
        - Never exceeds Critical
        - Does not jump multiple levels at once

    Parameters
    ----------
    base_priority : str
        The ML-predicted priority before escalation.
    support_count : int
        Current number of student supports on the complaint.

    Returns
    -------
    str
        Final priority after applying escalation rules.
    """
    if base_priority not in PRIORITY_ORDER:
        logger.warning("Unknown base_priority '%s' — returning as-is.", base_priority)
        return base_priority

    idx = PRIORITY_ORDER.index(base_priority)

    if support_count <= 10:
        # No change — community support is too low to escalate
        return base_priority

    elif 11 <= support_count <= 25:
        # Always bump one level
        return PRIORITY_ORDER[min(idx + 1, 3)]

    elif 26 <= support_count <= 50:
        # Only bump if currently Low or Medium (idx < 2)
        if idx < 2:
            return PRIORITY_ORDER[idx + 1]
        return base_priority

    else:
        # support_count > 50 — always bump one level
        return PRIORITY_ORDER[min(idx + 1, 3)]


def apply_priority_update(complaint) -> str:
    """
    Re-run ML prediction on the complaint's current field values,
    then apply escalation rules, and return the updated priority string.

    This is called after every support vote change so that predicted_priority
    always reflects both ML severity AND community impact.

    Parameters
    ----------
    complaint : Complaint model instance

    Returns
    -------
    str  — the new priority to store in complaint.predicted_priority
    """
    # Step 1: Re-run the ML model with current complaint data
    ml_priority = predict_priority({
        "complaint_text":    complaint.complaint_text,
        "complaint_type":    complaint.complaint_type,
        "block":             complaint.block,
        "floor":             complaint.floor,
        "category":          complaint.category,
        "students_affected": complaint.students_affected,
        "support_count":     complaint.support_count,
    })

    # Step 2: Apply escalation on top of ML result
    final_priority = escalate_priority(ml_priority, complaint.support_count)

    logger.info(
        "Priority update — ML: %s → Escalated: %s (support_count=%d)",
        ml_priority, final_priority, complaint.support_count,
    )
    return final_priority
