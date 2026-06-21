import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService, LocationDTO } from '../../services/location.service';
import { LOCATION_TYPE, LOCATION_TYPE_LABELS } from '../../config/enums';

@Component({
  selector: 'app-location-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="location-container">
      <h2>Manage Locations</h2>

      <div class="create-form">
        <input
          type="text"
          [(ngModel)]="newName"
          placeholder="Location name (e.g. Aula 1)"
          (keyup.enter)="createLocation()"
          maxlength="50" />
        <select [(ngModel)]="newType">
          <option value="">-- Type --</option>
          <option *ngFor="let t of locationTypes" [value]="t.value">{{ t.label }}</option>
        </select>
        <input
          type="text"
          [(ngModel)]="newDescription"
          placeholder="Description (optional)"
          (keyup.enter)="createLocation()"
          maxlength="200" />
        <button class="btn-create" (click)="createLocation()" [disabled]="!newName.trim() || !newType">Create</button>
      </div>

      <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>

      <table *ngIf="locations.length > 0" class="location-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let loc of locations" [class.disabled]="loc.status === 'disabled'">
            <td>
              <ng-container *ngIf="editingId !== loc.locationId; else editNameCell">
                {{ loc.name }}
              </ng-container>
              <ng-template #editNameCell>
                <input
                  type="text"
                  [(ngModel)]="editName"
                  (keyup.enter)="saveEdit(loc)"
                  (keyup.escape)="cancelEdit()"
                  maxlength="50"
                  class="edit-input" />
              </ng-template>
            </td>
            <td>
              <ng-container *ngIf="editingId !== loc.locationId; else editTypeCell">
                <span class="type-badge">{{ getTypeLabel(loc.type) }}</span>
              </ng-container>
              <ng-template #editTypeCell>
                <select [(ngModel)]="editType" class="edit-input">
                  <option *ngFor="let t of locationTypes" [value]="t.value">{{ t.label }}</option>
                </select>
              </ng-template>
            </td>
            <td>
              <ng-container *ngIf="editingId !== loc.locationId; else editDescCell">
                {{ loc.description || '-' }}
              </ng-container>
              <ng-template #editDescCell>
                <input
                  type="text"
                  [(ngModel)]="editDescription"
                  (keyup.enter)="saveEdit(loc)"
                  (keyup.escape)="cancelEdit()"
                  maxlength="200"
                  class="edit-input" />
              </ng-template>
            </td>
            <td>
              <span class="status-badge" [class.active]="loc.status === 'active'" [class.disabled-badge]="loc.status === 'disabled'">
                {{ loc.status }}
              </span>
            </td>
            <td>{{ loc.createdAt | date:'mediumDate' }}</td>
            <td class="actions-cell">
              <ng-container *ngIf="editingId !== loc.locationId; else editActions">
                <button class="btn-edit" (click)="startEdit(loc)">Edit</button>
                <button
                  class="btn-toggle"
                  [class.deactivate]="loc.status === 'active'"
                  (click)="toggleStatus(loc)">
                  {{ loc.status === 'active' ? 'Disable' : 'Enable' }}
                </button>
              </ng-container>
              <ng-template #editActions>
                <button class="btn-save-inline" (click)="saveEdit(loc)">Save</button>
                <button class="btn-cancel-inline" (click)="cancelEdit()">Cancel</button>
              </ng-template>
            </td>
          </tr>
        </tbody>
      </table>

      <p *ngIf="locations.length === 0 && !errorMessage" class="empty-message">
        No locations found. Create one above.
      </p>
    </div>
  `,
  styles: [`
    .location-container {
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

    .create-form input,
    .create-form select {
      padding: 10px 14px;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 14px;
    }

    .create-form input:focus,
    .create-form select:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    .create-form input:nth-child(1) {
      flex: 1;
      min-width: 160px;
    }

    .create-form select {
      min-width: 130px;
    }

    .create-form input:nth-child(3) {
      flex: 1.5;
      min-width: 160px;
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

    .location-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .location-table th {
      text-align: left;
      padding: 12px 16px;
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
      border-bottom: 2px solid var(--border-color);
    }

    .location-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
      font-size: 14px;
    }

    .location-table tr.disabled td {
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

    .type-badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
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
export class LocationManagementComponent implements OnInit {
  private readonly locationService = inject(LocationService);

  locations: LocationDTO[] = [];
  newName = '';
  newType = '';
  newDescription = '';
  errorMessage = '';
  editingId: number | null = null;
  editName = '';
  editType = '';
  editDescription = '';

  locationTypes = [
    { value: LOCATION_TYPE.CLASSROOM, label: LOCATION_TYPE_LABELS[LOCATION_TYPE.CLASSROOM] },
    { value: LOCATION_TYPE.LAB, label: LOCATION_TYPE_LABELS[LOCATION_TYPE.LAB] },
    { value: LOCATION_TYPE.OFFICE, label: LOCATION_TYPE_LABELS[LOCATION_TYPE.OFFICE] },
    { value: LOCATION_TYPE.WAREHOUSE, label: LOCATION_TYPE_LABELS[LOCATION_TYPE.WAREHOUSE] },
  ];

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (data) => {
        this.locations = data;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Failed to load locations: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  createLocation(): void {
    const name = this.newName.trim();
    if (!name || !this.newType) return;
    this.locationService.createLocation({
      name,
      type: this.newType,
      description: this.newDescription.trim()
    }).subscribe({
      next: () => {
        this.newName = '';
        this.newType = '';
        this.newDescription = '';
        this.errorMessage = '';
        this.loadLocations();
      },
      error: (err) => {
        this.errorMessage = 'Failed to create: ' + (err.error?.message || name + ' already exists.');
      }
    });
  }

  startEdit(loc: LocationDTO): void {
    this.editingId = loc.locationId;
    this.editName = loc.name;
    this.editType = loc.type;
    this.editDescription = loc.description || '';
  }

  saveEdit(loc: LocationDTO): void {
    const name = this.editName.trim();
    if (!name) {
      this.cancelEdit();
      return;
    }
    this.locationService.updateLocation(loc.locationId, {
      name,
      type: this.editType,
      description: this.editDescription.trim()
    }).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadLocations();
      },
      error: (err) => {
        this.errorMessage = 'Failed to update: ' + (err.error?.message || 'Name already exists.');
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editName = '';
    this.editType = '';
    this.editDescription = '';
  }

  toggleStatus(loc: LocationDTO): void {
    const newStatus = loc.status === 'active' ? 'disabled' : 'active';
    this.locationService.toggleLocationStatus(loc.locationId, newStatus).subscribe({
      next: () => this.loadLocations(),
      error: (err) => {
        this.errorMessage = 'Failed to update status: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  getTypeLabel(type: string): string {
    return LOCATION_TYPE_LABELS[type] || type;
  }
}
