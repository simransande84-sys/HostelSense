import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="shell" [class.collapsed]="collapsed()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-logo-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">HostelSense</span>
            <span class="brand-badge">PORTAL</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a class="nav-item" routerLink="/student/home" routerLinkActive="active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span class="nav-label">Dashboard</span>
          </a>

          <a class="nav-item" routerLink="/student/submit" routerLinkActive="active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span class="nav-label">Submit Issue</span>
          </a>

          <a class="nav-item" routerLink="/student/mine" routerLinkActive="active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span class="nav-label">My Requests</span>
          </a>

          <a class="nav-item" routerLink="/student/public" routerLinkActive="active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span class="nav-label">Public Feed</span>
          </a>

          <a class="nav-item" routerLink="/student/profile" routerLinkActive="active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span class="nav-label">Profile & Settings</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="nav-item logout-btn" (click)="logout()">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span class="nav-label">Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Section -->
      <div class="main">
        <header class="topbar">
          <button class="toggle-btn" (click)="collapsed.set(!collapsed())" title="Toggle Sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div class="system-tag">
            <span class="dot-online"></span>
            <span>Student Portal</span>
          </div>

          <div class="topbar-right">
            <button class="icon-btn" title="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span class="notif-badge"></span>
            </button>

            <div class="user-chip">
              <span class="avatar">{{ initial() }}</span>
              <div class="user-meta">
                <span class="user-name">{{ auth.currentUser()?.first_name || 'Student' }}</span>
                <span class="user-role">Resident</span>
              </div>
            </div>
          </div>
        </header>

        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background-color: var(--bg);
    }
    .sidebar {
      width: var(--sidebar-w);
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width 200ms ease-in-out;
      overflow: hidden;
    }
    .shell.collapsed .sidebar {
      width: var(--sidebar-w-collapsed);
    }
    .shell.collapsed .brand-text,
    .shell.collapsed .nav-label,
    .shell.collapsed .brand-badge {
      display: none;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px;
      border-bottom: 1px solid var(--border);
      height: 60px;
    }
    .brand-logo-wrap {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      background-color: var(--surface-white);
      border: 1px solid var(--border);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: var(--shadow-sm);

      svg {
        width: 17px;
        height: 17px;
      }
    }
    .brand-text {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .brand-title {
      font-size: 14.5px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }
    .brand-badge {
      font-size: 9px;
      font-weight: 700;
      background: #D2DFE6;
      color: var(--text-secondary);
      padding: 1px 5px;
      border-radius: 3px;
      letter-spacing: 0.05em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8.5px 12px;
      border-radius: var(--radius-md);
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 13.5px;
      font-weight: 500;
      transition: background-color 200ms ease-in-out, color 200ms ease-in-out;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      white-space: nowrap;
      position: relative;

      &:hover {
        background-color: var(--nav-hover-bg); /* Muted neutral tint */
        color: var(--text-primary);
      }

      &.active {
        background-color: var(--nav-active-bg);
        color: var(--nav-active-text);
        font-weight: 600;

        &::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 6px;
          bottom: 6px;
          width: 3px;
          background-color: var(--primary);
          border-radius: 0 3px 3px 0;
        }
      }
    }

    .nav-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      transition: color 200ms ease-in-out;
    }

    .sidebar-footer {
      padding: 12px 8px;
      border-top: 1px solid var(--border);
    }
    .logout-btn {
      color: var(--text-muted);
      &:hover {
        background-color: var(--danger-bg);
        color: var(--danger);
      }
    }

    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .topbar {
      height: 60px;
      background: var(--surface-white);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 16px;
      flex-shrink: 0;
    }

    .toggle-btn {
      background: var(--surface-white);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 200ms ease-in-out, border-color 200ms ease-in-out;

      &:hover {
        background-color: var(--bg);
        color: var(--text-primary);
        border-color: #B0C4D0;
      }
    }

    .system-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text-muted);
      border-left: 1px solid var(--border);
      padding-left: 16px;
    }
    .dot-online {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--success);
    }

    .topbar-right {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .icon-btn {
      position: relative;
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 6px;
      border-radius: var(--radius-sm);
      transition: background-color 200ms ease-in-out, color 200ms ease-in-out;

      &:hover {
        background-color: var(--bg);
        color: var(--text-primary);
      }
    }
    .notif-badge {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--primary);
    }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
    }
    .user-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .user-role {
      font-size: 11px;
      color: var(--text-muted);
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 24px 32px;
      background-color: var(--bg);
    }
  `]
})
export class StudentLayoutComponent {
  collapsed = signal(false);
  constructor(public auth: AuthService) {}
  initial(): string { return (this.auth.currentUser()?.first_name?.[0] || 'S').toUpperCase(); }
  logout(): void { this.auth.logout(); }
}
