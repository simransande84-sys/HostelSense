import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComplaintService } from '../../core/services/complaint.service';
import { AuthService } from '../../core/services/auth.service';
import { Complaint } from '../../core/models/complaint.model';
import { PriorityBadgeComponent } from '../../shared/components/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, RouterModule, PriorityBadgeComponent, StatusBadgeComponent],
  template: `
    <div class="page-header">
      <h1>Welcome, {{ auth.currentUser()?.first_name || 'Student' }}</h1>
      <p>Overview of your hostel requests, community issues, and resolution status.</p>
    </div>

    <!-- Summary KPI Cards -->
    <div class="grid-4 mb-24">
      <div class="kpi-card">
        <div class="kpi-icon-wrap icon-neutral">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="kpi-info">
          <div class="kpi-label">My Submissions</div>
          <div class="kpi-value">{{ myComplaints().length }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-wrap icon-amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="kpi-info">
          <div class="kpi-label">Pending Action</div>
          <div class="kpi-value">{{ pendingCount() }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-wrap icon-green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="kpi-info">
          <div class="kpi-label">Resolved</div>
          <div class="kpi-value">{{ resolvedCount() }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-wrap icon-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
        </div>
        <div class="kpi-info">
          <div class="kpi-label">Supported Issues</div>
          <div class="kpi-value">{{ supportedCount() }}</div>
        </div>
      </div>
    </div>

    <!-- Action Gateway Grid -->
    <div class="grid-2 mb-24">
      <a routerLink="/student/submit" class="action-card">
        <div class="action-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <div class="action-content">
          <div class="action-title">Submit New Complaint</div>
          <div class="action-desc">Report an infrastructure or facility issue. Automated ML priority scoring will evaluate impact.</div>
        </div>
        <svg class="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </a>

      <a routerLink="/student/public" class="action-card">
        <div class="action-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <div class="action-content">
          <div class="action-title">Public Noticeboard</div>
          <div class="action-desc">View complaints lodged by fellow residents. Upvote issues affecting your block to expedite response.</div>
        </div>
        <svg class="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </a>
    </div>

    <!-- Recent Complaints Table -->
    <div class="card">
      <div class="table-header">
        <div>
          <h2 class="section-title mb-0">Recent Submissions</h2>
          <p class="section-sub">List of your recent issues logged into the system</p>
        </div>
        <a routerLink="/student/mine" class="view-all-link">
          View All
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>
      </div>

      <div *ngIf="myComplaints().length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <p class="empty-title">No complaints submitted</p>
        <p class="empty-desc">You haven't submitted any hostel requests yet.</p>
        <a routerLink="/student/submit" class="btn-primary">Submit First Complaint</a>
      </div>

      <div class="table-wrap" *ngIf="myComplaints().length > 0">
        <table class="hs-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Priority Score</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of myComplaints().slice(0,5)">
              <td class="text-cell">{{ c.complaint_text | slice:0:70 }}{{ c.complaint_text.length > 70 ? '…' : '' }}</td>
              <td><span class="category-chip">{{ c.category }}</span></td>
              <td><app-priority-badge [priority]="c.predicted_priority" /></td>
              <td><app-status-badge [status]="c.status" /></td>
              <td class="date-cell">{{ c.created_at | date:'dd MMM yyyy' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .mb-24 { margin-bottom: 24px; }
    .mb-0 { margin-bottom: 0; }

    .icon-neutral { background: #D8E5ED; color: var(--text-primary); }
    .icon-amber   { background: #FFF7ED; color: #D97706; }
    .icon-green   { background: #E8F5E9; color: #2E7D32; }
    .icon-blue    { background: #D0E1EC; color: #1C3F53; }

    .action-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      text-decoration: none;
      color: var(--text-primary);
      box-shadow: var(--shadow-card);
      transition: transform 200ms ease-in-out, border-color 200ms ease-in-out, box-shadow 200ms ease-in-out;

      &:hover {
        transform: translateY(-2px);
        border-color: #B0C4D0;
        box-shadow: var(--shadow-md);

        .action-arrow {
          transform: translateX(3px);
          color: var(--primary);
        }
      }
    }

    .action-icon-box {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background-color: var(--nav-active-bg);
      color: var(--nav-active-text);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      svg {
        width: 19px;
        height: 19px;
      }
    }

    .action-content {
      flex: 1;
    }
    .action-title {
      font-size: 14.5px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .action-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 2px;
      line-height: 1.4;
    }

    .action-arrow {
      width: 18px;
      height: 18px;
      color: var(--text-muted);
      transition: transform 200ms ease-in-out, color 200ms ease-in-out;
      flex-shrink: 0;
    }

    .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .section-sub {
      font-size: 12.5px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .view-all-link {
      color: var(--primary);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: color 180ms ease-in-out;

      &:hover {
        color: var(--primary-hover);
        text-decoration: underline;
      }
    }

    .table-wrap {
      overflow-x: auto;
    }
    .text-cell {
      max-width: 320px;
      font-weight: 450;
    }
    .category-chip {
      font-size: 12px;
      background: var(--bg);
      color: var(--text-secondary);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-weight: 500;
    }
    .date-cell {
      color: var(--text-muted);
      font-size: 12.5px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .empty-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--sidebar-bg);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;

      svg { width: 22px; height: 22px; }
    }
    .empty-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .empty-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin: 4px 0 16px;
    }
  `]
})
export class StudentHomeComponent implements OnInit {
  myComplaints  = signal<Complaint[]>([]);

  pendingCount  = signal(0);
  resolvedCount = signal(0);
  supportedCount= signal(0);

  constructor(public auth: AuthService, private svc: ComplaintService) {}

  ngOnInit(): void {
    this.svc.getMine().subscribe(data => {
      this.myComplaints.set(data);
      this.pendingCount.set(data.filter(c => c.status === 'Pending').length);
      this.resolvedCount.set(data.filter(c => c.status === 'Resolved').length);
      this.supportedCount.set(data.filter(c => c.user_has_voted).length);
    });
  }
}
