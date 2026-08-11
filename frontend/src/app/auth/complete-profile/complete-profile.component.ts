import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatProgressSpinnerModule, MatSelectModule],
  template: `
    <div class="profile-page">
      <div class="profile-card card">
        <div class="header-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h2>Complete Hostel Profile</h2>
        <p>Provide your allocated room details so ticket requests automatically route to your resident block.</p>

        <form (ngSubmit)="onSave()" novalidate>
          <div class="grid-2-form">
            <div class="field-group">
              <label class="field-label">Hostel Block</label>
              <mat-select [(ngModel)]="form.block" name="block" placeholder="Select Block" required>
                <mat-option value="">Select Block</mat-option>
                <mat-option *ngFor="let b of blocks" [value]="b">Block {{ b }}</mat-option>
              </mat-select>
            </div>
            <div class="field-group">
              <label class="field-label">Floor</label>
              <mat-select [(ngModel)]="form.floor" name="floor" placeholder="Select Floor" required>
                <mat-option value="">Select Floor</mat-option>
                <mat-option *ngFor="let f of floors" [value]="f">{{ f }} Floor</mat-option>
              </mat-select>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Room Number</label>
            <input type="text" [(ngModel)]="form.room_no" name="room_no"
                   placeholder="e.g. 210" required />
          </div>

          <div class="field-group">
            <label class="field-label">Phone Number <span class="opt">(Optional)</span></label>
            <input type="tel" [(ngModel)]="form.phone" name="phone" placeholder="e.g. 9876543210" />
          </div>

          <button type="submit" class="btn-primary full-width" [disabled]="loading()">
            <mat-spinner *ngIf="loading()" diameter="18"></mat-spinner>
            <span>{{ loading() ? 'Saving Profile...' : 'Save & Continue' }}</span>
          </button>
          <button type="button" class="btn-skip" (click)="skip()">Skip for now</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg);
      padding: 24px;
    }
    .profile-card {
      max-width: 420px;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .header-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background-color: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
    }
    p {
      color: var(--text-muted);
      margin: 6px 0 24px;
      font-size: 13.5px;
      line-height: 1.4;
    }

    form {
      width: 100%;
    }
    .grid-2-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .field-group {
      margin-bottom: 14px;
      text-align: left;
    }
    .field-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 6px;
    }
    .opt {
      font-weight: 400;
      color: var(--text-muted);
      font-size: 12px;
    }

    .full-width {
      width: 100%;
      margin-top: 8px;
    }
    .btn-skip {
      width: 100%;
      height: 36px;
      background: transparent;
      color: var(--text-muted);
      border: none;
      font-size: 13px;
      cursor: pointer;
      margin-top: 6px;

      &:hover {
        color: var(--text-primary);
      }
    }
  `]
})
export class CompleteProfileComponent {
  blocks = ['A', 'B', 'C', 'D'];
  floors = ['Ground', 'First', 'Second', 'Third'];
  form   = { block: '', floor: '', room_no: '', phone: '' };
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router, private snack: MatSnackBar) {}

  onSave(): void {
    if (!this.form.block || !this.form.floor || !this.form.room_no) {
      this.snack.open('Please select block, floor and enter room number.', 'Close', { duration: 3000 });
      return;
    }
    this.loading.set(true);
    this.auth.updateProfile(this.form).subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open('Profile saved!', 'OK', { duration: 2000 });
        this.router.navigate(['/student/home']);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to save profile. Try again.', 'Close', { duration: 3000 });
      }
    });
  }

  skip(): void { this.router.navigate(['/student/home']); }
}
