import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ItemService, ItemType, ItemDTO } from '../../services/item.service';
import { QrCodeService } from '../../services/qr-code.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

interface FlatItem {
  id: number;
  type: ItemType;
  typeLabel: string;
  brand: string;
  model: string;
  status: string;
  createdAt: string;
}

const ITEM_LABELS: Record<ItemType, string> = {
  computer: 'Computer',
  monitor: 'Monitor',
  keyboard: 'Keyboard',
  mouse: 'Mouse',
};

const TYPE_ROUTES: Record<ItemType, string> = {
  computer: 'computers',
  monitor: 'monitors',
  keyboard: 'keyboards',
  mouse: 'mice',
};

@Component({
  selector: 'app-all-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="all-items-container">
      <div class="content">
        <h2>All Items</h2>

        <div class="controls">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Search by type, brand, or model..."
            class="search-input"
          />
          <button class="btn-refresh" (click)="loadAllItems()" [disabled]="loading()">
            {{ loading() ? 'Loading...' : 'Refresh' }}
          </button>
        </div>

        @if (loading()) {
          <app-loading-spinner message="Loading all items..." />
        }

        @if (error()) {
          <div class="error-container">
            <p>{{ error() }}</p>
            <button class="btn-retry" (click)="loadAllItems()">Retry</button>
          </div>
        }

        @if (!loading() && !error() && filteredItems().length > 0) {
          <table class="item-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredItems(); track item.id + '-' + item.type) {
                <tr [class.disabled]="item.status === 'disabled'">
                  <td>
                    <span class="type-badge" [class.type-computer]="item.type === 'computer'"
                      [class.type-monitor]="item.type === 'monitor'"
                      [class.type-keyboard]="item.type === 'keyboard'"
                      [class.type-mouse]="item.type === 'mouse'">
                      {{ item.typeLabel }}
                    </span>
                  </td>
                  <td>{{ item.brand }}</td>
                  <td>{{ item.model }}</td>
                  <td><app-status-badge [status]="item.status" /></td>
                  <td>{{ item.createdAt | date:'mediumDate' }}</td>
                  <td class="actions-cell">
                    <a class="btn-view" [routerLink]="['/' + TYPE_ROUTES[item.type], item.id]">View</a>
                    <button class="btn-qr" (click)="showQR(item)" title="View QR Code">QR</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }

        @if (!loading() && !error() && filteredItems().length === 0) {
          <app-empty-state message="No items found." />
        }
      </div>

      <!-- QR Code Overlay -->
      @if (qrItem()) {
        <div class="qr-overlay" (click)="closeQR()">
          <div class="qr-modal" (click)="$event.stopPropagation()">
            <button class="qr-close" (click)="closeQR()">&times;</button>
            <h3>QR Code</h3>
            <p class="qr-item-name">{{ qrItem()?.brand }} {{ qrItem()?.model }}</p>
            @if (qrDataUrl()) {
              <div class="qr-modal-image">
                <img [src]="qrDataUrl()" alt="QR Code" />
              </div>
              <button class="btn-download-qr" (click)="downloadQR()">Download QR</button>
            } @else {
              <p class="qr-generating">Generating QR Code...</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--bg-page);
      font-family: var(--font-family);
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

    .btn-refresh {
      padding: 10px 20px;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-refresh:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    .type-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .type-computer { background: rgba(33, 150, 243, 0.2); color: #90CAF9; }
    .type-monitor  { background: rgba(76, 175, 80, 0.2);  color: #A5D6A7; }
    .type-keyboard { background: rgba(255, 152, 0, 0.2);  color: #FFCC80; }
    .type-mouse    { background: rgba(156, 39, 176, 0.2); color: #CE93D8; }

    .actions-cell {
      white-space: nowrap;
      display: flex;
      gap: 4px;
    }

    .btn-view, .btn-qr {
      display: inline-block;
      padding: 6px 12px;
      border: 1px solid var(--border-color) !important;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 12px;
      text-decoration: none;
      cursor: pointer;
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
    }

    .btn-view:hover, .btn-qr:hover {
      background: var(--bg-surface);
      border-color: var(--primary) !important;
    }

    .btn-qr {
      background: rgba(255, 214, 0, 0.15);
      border-color: rgba(255, 214, 0, 0.3) !important;
      color: var(--primary);
    }

    .btn-qr:hover {
      background: rgba(255, 214, 0, 0.25);
    }

    /* QR Overlay */
    .qr-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 20px;
    }

    .qr-modal {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 32px;
      max-width: 360px;
      width: 100%;
      text-align: center;
      position: relative;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .qr-modal h3 {
      margin: 0 0 4px;
      color: var(--primary);
      font-size: 18px;
      font-weight: 600;
    }

    .qr-item-name {
      color: var(--text-secondary);
      font-size: 14px;
      margin: 0 0 20px;
    }

    .qr-close {
      position: absolute;
      top: 12px;
      right: 16px;
      background: none;
      border: none;
      font-size: 28px;
      color: var(--text-secondary);
      cursor: pointer;
      line-height: 1;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qr-close:hover {
      color: var(--text-primary);
    }

    .qr-modal-image {
      margin: 0 auto 20px;
      display: flex;
      justify-content: center;
    }

    .qr-modal-image img {
      width: 200px;
      height: 200px;
      image-rendering: pixelated;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 8px;
      background: white;
    }

    .qr-generating {
      color: var(--text-muted);
      padding: 60px 0;
      font-size: 14px;
    }

    .btn-download-qr {
      padding: 10px 24px;
      background: var(--primary);
      color: var(--text-on-primary);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: opacity 150ms;
    }

    .btn-download-qr:hover {
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .content {
        padding: 16px;
      }

      .item-table th, .item-table td {
        padding: 8px 10px;
        font-size: 13px;
      }

      .actions-cell {
        flex-direction: column;
        gap: 4px;
      }

      .qr-modal {
        padding: 24px 16px;
      }
    }
  `],
})
export class AllItemsComponent implements OnInit {
  private readonly itemService = inject(ItemService);
  private readonly qrCodeService = inject(QrCodeService);

  protected readonly TYPE_ROUTES = TYPE_ROUTES;
  protected readonly searchQuery = signal('');
  protected readonly allItems = signal<FlatItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly qrItem = signal<FlatItem | null>(null);
  protected readonly qrDataUrl = signal('');

  protected filteredItems = signal<FlatItem[]>([]);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadAllItems();
  }

  loadAllItems(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      computers: this.itemService.getAll('computer').pipe(catchError(() => of([]))),
      monitors: this.itemService.getAll('monitor').pipe(catchError(() => of([]))),
      keyboards: this.itemService.getAll('keyboard').pipe(catchError(() => of([]))),
      mice: this.itemService.getAll('mouse').pipe(catchError(() => of([]))),
    }).subscribe({
      next: (data) => {
        const flat: FlatItem[] = [
          ...this.flatten('computer', data.computers),
          ...this.flatten('monitor', data.monitors),
          ...this.flatten('keyboard', data.keyboards),
          ...this.flatten('mouse', data.mice),
        ];

        this.allItems.set(flat);
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load items. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.applyFilter(), 200);
  }

  protected showQR(item: FlatItem): void {
    this.qrItem.set(item);
    this.qrDataUrl.set('');
    const baseUrl = window.location.origin;
    const route = TYPE_ROUTES[item.type];
    const qrData = `${baseUrl}/${route}/${item.id}`;
    this.qrCodeService.generateQRCode(qrData).then((dataUrl) => {
      this.qrDataUrl.set(dataUrl);
    });
  }

  protected closeQR(): void {
    this.qrItem.set(null);
    this.qrDataUrl.set('');
  }

  protected downloadQR(): void {
    const url = this.qrDataUrl();
    const item = this.qrItem();
    if (!url || !item) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.brand}-${item.model}-qr.png`.replace(/\s+/g, '-').toLowerCase();
    link.click();
  }

  private applyFilter(): void {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) {
      this.filteredItems.set(this.allItems());
      return;
    }

    this.filteredItems.set(
      this.allItems().filter(
        (item) =>
          item.typeLabel.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q),
      ),
    );
  }

  private flatten(type: ItemType, items: ItemDTO[]): FlatItem[] {
    return items.map((item) => ({
      id: (item as any).computerId ?? (item as any).monitorId ?? (item as any).keyboardId ?? (item as any).mouseId ?? 0,
      type,
      typeLabel: ITEM_LABELS[type],
      brand: (item as any).brand ?? '',
      model: (item as any).model ?? '',
      status: (item as any).status ?? 'available',
      createdAt: (item as any).createdAt ?? '',
    }));
  }
}
