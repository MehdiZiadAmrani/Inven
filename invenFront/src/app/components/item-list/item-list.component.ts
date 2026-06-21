import { Component, Input, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ItemService, ItemType, ItemDTO, ItemCreateDTO, ItemUpdateDTO } from '../../services/item.service';
import { AuthService } from '../../services/auth.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

const ITEM_LABELS: Record<ItemType, string> = {
  computer: 'Computer',
  monitor: 'Monitor',
  keyboard: 'Keyboard',
  mouse: 'Mouse'
};

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, LoadingSpinnerComponent, EmptyStateComponent, ConfirmDialogComponent],
  template: `
    <div class="item-list-container">
      <div class="content">
        <h2>{{ typeLabel }}s</h2>

        <div class="controls">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            [placeholder]="'Search ' + typeLabel.toLowerCase() + 's by brand or model...'"
            class="search-input"
          />
          <button class="btn-refresh" (click)="loadItems()" [disabled]="isLoading">{{ isLoading ? 'Loading...' : 'Refresh' }}</button>
          <button class="btn-add" *ngIf="isAdmin" (click)="startCreate()" [disabled]="isLoading">Create {{ typeLabel }}</button>
        </div>

        <app-loading-spinner *ngIf="isLoading" [message]="'Loading ' + typeLabel.toLowerCase() + 's...'" />

        <div *ngIf="!isLoading && errorMessage" class="error-container">
          <p>{{ errorMessage }}</p>
          <button class="btn-retry" (click)="loadItems()">Retry</button>
        </div>

        <table class="item-table" *ngIf="!isLoading && !errorMessage && filteredItems.length > 0">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Model</th>
              <th>Serial #</th>
              <th>Code</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredItems" [class.disabled]="getStatus(item) === 'disabled'">
              <td>
                <ng-container *ngIf="editingId !== getId(item); else editBrandCell">
                  {{ getBrand(item) }}
                </ng-container>
                <ng-template #editBrandCell>
                  <input type="text" [(ngModel)]="editBrand" (keyup.enter)="saveEdit(item)" (keyup.escape)="cancelEdit()" class="edit-input" />
                </ng-template>
              </td>
              <td>
                <ng-container *ngIf="editingId !== getId(item); else editModelCell">
                  {{ getModel(item) }}
                </ng-container>
                <ng-template #editModelCell>
                  <input type="text" [(ngModel)]="editModel" (keyup.enter)="saveEdit(item)" (keyup.escape)="cancelEdit()" class="edit-input" />
                </ng-template>
              </td>
              <td>{{ getField(item, 'serialNumber') || '-' }}</td>
              <td>{{ getField(item, 'inventoryCode') || '-' }}</td>
              <td>
                <app-status-badge [status]="getStatus(item)" />
              </td>
              <td>{{ getCreatedAt(item) | date:'mediumDate' }}</td>
              <td class="actions-cell">
                <ng-container *ngIf="editingId !== getId(item); else editActions">
                  <button class="btn-view" (click)="viewItem(item)">View</button>
                  <button class="btn-edit" *ngIf="isAdmin" (click)="startEdit(item)">Edit</button>
                  <button class="btn-deactivate" *ngIf="isAdmin" (click)="requestDeactivate(item)">Deactivate</button>
                </ng-container>
                <ng-template #editActions>
                  <button class="btn-save" (click)="saveEdit(item)">Save</button>
                  <button class="btn-cancel" (click)="cancelEdit()">Cancel</button>
                </ng-template>
              </td>
            </tr>
          </tbody>
        </table>

        <app-empty-state *ngIf="!isLoading && !errorMessage && filteredItems.length === 0" [message]="'No ' + typeLabel.toLowerCase() + 's found.'">
          <span *ngIf="isAdmin">Create one to get started!</span>
        </app-empty-state>
      </div>
    </div>

    <app-confirm-dialog
      [visible]="showDeactivateModal"
      title="Deactivate {{ typeLabel }}"
      [message]="'Are you sure you want to deactivate this ' + typeLabel.toLowerCase() + '? It can be reactivated later.'"
      confirmText="Deactivate"
      (confirmed)="confirmDeactivate()"
      (cancelled)="showDeactivateModal = false">
    </app-confirm-dialog>
  `,
  styles: [`
    .item-list-container {
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
    }

    .search-input {
      flex: 1;
      min-width: 200px;
      padding: 10px 14px;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 14px;
    }

    .search-input::placeholder {
      color: var(--text-muted);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    .btn-refresh, .btn-add {
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

    .btn-add {
      background: var(--primary);
      color: var(--text-on-primary);
    }

    .error-container {
      text-align: center;
      padding: 30px;
      color: var(--status-disabled);
      background: rgba(244, 67, 54, 0.08);
      border: 1px solid rgba(244, 67, 54, 0.3);
      border-radius: var(--radius-md);
    }

    .btn-retry {
      margin-top: 10px;
      padding: 8px 20px;
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
    }

    .item-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .item-table th {
      text-align: left;
      padding: 12px 16px;
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
      border-bottom: 2px solid var(--border-color);
    }

    .item-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
      font-size: 14px;
    }

    .item-table tr.disabled td {
      opacity: 0.5;
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

    .btn-edit {
      background: var(--btn-edit);
      color: white;
    }

    .btn-deactivate {
      background: var(--btn-delete);
      color: white;
    }

    .btn-save {
      background: var(--primary);
      color: var(--text-on-primary);
    }

    .btn-cancel {
      background: var(--btn-cancel);
      color: white;
    }



    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ItemListComponent implements OnInit, OnDestroy {
  @Input({ required: true }) itemType!: ItemType;

  items: ItemDTO[] = [];
  searchQuery = '';
  isLoading = false;
  errorMessage = '';
  isAdmin = false;

  editingId: number | null = null;
  editBrand = '';
  editModel = '';

  showDeactivateModal = false;
  deactivateTargetId: number | null = null;

  private readonly itemService = inject(ItemService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private loadTimeout: any = null;

  get typeLabel(): string {
    return ITEM_LABELS[this.itemType];
  }

  get filteredItems(): ItemDTO[] {
    if (!this.searchQuery.trim()) return this.items;
    const q = this.searchQuery.toLowerCase().trim();
    return this.items.filter(item => {
      const brand = this.getBrand(item).toLowerCase();
      const model = this.getModel(item).toLowerCase();
      return brand.includes(q) || model.includes(q);
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'ADMIN';
    this.loadItems();
  }

  loadItems(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.items = [];

    this.loadTimeout = setTimeout(() => {
      if (this.isLoading && this.items.length === 0) {
        this.isLoading = false;
        this.errorMessage = 'Loading took too long. Please check if backend is running.';
        this.cdr.detectChanges();
      }
    }, 10000);

    this.itemService.getAll(this.itemType).subscribe({
      next: (data) => {
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }
        this.items = data;
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
          this.errorMessage = `Error loading ${this.typeLabel.toLowerCase()}s (${err.status}): ${err.statusText || err.message}`;
        }
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(): void {
    this.cdr.markForCheck();
  }

  startCreate(): void {
    this.router.navigate([`/${this.getEndpoint(this.itemType)}/create`]);
  }

  private getEndpoint(type: ItemType): string {
    const endpoints: Record<ItemType, string> = {
      computer: 'computers',
      monitor: 'monitors',
      keyboard: 'keyboards',
      mouse: 'mice'
    };
    return endpoints[type];
  }

  startEdit(item: ItemDTO): void {
    this.editingId = this.getId(item);
    this.editBrand = this.getBrand(item);
    this.editModel = this.getModel(item);
  }

  saveEdit(item: ItemDTO): void {
    const brand = this.editBrand.trim();
    const model = this.editModel.trim();
    if (!brand || !model) {
      this.cancelEdit();
      return;
    }
    if (brand === this.getBrand(item) && model === this.getModel(item)) {
      this.cancelEdit();
      return;
    }

    this.itemService.update(this.itemType, this.getId(item), { brand, model }).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadItems();
      },
      error: (err) => {
        this.errorMessage = 'Failed to update: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editBrand = '';
    this.editModel = '';
  }

  viewItem(item: ItemDTO): void {
    this.router.navigate([`/${ENDPOINTS_MAP[this.itemType]}`, this.getId(item)]);
  }

  requestDeactivate(item: ItemDTO): void {
    this.deactivateTargetId = this.getId(item);
    this.showDeactivateModal = true;
  }

  confirmDeactivate(): void {
    if (this.deactivateTargetId === null) return;
    this.itemService.updateStatus(this.itemType, this.deactivateTargetId, 'disabled').subscribe({
      next: () => {
        this.showDeactivateModal = false;
        this.deactivateTargetId = null;
        this.loadItems();
      },
      error: (err) => {
        this.errorMessage = 'Failed to deactivate: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }
  }

  getId(item: ItemDTO): number {
    return (item as any).computerId ?? (item as any).monitorId ?? (item as any).keyboardId ?? (item as any).mouseId ?? 0;
  }

  getBrand(item: ItemDTO): string {
    return (item as any).brand ?? '';
  }

  getModel(item: ItemDTO): string {
    return (item as any).model ?? '';
  }

  getStatus(item: ItemDTO): string {
    return (item as any).status ?? 'available';
  }

  getCreatedAt(item: ItemDTO): string {
    return (item as any).createdAt ?? '';
  }

  getField(item: ItemDTO, field: string): any {
    return (item as any)[field] ?? null;
  }
}

const ENDPOINTS_MAP: Record<ItemType, string> = {
  computer: 'computers',
  monitor: 'monitors',
  keyboard: 'keyboards',
  mouse: 'mice'
};
