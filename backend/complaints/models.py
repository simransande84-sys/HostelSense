"""
complaints/models.py
====================
Three models:

1. Complaint      — A hostel complaint with ML-predicted priority
2. ComplaintVote  — One-vote-per-student support system
3. StudentProfile — Extended student info linked to Django User
"""
from django.db import models
from django.contrib.auth.models import User


# ─────────────────────────────────────────────────────────────────────────────
# Complaint
# ─────────────────────────────────────────────────────────────────────────────
class Complaint(models.Model):

    # ── Choice constants ──────────────────────────────────────────────────────
    class ComplaintType(models.TextChoices):
        PUBLIC  = "Public",  "Public"
        PRIVATE = "Private", "Private"

    class Block(models.TextChoices):
        A = "A", "Block A"
        B = "B", "Block B"
        C = "C", "Block C"
        D = "D", "Block D"

    class Floor(models.TextChoices):
        GROUND = "Ground", "Ground Floor"
        FIRST  = "First",  "First Floor"
        SECOND = "Second", "Second Floor"
        THIRD  = "Third",  "Third Floor"

    class Category(models.TextChoices):
        CLEANLINESS  = "Cleanliness",  "Cleanliness"
        MESS         = "Mess",         "Mess"
        WASHROOM     = "Washroom",     "Washroom"
        FURNITURE    = "Furniture",    "Furniture"
        WATER_COOLER = "Water Cooler", "Water Cooler"
        SECURITY     = "Security",     "Security"
        ELECTRICITY  = "Electricity",  "Electricity"
        WIFI         = "WiFi",         "WiFi"
        OTHER        = "Other",        "Other"

    class Priority(models.TextChoices):
        CRITICAL = "Critical", "Critical"
        HIGH     = "High",     "High"
        MEDIUM   = "Medium",   "Medium"
        LOW      = "Low",      "Low"

    class Status(models.TextChoices):
        PENDING     = "Pending",     "Pending"
        IN_PROGRESS = "In Progress", "In Progress"
        RESOLVED    = "Resolved",    "Resolved"
        REJECTED    = "Rejected",    "Rejected"

    # ── Core fields ───────────────────────────────────────────────────────────
    complaint_text = models.TextField(
        help_text="Raw complaint text submitted by the student."
    )
    complaint_type = models.CharField(
        max_length=10,
        choices=ComplaintType.choices,
        default=ComplaintType.PUBLIC,
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
    )
    block = models.CharField(
        max_length=1,
        choices=Block.choices,
    )
    floor = models.CharField(
        max_length=10,
        choices=Floor.choices,
    )
    room_no = models.CharField(
        max_length=10,
        blank=True,
        default="",
        help_text="Room number (optional).",
    )
    students_affected = models.PositiveIntegerField(default=1)
    support_count = models.PositiveIntegerField(
        default=0,
        help_text="Incremented each time a student clicks Support.",
    )

    # ── ML + status fields ────────────────────────────────────────────────────
    predicted_priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        blank=True,
        default="",
        help_text=(
            "Single source of truth for priority. "
            "Updated by ML prediction AND support escalation rules."
        ),
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
        help_text="Current resolution status, managed by admin.",
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    submitted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complaints",
        help_text="The student who submitted this complaint. NULL for CSV-imported rows.",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(
        default=None,
        null=True,
        blank=True,
        help_text="Timestamp when the complaint was submitted.",
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Complaint"
        verbose_name_plural = "Complaints"

    def __str__(self):
        return f"[{self.predicted_priority or 'UNSCORED'}] {self.complaint_text[:60]}"


# ─────────────────────────────────────────────────────────────────────────────
# ComplaintVote  — Public support system
# ─────────────────────────────────────────────────────────────────────────────
class ComplaintVote(models.Model):
    """
    Each student can support (vote on) a public complaint exactly once.
    The unique_together constraint enforces this at the database level.
    """
    complaint = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name="votes",
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="votes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Database-level uniqueness — one student, one support per complaint
        unique_together = ("complaint", "student")
        verbose_name = "Complaint Support"
        verbose_name_plural = "Complaint Supports"

    def __str__(self):
        return f"{self.student.username} supported Complaint #{self.complaint_id}"


# ─────────────────────────────────────────────────────────────────────────────
# StudentProfile  — Extended hostel info for each student user
# ─────────────────────────────────────────────────────────────────────────────
class StudentProfile(models.Model):
    """
    Extended profile for students.
    Linked 1-to-1 with Django's built-in User model.
    Students fill this in after their first login.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    roll_no = models.CharField(
        max_length=20,
        unique=True,
        help_text="Unique college roll number.",
    )
    block = models.CharField(
        max_length=1,
        blank=True,
        default="",
        help_text="Hostel block (A/B/C/D). Filled after first login.",
    )
    floor = models.CharField(
        max_length=10,
        blank=True,
        default="",
    )
    room_no = models.CharField(
        max_length=10,
        blank=True,
        default="",
    )
    phone = models.CharField(
        max_length=15,
        blank=True,
        default="",
        help_text="Optional phone number.",
    )
    profile_complete = models.BooleanField(
        default=False,
        help_text="False until the student completes block/floor/room details.",
    )

    class Meta:
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"

    def __str__(self):
        return f"{self.user.username} — {self.roll_no}"
