import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-container">
        <!-- University Brand Header -->
        <div class="brand-header">
          <div class="brand-emblem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="brand-meta">
            <h1 class="brand-name">HostelSense AI</h1>
            <span class="brand-tag">University Resident Registration</span>
          </div>
        </div>

        <!-- Clean Auth Card -->
        <div class="auth-card card">
          <div class="card-header">
            <h2>Create Resident Account</h2>
            <p>Register using your official student roll number and email.</p>
          </div>

          <form (ngSubmit)="onRegister()" novalidate>
            <div class="grid-2-form">
              <div class="field-group">
                <label class="field-label">Full Name</label>
                <input type="text" [(ngModel)]="form.first_name" name="first_name"
                       placeholder="e.g. Alex Smith" required />
              </div>
              <div class="field-group">
                <label class="field-label">Roll Number</label>
                <input type="text" [(ngModel)]="form.roll_no" name="roll_no"
                       placeholder="e.g. 21CS101" required />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Username</label>
              <input type="text" [(ngModel)]="form.username" name="username"
                     placeholder="Choose username" required />
            </div>

            <div class="field-group">
              <label class="field-label">University Email</label>
              <input type="email" [(ngModel)]="form.email" name="email"
                     placeholder="you@college.edu" required />
            </div>

            <div class="field-group">
              <label class="field-label">Password</label>
              <div class="pwd-input-wrap">
                <input [type]="showPwd() ? 'text' : 'password'" [(ngModel)]="form.password"
                       name="password" placeholder="Min. 6 characters" required />
                <button type="button" class="pwd-toggle" (click)="showPwd.set(!showPwd())" title="Toggle Password">
                  <svg *ngIf="!showPwd()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showPwd()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" class="btn-primary full-width" [disabled]="loading()">
              <mat-spinner *ngIf="loading()" diameter="18"></mat-spinner>
              <span>{{ loading() ? 'Registering...' : 'Create Account' }}</span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Already registered? <a routerLink="/login">Sign In here</a></p>
          </div>
        </div>

        <div class="portal-footer">
          <span>Campus Management System • Security Verified</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg);
      padding: 24px;
    }

    .auth-container {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .brand-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .brand-emblem {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background-color: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
    }

    .brand-meta {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
      line-height: 1.2;
    }

    .brand-tag {
      font-size: 12px;
      color: var(--text-muted);
    }

    .auth-card {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 32px 28px;
      box-shadow: var(--shadow-card);
    }

    .card-header {
      margin-bottom: 24px;

      h2 {
        font-size: 19px;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.01em;
      }

      p {
        font-size: 13.5px;
        color: var(--text-muted);
        margin-top: 4px;
      }
    }

    .grid-2-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .field-group {
      margin-bottom: 14px;
    }

    .field-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    .pwd-input-wrap {
      position: relative;

      input {
        padding-right: 36px;
      }
    }

    .pwd-toggle {
      position: absolute;
      right: 8px;
      top: 8px;
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 3px;
      border-radius: var(--radius-sm);

      &:hover {
        color: var(--text-primary);
      }
    }

    .full-width {
      width: 100%;
      margin-top: 8px;
    }

    .auth-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 13px;
      color: var(--text-muted);

      a {
        color: var(--primary);
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .portal-footer {
      margin-top: 24px;
      font-size: 11.5px;
      color: var(--text-muted);
    }
  `]
})
export class RegisterComponent {
  form = { first_name: '', username: '', email: '', password: '', roll_no: '' };
  loading = signal(false);
  showPwd = signal(false);

  constructor(private auth: AuthService, private router: Router, private snack: MatSnackBar) {}

  onRegister(): void {
    const { first_name, username, email, password, roll_no } = this.form;
    if (!first_name || !username || !email || !password || !roll_no) {
      this.snack.open('Please fill in all fields.', 'Close', { duration: 3000 });
      return;
    }
    this.loading.set(true);
    this.auth.register(this.form).subscribe({
      next: () => {
        this.auth.login(username, password).subscribe({
          next: () => {
            this.loading.set(false);
            this.snack.open('Account created! Please complete your hostel profile.', 'OK', { duration: 4000 });
            this.router.navigate(['/complete-profile']);
          }
        });
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.username?.[0] || err?.error?.email?.[0] ||
                    err?.error?.roll_no?.[0] || 'Registration failed. Please try again.';
        this.snack.open(msg, 'Close', { duration: 4000 });
      }
    });
  }
}
