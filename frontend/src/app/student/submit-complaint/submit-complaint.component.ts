import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ComplaintService } from '../../core/services/complaint.service';
import { Complaint, Priority } from '../../core/models/complaint.model';
import { PriorityBadgeComponent } from '../../shared/components/priority-badge/priority-badge.component';

@Component({
  selector: 'app-submit-complaint',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatProgressSpinnerModule, MatSelectModule, PriorityBadgeComponent],
  template: `
    <div class="page-header">
      <h1>Submit Hostel Request</h1>
      <p>Log a facility or maintenance issue. The system evaluates severity via ML analysis.</p>
    </div>

    <div class="submit-grid">
      <!-- Main Form -->
      <div class="card">
        <form (ngSubmit)="onSubmit()" novalidate>
          
          <!-- Section 1: Visibility Scope -->
          <div class="form-section">
            <label class="section-label">Complaint Visibility Scope <span class="req">*</span></label>
            <div class="radio-grid">
              <label class="radio-card" [class.selected]="form.complaint_type === 'Public'">
                <input type="radio" [(ngModel)]="form.complaint_type" name="type" value="Public" />
                <div class="radio-content">
                  <div class="radio-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                    </svg>
                    <span>Public Complaint</span>
                  </div>
                  <span class="radio-desc">Visible on resident noticeboard for community upvotes & support</span>
                </div>
              </label>

              <label class="radio-card" [class.selected]="form.complaint_type === 'Private'">
                <input type="radio" [(ngModel)]="form.complaint_type" name="type" value="Private" />
                <div class="radio-content">
                  <div class="radio-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Private Complaint</span>
                  </div>
                  <span class="radio-desc">Direct report to administration staff only</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Section 2: Details -->
          <div class="form-section">
            <div class="field-group">
              <label class="field-label">Complaint Description <span class="req">*</span></label>
              <textarea [(ngModel)]="form.complaint_text" name="complaint_text" rows="4"
                        placeholder="Provide exact details of the defect, location inside the room/hallway, and urgency (min. 10 characters)..."
                        (blur)="previewPriority()" required></textarea>
            </div>

            <div class="grid-2-form">
              <div class="field-group">
                <label class="field-label">Category <span class="req">*</span></label>
                <mat-select [(ngModel)]="form.category" name="category" placeholder="Select Category" required (selectionChange)="previewPriority()">
                  <mat-option value="">Select Category</mat-option>
                  <mat-option *ngFor="let c of categories" [value]="c">{{ c }}</mat-option>
                </mat-select>
              </div>

              <div class="field-group">
                <label class="field-label">Students Affected <span class="req">*</span></label>
                <input type="number" [(ngModel)]="form.students_affected" name="students_affected"
                       min="1" placeholder="e.g. 10" required />
              </div>
            </div>
          </div>

          <!-- Section 3: Location -->
          <div class="form-section mb-0">
            <label class="section-label">Hostel Location Details</label>
            <div class="grid-3-form">
              <div class="field-group">
                <label class="field-label">Block <span class="req">*</span></label>
                <mat-select [(ngModel)]="form.block" name="block" placeholder="Select Block" required (selectionChange)="previewPriority()">
                  <mat-option value="">Select Block</mat-option>
                  <mat-option *ngFor="let b of blocks" [value]="b">Block {{ b }}</mat-option>
                </mat-select>
              </div>

              <div class="field-group">
                <label class="field-label">Floor <span class="req">*</span></label>
                <mat-select [(ngModel)]="form.floor" name="floor" placeholder="Select Floor" required (selectionChange)="previewPriority()">
                  <mat-option value="">Select Floor</mat-option>
                  <mat-option *ngFor="let f of floors" [value]="f">{{ f }} Floor</mat-option>
                </mat-select>
              </div>

              <div class="field-group">
                <label class="field-label">Room No.</label>
                <input type="text" [(ngModel)]="form.room_no" name="room_no" placeholder="e.g. 210" />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary full-width" [disabled]="submitting()">
              <mat-spinner *ngIf="submitting()" diameter="18"></mat-spinner>
              <span>{{ submitting() ? 'Submitting Request...' : 'Submit Complaint' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Right Column Cards -->
      <div class="right-panel">
        <!-- Live AI Scoring Card -->
        <div class="card preview-card" *ngIf="preview()">
          <div class="preview-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span>Live ML Severity Prediction</span>
          </div>
          <div class="preview-body">
            <span class="preview-label">Estimated Priority:</span>
            <app-priority-badge [priority]="preview()!" />
          </div>
          <p class="preview-note">Automated prediction generated by ML model based on description and impact metrics.</p>
        </div>

        <!-- Success Confirmation Card -->
        <div class="card success-card" *ngIf="submitted()">
          <div class="success-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3>Request Registered Successfully</h3>
          <p>Your complaint has been assigned ticket ID <strong>#{{ submitted()!.id }}</strong>.</p>
          <div class="submitted-meta">
            <div>
              <span class="meta-title">Assigned Priority:</span>
              <app-priority-badge [priority]="submitted()!.predicted_priority" />
            </div>
            <div>
              <span class="meta-title">Status:</span>
              <strong>{{ submitted()!.status }}</strong>
            </div>
          </div>
          <button class="btn-secondary full-width mt-16" (click)="resetForm()">Submit Another Issue</button>
        </div>

        <!-- Process Workflow Info Card -->
        <div class="card info-card">
          <h3 class="info-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Processing Workflow
          </h3>
          <ul class="steps-list">
            <li><span>1</span> Input defect details & location parameters</li>
            <li><span>2</span> NLP Model computes baseline priority score</li>
            <li><span>3</span> Request logged in University administration queue</li>
            <li><span>4</span> Public feed upvotes dynamically adjust priority ranking</li>
            <li><span>5</span> Maintenance department dispatched accordingly</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .submit-grid {
      display: grid;
      grid-template-columns: 1fr 330px;
      gap: 24px;
      align-items: start;
      @media(max-width: 960px) {
        grid-template-columns: 1fr;
      }
    }

    .form-section {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-subtle);
      &.mb-0 {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
    }

    .section-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 10px;
    }
    .field-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 6px;
    }
    .req { color: var(--danger); }

    .radio-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .radio-card {
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px;
      cursor: pointer;
      display: flex;
      gap: 10px;
      background-color: var(--surface);
      transition: all 0.15s ease;

      input[type="radio"] {
        width: 15px;
        height: 15px;
        margin-top: 2px;
        accent-color: var(--primary);
      }

      &:hover {
        border-color: #CBD5E1;
        background-color: var(--bg);
      }

      &.selected {
        border-color: var(--primary);
        background-color: var(--nav-active-bg);
        color: var(--nav-active-text);
      }
    }

    .radio-content {
      display: flex;
      flex-direction: column;
    }
    .radio-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
    }
    .radio-desc {
      font-size: 11.5px;
      color: var(--text-muted);
      margin-top: 4px;
      line-height: 1.3;
    }

    .field-group {
      margin-bottom: 14px;
    }
    .grid-2-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .grid-3-form {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }

    .form-actions {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .full-width {
      width: 100%;
    }

    .right-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .preview-card {
      border-color: var(--primary-border);
      background-color: #F0F7FA;
    }
    .preview-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--nav-active-text);
      margin-bottom: 12px;
    }
    .preview-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .preview-label {
      font-size: 12.5px;
      color: var(--text-secondary);
    }
    .preview-note {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .success-card {
      border-color: var(--success-border);
      background-color: var(--success-bg);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      h3 {
        font-size: 15px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 10px 0 4px;
      }
      p {
        font-size: 13px;
        color: var(--text-secondary);
      }
    }

    .success-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--success);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .submitted-meta {
      width: 100%;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--success-border);
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;

      .meta-title {
        color: var(--text-muted);
        margin-right: 4px;
      }
    }
    .mt-16 { margin-top: 16px; }

    .info-card {
      background-color: var(--surface);
    }
    .info-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .steps-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;

      li {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 12.5px;
        color: var(--text-secondary);
        line-height: 1.4;

        span {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--sidebar-bg);
          color: var(--text-primary);
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
      }
    }
  `]
})
export class SubmitComplaintComponent {
  types      = ['Public', 'Private'];
  categories = ['Cleanliness','Mess','Washroom','Furniture','Water Cooler','Security','Electricity','WiFi','Other'];
  blocks     = ['A','B','C','D'];
  floors     = ['Ground','First','Second','Third'];

