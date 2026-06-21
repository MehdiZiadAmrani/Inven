import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemTypeService, ItemTypeDTO } from '../../services/item-type.service';

@Component({
  selector: 'app-item-type-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="item-type-container">
      <h2>Manage Device Types</h2>

      <div class="create-form">
        <input
          type="text"
          [(ngModel)]="newTypeName"
          placeholder="New type name (e.g. Tablet)"
          (keyup.enter)="createType()"
          maxlength="100" />
        <button class="btn-create" (click)="createType()" [disabled]="!newTypeName.trim()">Create</button>
      </div>

      <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>

      <table *ngIf="itemTypes.length > 0" class="item-type-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of itemTypes" [class.inactive]="t.status === 'inactive'">
            <td>
              <ng-container *ngIf="editingId !== t.itemTypeId; else editCell">
                {{ t.name }}
              </ng-container>
              <ng-template #editCell>
                <input
                  type="text"
                  [(ngModel)]="editName"
                  (keyup.enter)="saveEdit(t)"
                  (keyup.escape)="cancelEdit()"
                  maxlength="100"
                  class="edit-input" />
              </ng-template>
            </td>
            <td>
              <span class="status-badge" [class.active]="t.status === 'active'" [class.inactive-badge]="t.status === 'inactive'">
                {{ t.status }}
              </span>
            </td>
            <td>{{ t.createdAt | date:'mediumDate' }}</td>
            <td class="actions-cell">
              <ng-container *ngIf="editingId !== t.itemTypeId; else editActions">
                <button class="btn-edit" (click)="startEdit(t)">Edit</button>
                <button
                  class="btn-toggle"
                  [class.deactivate]="t.status === 'active'"
                  (click)="toggleStatus(t)">
                  {{ t.status === 'active' ? 'Deactivate' : 'Activate' }}
                </button>
              </ng-container>
              <ng-template #editActions>
                <button class="btn-save-inline" (click)="saveEdit(t)">Save</button>
                <button class="btn-cancel-inline" (click)="cancelEdit()">Cancel</button>
              </ng-template>
            </td>
          </tr>
        </tbody>
      </table>

      <p *ngIf="itemTypes.length === 0 && !errorMessage" class="empty-message">
        No device types found. Create one above.
      </p>
    </div>
  `,
  styles: [`
    .item-type-container {
      max-width: 800px;
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
    }

    .create-form input {
      flex: 1;
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

    .item-type-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .item-type-table th {
      text-align: left;
      padding: 12px 16px;
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
      border-bottom: 2px solid var(--border-color);
    }

    .item-type-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
      font-size: 14px;
    }

    .item-type-table tr.inactive td {
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

    .status-badge.inactive-badge {
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
export class ItemTypeManagementComponent implements OnInit {
  private readonly itemTypeService = inject(ItemTypeService);

  itemTypes: ItemTypeDTO[] = [];
  newTypeName = '';
  errorMessage = '';
  editingId: number | null = null;
  editName = '';

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.itemTypeService.getAll().subscribe({
      next: (data) => {
        this.itemTypes = data;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Failed to load types: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  createType(): void {
    const name = this.newTypeName.trim();
    if (!name) return;
    this.itemTypeService.create({ name }).subscribe({
      next: () => {
        this.newTypeName = '';
        this.errorMessage = '';
        this.loadTypes();
      },
      error: (err) => {
        this.errorMessage = 'Failed to create: ' + (err.error?.message || name + ' already exists.');
      }
    });
  }

  startEdit(itemType: ItemTypeDTO): void {
    this.editingId = itemType.itemTypeId;
    this.editName = itemType.name;
  }

  saveEdit(itemType: ItemTypeDTO): void {
    const name = this.editName.trim();
    if (!name || name === itemType.name) {
      this.cancelEdit();
      return;
    }
    this.itemTypeService.update(itemType.itemTypeId, { name }).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadTypes();
      },
      error: (err) => {
        this.errorMessage = 'Failed to update: ' + (err.error?.message || 'Name already exists.');
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editName = '';
  }

  toggleStatus(itemType: ItemTypeDTO): void {
    const newStatus = itemType.status === 'active' ? 'inactive' : 'active';
    this.itemTypeService.updateStatus(itemType.itemTypeId, newStatus).subscribe({
      next: () => this.loadTypes(),
      error: (err) => {
        this.errorMessage = 'Failed to update status: ' + (err.error?.message || 'Please try again.');
      }
    });
  }
}
