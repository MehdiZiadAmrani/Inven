import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IncidenciaService, IncidenciaDTO, IncidenciaFilters } from '../../services/incidencia.service';
import { ProductService, ProductDTO } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { IncidenciaStatus, IncidenciaPriority, INCIDENCIA_STATUS_LABELS, INCIDENCIA_PRIORITY_LABELS } from '../../config/enums';

@Component({
  selector: 'app-incidencia-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="incidencia-list-container">
      <div class="content">
        <h2>Incidents</h2>

        <div class="controls">
          <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="filter-select">
            <option value="">All Statuses</option>
            <option *ngFor="let s of statusOptions" [value]="s.value">{{ s.label }}</option>
          </select>
          <select [(ngModel)]="filterPriority" (change)="applyFilters()" class="filter-select">
            <option value="">All Priorities</option>
            <option *ngFor="let p of priorityOptions" [value]="p.value">{{ p.label }}</option>
          </select>
          <button class="btn-refresh" (click)="loadIncidencias()" [disabled]="isLoading">Refresh</button>
          <button class="btn-create" (click)="toggleCreateForm()">Create Incident</button>
        </div>

        <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>

        <div class="create-form" *ngIf="showCreateForm">
          <h3>Create Incident</h3>
          <div class="form-row">
            <input
              type="text"
              [(ngModel)]="newTitle"
              placeholder="Title (required)"
              maxlength="200"
              class="form-input"
              (keyup.enter)="createIncidencia()" />
            <select [(ngModel)]="newPriority" class="form-input">
              <option value="">-- Priority --</option>
              <option *ngFor="let p of priorityOptions" [value]="p.value">{{ p.label }}</option>
            </select>
            <select [(ngModel)]="newProductId" class="form-input">
              <option [ngValue]="null">-- Product --</option>
              <option *ngFor="let p of products" [ngValue]="p.productId">{{ p.bundleName }}</option>
            </select>
          </div>
          <div class="form-row">
            <textarea
              [(ngModel)]="newDescription"
              placeholder="Description (optional)"
              maxlength="500"
              rows="2"
              class="form-input form-textarea"></textarea>
          </div>
          <div class="form-actions">
            <button class="btn-save" (click)="createIncidencia()" [disabled]="!newTitle.trim() || !newPriority || !newProductId">Submit</button>
            <button class="btn-cancel" (click)="showCreateForm = false">Cancel</button>
          </div>
          <p *ngIf="createError" class="form-error">{{ createError }}</p>
        </div>

        <table class="incidencia-table" *ngIf="!isLoading && incidencias.length > 0">
          <thead>
            <tr>
              <th>Title</th>
              <th>Product</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inc of incidencias">
              <td>
                <a [routerLink]="['/incidencias', inc.incidenciaId]" class="title-link">{{ inc.title }}</a>
              </td>
              <td>{{ inc.productName || '-' }}</td>
              <td>
                <span class="priority-badge" [ngClass]="'priority-' + inc.priority">{{ getPriorityLabel(inc.priority) }}</span>
              </td>
              <td>
                <span class="status-badge" [ngClass]="'status-' + inc.status">{{ getStatusLabel(inc.status) }}</span>
              </td>
              <td>{{ inc.createdAt | date:'mediumDate' }}</td>
              <td class="actions-cell">
                <button class="btn-view" [routerLink]="['/incidencias', inc.incidenciaId]">View</button>
                <ng-container *ngIf="isAdmin">
                  <button class="btn-close" *ngIf="inc.status !== 'closed'" (click)="quickClose(inc)">Close</button>
                </ng-container>
              </td>
            </tr>
          </tbody>
        </table>

        <p *ngIf="!isLoading && incidencias.length === 0 && !errorMessage" class="empty-message">
          No incidents found.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .incidencia-list-container {
      min-height: 100vh;
      background: var(--bg-page);
      font-family: var(--font-family);
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1;
      padding: 30px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    h2 {
      color: var(--primary);
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 10px;
      font-size: 22px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 20px;
    }

    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-select {
      padding: 10px 14px;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 14px;
      min-width: 150px;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    .btn-refresh, .btn-create {
      padding: 10px 20px;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }

    .btn-refresh {
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-create {
      background: var(--primary);
      color: var(--text-on-primary);
    }

    .error-message {
      color: var(--status-disabled);
      background: rgba(244, 67, 54, 0.08);
      padding: 10px 16px;
      border-radius: var(--radius-sm);
      font-size: 14px;
    }

    .incidencia-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .incidencia-table th {
      text-align: left;
      padding: 12px 16px;
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
      border-bottom: 2px solid var(--border-color);
    }

    .incidencia-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
      font-size: 14px;
    }

    .title-link {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }

    .title-link:hover {
      text-decoration: underline;
    }

    .status-badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
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

    .actions-cell {
      white-space: nowrap;
    }

    .actions-cell button {
      padding: 6px 12px;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      font-size: 12px;
      margin-right: 4px;
    }

    .btn-view {
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border-color) !important;
    }

    .btn-close {
      background: #f44336;
      color: white;
    }

    .empty-message {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .create-form {
      margin-bottom: 20px;
      padding: 20px;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
    }

    .create-form h3 {
      margin-top: 0;
      color: var(--primary);
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .form-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .form-input {
      padding: 8px 12px;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 14px;
      flex: 1;
      min-width: 150px;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    .form-textarea {
      flex: 1 1 100%;
      resize: vertical;
      font-family: var(--font-family);
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
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

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class IncidenciaListComponent implements OnInit, OnDestroy {
  private readonly incidenciaService = inject(IncidenciaService);
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  incidencias: IncidenciaDTO[] = [];
  products: ProductDTO[] = [];
  isLoading = false;
  errorMessage = '';
  isAdmin = false;

  filterStatus = '';
  filterPriority = '';

  showCreateForm = false;
  newTitle = '';
  newDescription = '';
  newPriority = '';
  newProductId: number | null = null;
  createError = '';

  private loadTimeout: any = null;

  statusOptions = [
    { value: IncidenciaStatus.OPEN, label: INCIDENCIA_STATUS_LABELS[IncidenciaStatus.OPEN] },
    { value: IncidenciaStatus.IN_PROGRESS, label: INCIDENCIA_STATUS_LABELS[IncidenciaStatus.IN_PROGRESS] },
    { value: IncidenciaStatus.RESOLVED, label: INCIDENCIA_STATUS_LABELS[IncidenciaStatus.RESOLVED] },
    { value: IncidenciaStatus.CLOSED, label: INCIDENCIA_STATUS_LABELS[IncidenciaStatus.CLOSED] },
  ];

  priorityOptions = [
    { value: IncidenciaPriority.LOW, label: INCIDENCIA_PRIORITY_LABELS[IncidenciaPriority.LOW] },
    { value: IncidenciaPriority.MEDIUM, label: INCIDENCIA_PRIORITY_LABELS[IncidenciaPriority.MEDIUM] },
    { value: IncidenciaPriority.HIGH, label: INCIDENCIA_PRIORITY_LABELS[IncidenciaPriority.HIGH] },
    { value: IncidenciaPriority.CRITICAL, label: INCIDENCIA_PRIORITY_LABELS[IncidenciaPriority.CRITICAL] },
  ];

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'ADMIN';
    this.loadIncidencias();
    this.loadProducts();
  }

  loadIncidencias(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.incidencias = [];

    this.loadTimeout = setTimeout(() => {
      if (this.isLoading && this.incidencias.length === 0) {
        this.isLoading = false;
        this.errorMessage = 'Loading took too long. Please check if backend is running.';
        this.cdr.detectChanges();
      }
    }, 10000);

    const filters: IncidenciaFilters = {};
    if (this.filterStatus) {
      filters.status = this.filterStatus;
    }
    if (this.filterPriority) {
      filters.priority = this.filterPriority;
    }

    this.incidenciaService.getIncidencias(filters).subscribe({
      next: (data) => {
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }
        this.incidencias = data;
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
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Session expired. Please login again.';
          this.router.navigate(['/login']);
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to backend. Is it running?';
        } else {
          this.errorMessage = `Error loading incidents (${err.status}): ${err.statusText || err.message}`;
        }
        this.cdr.detectChanges();
      }
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: () => {
        this.products = [];
      }
    });
  }

  applyFilters(): void {
    this.loadIncidencias();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.newTitle = '';
      this.newDescription = '';
      this.newPriority = '';
      this.newProductId = null;
      this.createError = '';
    }
  }

  createIncidencia(): void {
    const title = this.newTitle.trim();
    if (!title || !this.newPriority || !this.newProductId) return;

    this.incidenciaService.createIncidencia({
      title,
      description: this.newDescription.trim() || undefined,
      priority: this.newPriority,
      productId: this.newProductId
    }).subscribe({
      next: (created) => {
        this.showCreateForm = false;
        this.createError = '';
        this.router.navigate(['/incidencias', created.incidenciaId]);
      },
      error: (err) => {
        this.createError = 'Failed to create: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  quickClose(inc: IncidenciaDTO): void {
    this.incidenciaService.transitionStatus(inc.incidenciaId, 'closed').subscribe({
      next: () => this.loadIncidencias(),
      error: (err) => {
        this.errorMessage = 'Failed to close: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  getStatusLabel(status: string): string {
    return INCIDENCIA_STATUS_LABELS[status] || status;
  }

  getPriorityLabel(priority: string): string {
    return INCIDENCIA_PRIORITY_LABELS[priority] || priority;
  }

  ngOnDestroy(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }
  }
}