  form = {
    complaint_type: 'Public', complaint_text: '', category: '',
    block: '', floor: '', room_no: '', students_affected: 1
  };

  preview   = signal<Priority | null>(null);
  submitted = signal<Complaint | null>(null);
  submitting = signal(false);

  constructor(private svc: ComplaintService, private snack: MatSnackBar) {}

  previewPriority(): void {
    if (this.form.complaint_text.length < 10 || !this.form.block || !this.form.floor) return;
    this.svc.predict({
      complaint_text: this.form.complaint_text,
      complaint_type: this.form.complaint_type,
      category: this.form.category || 'Other',
      block: this.form.block,
      floor: this.form.floor,
      students_affected: this.form.students_affected,
      support_count: 0
    }).subscribe(res => this.preview.set(res.predicted_priority));
  }

  onSubmit(): void {
    const { complaint_text, category, block, floor, complaint_type, students_affected, room_no } = this.form;
    if (!complaint_text || !category || !block || !floor) {
      this.snack.open('Please fill all required fields.', 'Close', { duration: 3000 }); return;
    }
    this.submitting.set(true);
    this.svc.create({ complaint_text, complaint_type: complaint_type as any, category, block, floor, room_no, students_affected }).subscribe({
      next: c => { this.submitting.set(false); this.submitted.set(c); },
      error: () => { this.submitting.set(false); this.snack.open('Submission failed. Try again.', 'Close', { duration: 3000 }); }
    });
  }

  resetForm(): void {
    this.form = { complaint_type:'Public', complaint_text:'', category:'', block:'', floor:'', room_no:'', students_affected:1 };
    this.preview.set(null); this.submitted.set(null);
  }
}
