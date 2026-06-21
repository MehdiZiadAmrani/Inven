import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IncidenciaService, IncidenciaDTO } from '../../services/incidencia.service';
import { AuthService } from '../../services/auth.service';
import { IncidenciaStatus, IncidenciaPriority, INCIDENCIA_STATUS_LABELS, INCIDENCIA_PRIORITY_LABELS } from '../../config/enums';

interface StatusTransition {
  target: string;
  label: string;
  badgeClass: string;
}

const STATUS_TRANSITIONS: Record<string, StatusTransition[]> = {
  open: [
    { target: IncidenciaStatus.IN_PROGRESS, label: 'Start Progress', badgeClass: 'btn-in-progress' },
    { target: IncidenciaStatus.CLOSED, label: 'Close', badgeClass: 'btn-close' }
  ],
  in_progress: [
    { target: IncidenciaStatus.RESOLVED, label: 'Resolve', badgeClass: 'btn-resolve' },
    { target: IncidenciaStatus.CLOSED, label: 'Close', badgeClass: 'btn-close' }
  ],
  resolved: [
    { target: IncidenciaStatus.CLOSED, label: 'Close', badgeClass: 'btn-close' }
  ],
  closed: []
};

@Component({
  selector: 'app-incidencia-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="incidencia-detail-container">
      <button class="btn-back" (click)="goBack()">← Back to Incidents</button>

      <div *ngIf="isLoading" class="loading-message">Loading incident...</div>

      <div *ngIf="!isLoading && errorMessage" class="error-container">
        <p>{{ errorMessage }}</p>
      </div>

      <div class="content" *ngIf="!isLoading && incidencia && !errorMessage">
        <div class="info-section">
          <h2>{{ incidencia.title }}</h2>

          <div class="details-grid">
            <div class="detail-item">
              <strong>Status:</strong>
              <span class="status-badge" [ngClass]="'status-' + incidencia.status">{{ getStatusLabel(incidencia.status) }}</span>
            </div>
            <div class="detail-item">
              <strong>Priority:</strong>
              <span class="priority-badge" [ngClass]="'priority-' + incidencia.priority">{{ getPriorityLabel(incidencia.priority) }}</span>
            </div>
            <div class="detail-item">
              <strong>Product:</strong>
              <span>{{ incidencia.productName || '-' }}</span>
            </div>
            <div class="detail-item">
              <strong>Description:</strong>
              <span>{{ incidencia.description || 'No description provided.' }}</span>
            </div>
            <div class="detail-item">
              <strong>Created:</strong>
              <span>{{ incidencia.createdAt | date:'medium' }}</span>
            </div>
            <div class="detail-item">
              <strong>Updated:</strong>
              <span>{{ incidencia.updatedAt | date:'medium' }}</span>
            </div>
          </div>

          <div class="transitions" *ngIf="availableTransitions.length > 0 && !isEdit">
            <h3>Status Actions</h3>
            <div class="transition-buttons">
              <button
                *ngFor="let t of availableTransitions"
                (click)="transitionStatus(t.target)"
                class="btn-transition"
                [ngClass]="t.badgeClass">
                {{ t.label }}
              </button>
            </div>
            <p *ngIf="transitionError" class="form-error">{{ transitionError }}</p>
          </div>

          <div class="edit-form" *ngIf="isEdit">
            <h3>Edit Incident</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Title</label>
                <input type="text" [(ngModel)]="editTitle" placeholder="Title" maxlength="200" class="form-input" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Description</label>
                <textarea [(ngModel)]="editDescription" placeholder="Description" maxlength="500" rows="3" class="form-input form-textarea"></textarea>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Priority</label>
                <select [(ngModel)]="editPriority" class="form-input">
                  <option *ngFor="let p of priorityOptions" [value]="p.value">{{ p.label }}</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-save" (click)="saveEdit()" [disabled]="!editTitle.trim()">Save</button>
              <button class="btn-cancel" (click)="cancelEdit()">Cancel</button>
            </div>
            <p *ngIf="editError" class="form-error">{{ editError }}</p>
          </div>

          <div class="actions" *ngIf="isAdmin && !isEdit">
            <button class="btn-edit" (click)="startEdit()">Edit</button>
          </div>
        </div>
      </div>

      <p *ngIf="!isLoading && !incidencia && !errorMessage" class="empty-message">
        Incident not found.
      </p>
    </div>
  `,
  styles: [`
    .incidencia-detail-container {
      min-height: 100vh;
      background: var(--bg-page);
      font-family: var(--font-family);
      display: flex;
      flex-direction: column;
      padding: 20px;
    }

    .btn-back {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      width: fit-content;
      margin-bottom: 20px;
    }

    .btn-back:hover {
      background: var(--bg-surface-elevated);
    }

    .loading-message {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
      font-size: 15px;
    }

    .content {
      flex: 1;
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
    }

    .info-section {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 30px;
      box-shadow: var(--shadow-card);
    }

    h2 {
      margin-top: 0;
      color: var(--primary);
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 10px;
      font-size: 22px;
      font-weight: 600;
      word-break: break-word;
    }

    h3 {
      color: var(--primary);
      font-size: 18px;
      font-weight: 600;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-item strong {
      color: var(--text-secondary);
      margin-bottom: 6px;
      font-size: 13px;
    }

    .detail-item span {
      color: var(--text-primary);
      padding: 8px 12px;
      background: var(--bg-surface-elevated);
      border-radius: var(--radius-sm);
      font-size: 14px;
    }

    .status-badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      display: inline-block;
      width: fit-content;
    }

    .status-open {
      background: #f44336;
      color: white;
    }

    .status-in_progress {
      background: #ff9800;
      color: white;
    }

    .status-resolved {
      background: #4caf50;
      color: white;
    }

    .status-closed {
      background: #9e9e9e;
      color: white;
    }

    .priority-badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      display: inline-block;
      width: fit-content;
    }

    .priority-low {
      background: #2196f3;
      color: white;
    }

    .priority-medium {
      background: #ff9800;
      color: white;
    }

    .priority-high {
      background: #ff5722;
      color: white;
    }

    .priority-critical {
      background: #f44336;
      color: white;
    }

    .transitions {
      margin-top: 24px;
    }

    .transitions h3 {
      margin-bottom: 12px;
    }

    .transition-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn-transition {
      padding: 10px 24px;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      color: white;
    }

    .btn-in-progress {
      background: #ff9800;
    }

    .btn-resolve {
      background: #4caf50;
    }

    .btn-close {
      background: #f44336;
    }

    .actions {
      display: flex;
      gap: 10px;
      margin-top: 24px;
    }

    .btn-edit {
      padding: 10px 24px;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      background: var(--btn-edit);
      color: white;
    }

    .edit-form {
      margin-top: 24px;
      padding: 20px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
    }

    .edit-form h3 {
      margin-top: 0;
      margin-bottom: 16px;
    }

    .form-row {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }

    .form-group {
      flex: 1;
      min-width: 0;
    }

    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 12px;
    }

    .form-input {
      width: 100%;
      padding: 8px 12px;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    .form-textarea {
      resize: vertical;
      font-family: var(--font-family);
    }

    select.form-input {
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 16px;
    }

    .btn-save {
      padding: 8px 20px;
      background: var(--primary);
      color: var(--text-on-primary);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
    }

    .btn-cancel {
      padding: 8px 20px;
      background: var(--btn-cancel);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
    }

    .form-error {
      color: var(--status-disabled);
      font-size: 13px;
      margin-top: 8px;
    }

    .error-container {
      text-align: center;
      padding: 50px;
      color: var(--status-unavailable);
      font-size: 16px;
      background: rgba(244, 67, 54, 0.08);
      border: 1px solid rgba(244, 67, 54, 0.3);
      border-radius: var(--radius-md);
      margin-bottom: 20px;
    }

    .empty-message {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
      font-size: 14px;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .details-grid {
        grid-template-columns: 1fr;
      }
      .form-row {
        flex-direction: column;
      }
    }
  `]
})
export class IncidenciaDetailComponent implements OnInit, OnDestroy {
  private readonly incidenciaService = inject(IncidenciaService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  incidencia: IncidenciaDTO | null = null;
  isLoading = true;
  errorMessage = '';
  isAdmin = false;

  isEdit = false;
  editTitle = '';
  editDescription = '';
  editPriority = '';
  editError = '';

  transitionError = '';

  private loadTimeout: any = null;

  priorityOptions = [
    { value: IncidenciaPriority.LOW, label: INCIDENCIA_PRIORITY_LABELS[IncidenciaPriority.LOW] },
    { value: IncidenciaPriority.MEDIUM, label: INCIDENCIA_PRIORITY_LABELS[IncidenciaPriority.MEDIUM] },
    { value: IncidenciaPriority.HIGH, label: INCIDENCIA_PRIORITY_LABELS[IncidenciaPriority.HIGH] },
    { value: IncidenciaPriority.CRITICAL, label: INCIDENCIA_PRIORITY_LABELS[IncidenciaPriority.CRITICAL] },
  ];

  get availableTransitions(): StatusTransition[] {
    if (!this.incidencia) return [];
    return STATUS_TRANSITIONS[this.incidencia.status] || [];
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'ADMIN';

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadIncidencia(parseInt(id));
    } else {
      this.isLoading = false;
      this.errorMessage = 'No incident ID provided.';
    }

    this.route.paramMap.subscribe(params => {
      const newId = params.get('id');
      if (newId) {
        this.isEdit = false;
        this.loadIncidencia(parseInt(newId));
      }
    });
  }

  loadIncidencia(id: number): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.incidencia = null;

    this.loadTimeout = setTimeout(() => {
      if (this.isLoading && !this.incidencia) {
        this.isLoading = false;
        this.errorMessage = 'Loading took too long. Please try refreshing the page.';
      }
    }, 10000);

    this.incidenciaService.getIncidencia(id).subscribe({
      next: (data) => {
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }
        this.incidencia = data;
        this.isLoading = false;
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }
        this.isLoading = false;
        this.errorMessage = 'Failed to load incident: ' + (err.error?.message || 'Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

  startEdit(): void {
    if (!this.incidencia) return;
    this.isEdit = true;
    this.editTitle = this.incidencia.title;
    this.editDescription = this.incidencia.description || '';
    this.editPriority = this.incidencia.priority;
    this.editError = '';
  }

  saveEdit(): void {
    if (!this.incidencia) return;
    const title = this.editTitle.trim();
    if (!title) return;

    this.incidenciaService.updateIncidencia(this.incidencia.incidenciaId, {
      title,
      description: this.editDescription.trim() || undefined,
      priority: this.editPriority
    }).subscribe({
      next: (result) => {
        this.incidencia = result;
        this.isEdit = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.editError = 'Failed to update: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  cancelEdit(): void {
    this.isEdit = false;
    this.editTitle = '';
    this.editDescription = '';
    this.editPriority = '';
    this.editError = '';
  }

  transitionStatus(targetStatus: string): void {
    if (!this.incidencia) return;
    this.transitionError = '';

    this.incidenciaService.transitionStatus(this.incidencia.incidenciaId, targetStatus).subscribe({
      next: (result) => {
        this.incidencia = result;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.transitionError = 'Failed to change status: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  getStatusLabel(status: string): string {
    return INCIDENCIA_STATUS_LABELS[status] || status;
  }

  getPriorityLabel(priority: string): string {
    return INCIDENCIA_PRIORITY_LABELS[priority] || priority;
  }

  goBack(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }
    this.router.navigate(['/incidencias']);
  }

  ngOnDestroy(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }
  }
}
