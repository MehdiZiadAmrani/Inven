import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandService, BrandDTO } from '../../services/brand.service';

@Component({
  selector: 'app-brand-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="brand-container">
      <h2>Manage Brands</h2>

      <div class="create-form">
        <input
          type="text"
          [(ngModel)]="newName"
          placeholder="Brand name (e.g. Dell)"
          (keyup.enter)="createBrand()"
          maxlength="50" />
        <input
          type="text"
          [(ngModel)]="newDescription"
          placeholder="Description (optional)"
          (keyup.enter)="createBrand()"
          maxlength="200" />
        <button class="btn-create" (click)="createBrand()" [disabled]="!newName.trim()">Create</button>
      </div>

      <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>

      <table *ngIf="brands.length > 0" class="brand-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let brand of brands" [class.disabled]="brand.status === 'disabled'">
            <td>
              <ng-container *ngIf="editingId !== brand.brandId; else editNameCell">
                {{ brand.name }}
              </ng-container>
              <ng-template #editNameCell>
                <input
                  type="text"
                  [(ngModel)]="editName"
                  (keyup.enter)="saveEdit(brand)"
                  (keyup.escape)="cancelEdit()"
                  maxlength="50"
                  class="edit-input" />
              </ng-template>
            </td>
            <td>
              <ng-container *ngIf="editingId !== brand.brandId; else editDescCell">
                {{ brand.description || '-' }}
              </ng-container>
              <ng-template #editDescCell>
                <input
                  type="text"
                  [(ngModel)]="editDescription"
                  (keyup.enter)="saveEdit(brand)"
                  (keyup.escape)="cancelEdit()"
                  maxlength="200"
                  class="edit-input" />
              </ng-template>
            </td>
            <td>
              <span class="status-badge" [class.active]="brand.status === 'active'" [class.disabled-badge]="brand.status === 'disabled'">
                {{ brand.status }}
              </span>
            </td>
            <td>{{ brand.createdAt | date:'mediumDate' }}</td>
            <td class="actions-cell">
              <ng-container *ngIf="editingId !== brand.brandId; else editActions">
                <button class="btn-edit" (click)="startEdit(brand)">Edit</button>
                <button
                  class="btn-toggle"
                  [class.deactivate]="brand.status === 'active'"
                  (click)="toggleStatus(brand)">
                  {{ brand.status === 'active' ? 'Disable' : 'Enable' }}
                </button>
              </ng-container>
              <ng-template #editActions>
                <button class="btn-save-inline" (click)="saveEdit(brand)">Save</button>
                <button class="btn-cancel-inline" (click)="cancelEdit()">Cancel</button>
              </ng-template>
            </td>
          </tr>
        </tbody>
      </table>

      <p *ngIf="brands.length === 0 && !errorMessage" class="empty-message">
        No brands found. Create one above.
      </p>
    </div>
  `,
  styles: [`
    .brand-container {
      max-width: 900px;
      margin: 0 auto;
    }

    h2 {
      color: var(--primary);
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 10px;
      font-size: 20px;
      font-weight: 600;
      margin-top: 0;
    }

    .create-form {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .create-form input {
      padding: 10px 14px;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 14px;
    }

    .create-form input:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    .create-form input:nth-child(1) {
      flex: 1;
      min-width: 150px;
    }

    .create-form input:nth-child(2) {
      flex: 1.5;
      min-width: 200px;
    }

    .btn-create {
      padding: 10px 24px;
      background: var(--primary);
      color: var(--text-on-primary);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      white-space: nowrap;
    }

    .btn-create:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-message {
      color: var(--status-disabled);
      background: rgba(244, 67, 54, 0.08);
      padding: 10px 16px;
      border-radius: var(--radius-sm);
      font-size: 14px;
    }

    .brand-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .brand-table th {
      text-align: left;
      padding: 12px 16px;
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
      border-bottom: 2px solid var(--border-color);
    }

    .brand-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
      font-size: 14px;
    }

    .brand-table tr.disabled td {
      opacity: 0.6;
      color: var(--text-secondary);
    }

    .edit-input {
      padding: 6px 10px;
      background: var(--bg-input);
      border: 1px solid var(--border-focus);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 14px;
      width: 100%;
      box-sizing: border-box;
    }

    .status-badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .status-badge.active {
      background: var(--status-available);
      color: white;
    }

    .status-badge.disabled-badge {
      background: var(--status-disabled);
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
      margin-right: 6px;
    }

    .btn-edit {
      background: var(--btn-edit);
      color: white;
    }

    .btn-toggle {
      background: var(--status-disabled);
      color: white;
    }

    .btn-toggle.deactivate {
      background: #e65100;
      color: white;
    }

    .btn-save-inline {
      background: var(--primary);
      color: var(--text-on-primary);
    }

    .btn-cancel-inline {
      background: var(--btn-cancel);
      color: white;
    }

    .empty-message {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
      font-size: 14px;
    }
  `]
})
export class BrandManagementComponent implements OnInit {
  private readonly brandService = inject(BrandService);

  brands: BrandDTO[] = [];
  newName = '';
  newDescription = '';
  errorMessage = '';
  editingId: number | null = null;
  editName = '';
  editDescription = '';

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.brandService.getBrands().subscribe({
      next: (data) => {
        this.brands = data;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Failed to load brands: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  createBrand(): void {
    const name = this.newName.trim();
    if (!name) return;
    this.brandService.createBrand({
      name,
      description: this.newDescription.trim()
    }).subscribe({
      next: () => {
        this.newName = '';
        this.newDescription = '';
        this.errorMessage = '';
        this.loadBrands();
      },
      error: (err) => {
        this.errorMessage = 'Failed to create: ' + (err.error?.message || name + ' already exists.');
      }
    });
  }

  startEdit(brand: BrandDTO): void {
    this.editingId = brand.brandId;
    this.editName = brand.name;
    this.editDescription = brand.description || '';
  }

  saveEdit(brand: BrandDTO): void {
    const name = this.editName.trim();
    if (!name) {
      this.cancelEdit();
      return;
    }
    this.brandService.updateBrand(brand.brandId, {
      name,
      description: this.editDescription.trim()
    }).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadBrands();
      },
      error: (err) => {
        this.errorMessage = 'Failed to update: ' + (err.error?.message || 'Name already exists.');
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editName = '';
    this.editDescription = '';
  }

  toggleStatus(brand: BrandDTO): void {
    const newStatus = brand.status === 'active' ? 'disabled' : 'active';
    this.brandService.toggleBrandStatus(brand.brandId, newStatus).subscribe({
      next: () => this.loadBrands(),
      error: (err) => {
        this.errorMessage = 'Failed to update status: ' + (err.error?.message || 'Please try again.');
      }
    });
  }
}
