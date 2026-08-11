import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
            <span class="brand-tag">University Facilities Portal</span>
          </div>
        </div>

        <!-- Clean Auth Card -->
        <div class="auth-card card">
          <div class="card-header">
            <h2>Sign in to Portal</h2>
            <p>Enter your credentials to access your resident dashboard.</p>
          </div>

          <form (ngSubmit)="onLogin()" #loginForm="ngForm" novalidate>
            <div class="field-group">
              <label class="field-label">Username</label>
              <input type="text" [(ngModel)]="username" name="username"
                     placeholder="Enter your username" required #u="ngModel"
                     [class.error]="u.invalid && u.touched" />
            </div>

            <div class="field-group">
              <label class="field-label">Password</label>
              <div class="pwd-input-wrap">
                <input [type]="showPwd() ? 'text' : 'password'" [(ngModel)]="password"
                       name="password" placeholder="Enter your password" required
                       #p="ngModel" [class.error]="p.invalid && p.touched" />
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
              <span>{{ loading() ? 'Authenticating...' : 'Sign In' }}</span>
            </button>
          </form>

          <div class="auth-footer">
            <p>New resident student? <a routerLink="/register">Register here</a></p>
          </div>

          <div class="staff-hint">
            <span>Staff / Administrator Account: username <code>admin</code></span>
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
      max-width: 400px;
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
      background-color: var(--surface-white);
      border: 1px solid var(--border);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
      transition: border-color 200ms ease-in-out;
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
      transition: transform 200ms ease-in-out, border-color 200ms ease-in-out, box-shadow 200ms ease-in-out;

      &:hover {
        transform: translateY(-2px);
        border-color: #B0C4D0;
        box-shadow: var(--shadow-md);
      }
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

    .field-group {
      margin-bottom: 16px;
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
      transition: color 180ms ease-in-out;

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
        transition: color 180ms ease-in-out;

        &:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }
      }
    }

    .staff-hint {
      text-align: center;
      margin-top: 16px;
      font-size: 12px;
      color: var(--text-muted);
      background-color: var(--bg);
      border: 1px solid var(--border-subtle);
      padding: 8px 12px;
      border-radius: var(--radius-md);

      code {
        background-color: #D2DFE6;
        color: var(--text-primary);
        padding: 2px 5px;
        border-radius: 4px;
        font-weight: 600;
      }
    }

    .portal-footer {
      margin-top: 24px;
      font-size: 11.5px;
      color: var(--text-muted);
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading  = signal(false);
  showPwd  = signal(false);

  constructor(private auth: AuthService, private router: Router, private snack: MatSnackBar) {}

  onLogin(): void {
    if (!this.username || !this.password) return;
    this.loading.set(true);

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.auth.fetchCurrentUser().subscribe({
          next: user => {
            this.loading.set(false);
            if (user.is_staff) {
              this.router.navigate(['/admin/dashboard']);
            } else if (!user.profile_complete) {
              this.router.navigate(['/complete-profile']);
            } else {
              this.router.navigate(['/student/home']);
            }
          },
          error: () => { this.loading.set(false); this.router.navigate(['/student/home']); }
        });
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Invalid credentials. Please try again.', 'Close',
          { duration: 3000, panelClass: 'snack-error' });
      }
    });
  }
}
