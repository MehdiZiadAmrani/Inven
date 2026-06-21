import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { ProductService, ProductDTO } from '../../services/product.service';
import { ComponentService, ComputerItem, MonitorItem, MouseItem, KeyboardItem } from '../../services/component.service';
import { ItemTypeService, ItemTypeDTO } from '../../services/item-type.service';
import { QrCodeService } from '../../services/qr-code.service';
import { AuthService } from '../../services/auth.service';
import { ProductLocationService, ProductLocationDTO } from '../../services/product-location.service';
import { PRODUCT_STATUS_LABELS } from '../../config/enums';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProductFormComponent } from '../../shared/components/product-form/product-form.component';
import { LocationHistoryComponent } from '../../shared/components/location-history/location-history.component';
import { QrScannerComponent } from '../../shared/components/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, LoadingSpinnerComponent, EmptyStateComponent, ProductFormComponent, LocationHistoryComponent, QrScannerComponent],
  template: `
    <div class="product-detail-container">
      <app-loading-spinner *ngIf="isLoading" message="Loading product..." />

      <!-- Error States -->
      <div *ngIf="!isLoading && errorMessage" class="error-container">
        <p>{{ errorMessage }}</p>
        <button class="btn-back" (click)="goBack()">← Back to Products</button>
      </div>

      <!-- New Product Form -->
      <div class="content" *ngIf="!isLoading && isNew && isEdit">
        <app-product-form
          [form]="editProduct"
          [computers]="computers"
          [monitors]="monitors"
          [mice]="mice"
          [keyboards]="keyboards"
          [itemTypes]="itemTypes"
          [isNew]="true"
          (save)="saveProduct()"
          (cancel)="goBack()"
        />
      </div>

      <!-- Existing Product View/Edit -->
      <div class="content" *ngIf="!isLoading && product && !isNew">
        <div class="main-content">
          <!-- QR Code Section -->
          <div class="qr-section">
            <h2>QR Code</h2>
            <div class="qr-display">
              <img [src]="qrCodeDataUrl" alt="QR Code" *ngIf="qrCodeDataUrl" />
              <p *ngIf="!qrCodeDataUrl">Generating QR Code...</p>
            </div>
            <p class="qr-info">Scan this QR code to access this product's information</p>
          </div>

          <!-- Product Information Section -->
          <div class="info-section">
            <!-- View Mode -->
            <div *ngIf="!isEdit" class="view-mode">
              <h2>{{ product.bundleName }}</h2>
              <div class="details-grid">
                <div class="detail-item">
                  <strong>Status:</strong>
                  <span class="status" [class]="'status-' + (product.status || 'available').toLowerCase()">
                    {{ getProductStatusLabel(product.status) }}
                  </span>
                </div>
                <div class="detail-item" *ngIf="product.computerModel">
                  <strong>Computer:</strong>
                  <span>{{ product.computerModel }}</span>
                </div>
                <div class="detail-item" *ngIf="product.monitorModel">
                  <strong>Monitor:</strong>
                  <span>{{ product.monitorModel }}</span>
                </div>
                <div class="detail-item" *ngIf="product.keyboardModel">
                  <strong>Keyboard:</strong>
                  <span>{{ product.keyboardModel }}</span>
                </div>
                <div class="detail-item" *ngIf="product.mouseModel">
                  <strong>Mouse:</strong>
                  <span>{{ product.mouseModel }}</span>
                </div>
                <div class="detail-item">
                  <strong>Created:</strong>
                  <span>{{ product.createdAt | date:'medium' }}</span>
                </div>
              </div>

              <div class="actions" *ngIf="isAdmin">
                <button class="btn-edit" (click)="toggleEdit()">Edit Product</button>
                <button class="btn-deactivate" (click)="showDeleteModal = true">Deactivate Product</button>
              </div>
            </div>

            <!-- Edit Mode -->
            <app-product-form
              *ngIf="isEdit"
              [form]="editProduct"
              [computers]="computers"
              [monitors]="monitors"
              [mice]="mice"
              [keyboards]="keyboards"
              [itemTypes]="itemTypes"
              [isNew]="false"
              (save)="saveProduct()"
              (cancel)="toggleEdit()"
            />
          </div>
        </div>

        <!-- QR Scanner Section -->
        <app-qr-scanner
          *ngIf="!isEdit"
          (scanned)="onQRCodeScanned($event)"
        />

        <!-- Scanned Product Result -->
        <div *ngIf="scannedProduct" class="scanned-result">
          <h3>Scanned QR Code Result:</h3>
          <div class="result-box">
            <p><strong>Product ID:</strong> {{ scannedProduct.productId }}</p>
            <p><strong>Product Name:</strong> {{ scannedProduct.bundleName }}</p>
            <p><strong>Status:</strong> {{ scannedProduct.status }}</p>
            <button class="btn-view" (click)="viewScannedProduct()">View Full Details</button>
          </div>
        </div>

        <!-- Location History Section -->
        <app-location-history
          *ngIf="product && product.status !== 'disabled'"
          [locationHistory]="locationHistory"
          [currentLocation]="currentLocation"
          [newLocation]="newLocation"
          [showForm]="showLocationForm"
          [isAdmin]="isAdmin"
          (toggleForm)="toggleLocationForm()"
          (recordMove)="recordLocationMove($event)"
        />
      </div>

      <!-- Product Not Found -->
      <app-empty-state *ngIf="!isLoading && !product && !isNew && !errorMessage" message="Product not found">
        <button class="btn-back" (click)="goBack()">← Back to Products</button>
      </app-empty-state>
    </div>

    <app-confirm-dialog
      [visible]="showDeleteModal"
      title="Deactivate Product"
      [message]="'Are you sure you want to deactivate ' + product?.bundleName + '? It can be reactivated later.'"
      confirmText="Deactivate"
      (confirmed)="confirmDelete()"
      (cancelled)="showDeleteModal = false">
    </app-confirm-dialog>
  `,
  styles: [`
    .product-detail-container { min-height:100vh; background:var(--bg-page); font-family:var(--font-family); display:flex; flex-direction:column; }
    .btn-back { background:transparent; color:var(--text-secondary); border:1px solid var(--border-color); padding:8px 16px; border-radius:var(--radius-sm); cursor:pointer; font-weight:600; font-size:13px; }
    .content { flex:1; padding:30px; max-width:1200px; margin:0 auto; width:100%; }
    .main-content { display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-bottom:30px; }
    .qr-section,.info-section { background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:25px; box-shadow:var(--shadow-card); }
    h2 { margin-top:0; color:var(--primary); border-bottom:2px solid var(--border-color); padding-bottom:10px; font-size:20px; font-weight:600; }
    .qr-display { background:var(--bg-surface-elevated); border-radius:var(--radius-md); padding:20px; text-align:center; margin:15px 0; min-height:320px; display:flex; align-items:center; justify-content:center; border:1px solid var(--border-color); }
    .qr-display img { max-width:300px; height:auto; }
    .details-grid { display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:20px; }
    .detail-item { display:flex; flex-direction:column; }
    .detail-item strong { color:var(--text-secondary); margin-bottom:5px; font-size:13px; }
    .detail-item span { color:var(--text-primary); padding:8px 12px; background:var(--bg-surface-elevated); border-radius:var(--radius-sm); font-size:14px; }
    .status { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; width:fit-content; text-transform:uppercase; letter-spacing:0.5px; }
    .status-available { background:var(--status-available); color:white; }
    .status-assigned { background:var(--status-assigned); color:white; }
    .status-maintenance { background:var(--status-maintenance); color:white; }
    .status-disabled { background:var(--status-disabled); color:white; }
    .actions { display:flex; gap:10px; margin-top:20px; }
    .btn-edit,.btn-deactivate { padding:10px 20px; border:none; border-radius:var(--radius-sm); font-weight:600; cursor:pointer; font-size:14px; }
    .btn-edit { background:var(--btn-edit); color:white; }
    .btn-deactivate { background:var(--btn-delete); color:white; }
    .scanned-result { margin-top:20px; padding:15px; background:rgba(76,175,80,0.08); border-radius:var(--radius-md); border-left:4px solid var(--status-available); }
    .result-box { background:var(--bg-surface-elevated); padding:15px; border-radius:var(--radius-sm); margin:10px 0; border:1px solid var(--border-color); }
    .result-box p { margin:8px 0; color:var(--text-primary); }
    .btn-view { background:var(--btn-view); color:white; border:none; padding:10px 20px; border-radius:var(--radius-sm); cursor:pointer; font-weight:600; }
    .error-container { text-align:center; padding:50px; color:var(--status-unavailable); font-size:16px; background:rgba(244,67,54,0.08); border:1px solid rgba(244,67,54,0.3); border-radius:var(--radius-md); margin:20px; }
    @media (max-width:1024px) { .main-content { grid-template-columns:1fr; } }
  `]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: ProductDTO | null = null;
  editProduct: Partial<ProductDTO> = {};
  isEdit = false;
  isNew = false;
  isLoading = true;
  qrCodeDataUrl = '';
  scannedProduct: ProductDTO | null = null;
  isAdmin = false;
  errorMessage = '';
  showDeleteModal = false;

  private productService = inject(ProductService);
  private componentService = inject(ComponentService);
  private itemTypeService = inject(ItemTypeService);
  private qrCodeService = inject(QrCodeService);
  private authService = inject(AuthService);
  private locationService = inject(ProductLocationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private loadTimeout: any = null;

  // Location history
  locationHistory: ProductLocationDTO[] = [];
  showLocationForm = false;
  newLocation: Partial<ProductLocationDTO> = { locationType: 'office' };
  currentLocation: ProductLocationDTO | null = null;

  // Component lists for selectors
  computers: ComputerItem[] = [];
  monitors: MonitorItem[] = [];
  mice: MouseItem[] = [];
  keyboards: KeyboardItem[] = [];
  itemTypes: ItemTypeDTO[] = [];

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'ADMIN';

    const urlSegments = this.route.snapshot.url.map(seg => seg.path);
    const isNewRoute = urlSegments.includes('new');
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = this.route.snapshot.url.some(seg => seg.path === 'edit');

    if (id && !isNewRoute) {
      this.loadProduct(parseInt(id));
    } else if (isNewRoute) {
      this.isLoading = false;
      this.isEdit = true;
      this.isNew = true;
      this.editProduct = { 
        status: 'available',
        computerId: null,
        monitorId: null,
        keyboardId: null,
        mouseId: null
      };
    } else {
      this.isLoading = false;
      this.isEdit = true;
      this.editProduct = { 
        status: 'available',
        computerId: null,
        monitorId: null,
        keyboardId: null,
        mouseId: null
      };
    }

    // Subscribe to route parameter changes to handle navigation within the component
    this.route.paramMap.subscribe(params => {
      const newId = params.get('id');
      if (newId && newId !== id && !isNewRoute) {
        this.isEdit = false;
        this.isNew = false;
        this.loadProduct(parseInt(newId));
      }
    });

    // Load component lists
    this.loadComponentLists();
  }

  loadComponentLists(): void {
    this.componentService.computers$.pipe(take(1)).subscribe(data => {
      this.computers = this.deduplicateByModel(data, c => `${c.brand} ${c.model}`);
      this.cdr.markForCheck();
    });
    this.componentService.monitors$.pipe(take(1)).subscribe(data => {
      this.monitors = this.deduplicateByModel(data, m => `${m.brand} ${m.model}`);
      this.cdr.markForCheck();
    });
    this.componentService.mice$.pipe(take(1)).subscribe(data => {
      this.mice = this.deduplicateByModel(data, m => `${m.brand} ${m.model}`);
      this.cdr.markForCheck();
    });
    this.componentService.keyboards$.pipe(take(1)).subscribe(data => {
      this.keyboards = this.deduplicateByModel(data, k => `${k.brand} ${k.model}`);
      this.cdr.markForCheck();
    });
    this.itemTypeService.getAll().subscribe(data => {
      this.itemTypes = data;
      this.cdr.markForCheck();
    });
  }

  private deduplicateByModel<T>(items: T[], labelFn: (item: T) => string): T[] {
    const seen = new Map<string, T>();
    for (const item of items) {
      const label = labelFn(item);
      if (!seen.has(label)) {
        seen.set(label, item);
      }
    }
    return Array.from(seen.values());
  }

  ngOnDestroy(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.scannedProduct = null;

    this.loadTimeout = setTimeout(() => {
      if (this.isLoading && !this.product) {
        this.isLoading = false;
        this.errorMessage = 'Loading took too long. Please try refreshing the page.';
      }
    }, 10000);

    this.productService.getProductById(id).subscribe({
      next: (data) => {
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }
        this.product = data;
        this.editProduct = { ...data };
        this.isLoading = false;
        this.errorMessage = '';
        this.cdr.detectChanges();
        this.generateQRCode();
        this.loadLocationHistory();
      },
      error: (err) => {
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }
        this.isLoading = false;
        this.errorMessage = 'Failed to load product. ' + (err.error?.message || 'Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

  generateQRCode(): void {
    if (!this.product) return;
    const qrData = JSON.stringify({
      id: this.product.productId,
      name: this.product.bundleName,
      status: this.product.status
    });
    this.qrCodeService.generateQRCode(qrData).then(dataUrl => {
      this.qrCodeDataUrl = dataUrl;
      // Defer to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => this.cdr.detectChanges(), 0);
    });
  }

  toggleEdit(): void {
    this.isEdit = !this.isEdit;
    if (!this.isEdit) this.editProduct = { ...this.product };
  }

  onComputerSelect(value: string): void {
    this.editProduct.computerId = value ? parseInt(value, 10) : null;
  }

  onMonitorSelect(value: string): void {
    this.editProduct.monitorId = value ? parseInt(value, 10) : null;
  }

  onKeyboardSelect(value: string): void {
    this.editProduct.keyboardId = value ? parseInt(value, 10) : null;
  }

  onMouseSelect(value: string): void {
    this.editProduct.mouseId = value ? parseInt(value, 10) : null;
  }

  saveProduct(): void {
    if (!this.editProduct.bundleName) return;

    if (this.isNew) {
      // Create new product
      this.productService.createProduct(this.editProduct as Partial<ProductDTO>).subscribe({
        next: (data) => {
          this.router.navigate(['/product', data.productId]);
        },
        error: (err) => {
          this.errorMessage = 'Failed to create product: ' + (err.error?.message || 'Please try again.');
        }
      });
    } else {
      // Update existing product
      if (!this.product) return;
      this.productService.updateProduct(this.product.productId, this.editProduct as ProductDTO).subscribe({
        next: (data) => {
          this.product = data;
          this.editProduct = { ...data };
          this.isEdit = false;
          this.cdr.detectChanges();
          this.router.navigate(['/product', data.productId]);
        },
        error: (err) => {
          this.errorMessage = 'Failed to update product: ' + (err.error?.message || 'Please try again.');
        }
      });
    }
  }

  confirmDelete(): void {
    if (!this.product) return;
    this.errorMessage = '';
    this.productService.deleteProduct(this.product.productId).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Unknown error occurred. The product may have related records.';
      }
    });
  }

  onQRCodeScanned(decodedText: string): void {
    try {
      const scannedData = JSON.parse(decodedText);
      if (scannedData.id) {
        this.loadScannedProduct(scannedData.id);
        this.cdr.detectChanges();
      }
    } catch {
      this.errorMessage = 'Invalid QR code format';
    }
  }

  loadScannedProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (data) => { 
        this.scannedProduct = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Product not found';
        this.cdr.detectChanges();
      }
    });
  }

  viewScannedProduct(): void {
    if (this.scannedProduct) {
      this.router.navigate(['/product', this.scannedProduct.productId]);
    }
  }

  // ─── Location History ───────────────────────────────────────
  loadLocationHistory(): void {
    if (!this.product) return;
    this.locationService.getLocationHistory(this.product.productId).subscribe({
      next: (data) => {
        this.locationHistory = data;
        this.currentLocation = data.find(l => l.isCurrent) || null;
        this.cdr.detectChanges();
      },
      error: () => { /* location history unavailable */ }
    });
  }

  toggleLocationForm(): void {
    this.showLocationForm = !this.showLocationForm;
    if (this.showLocationForm) {
      const user = this.authService.getCurrentUser();
      this.newLocation = {
        productId: this.product?.productId,
        locationType: 'office',
        movedBy: user?.username || ''
      };
    }
  }

  recordLocationMove(locationData: Partial<ProductLocationDTO>): void {
    if (!this.product || !locationData.locationName) return;
    this.locationService.recordMove(this.product.productId, locationData as ProductLocationDTO).subscribe({
      next: () => {
        this.showLocationForm = false;
        this.newLocation = { locationType: 'office' };
        this.loadLocationHistory();
      },
      error: (err) => {
        this.errorMessage = 'Failed to record location change: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  // ─── Navigation ─────────────────────────────────────────────
  getProductStatusLabel(status: string | undefined): string {
    return PRODUCT_STATUS_LABELS[status as keyof typeof PRODUCT_STATUS_LABELS] || status || 'Available';
  }

  goBack(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }
    this.router.navigate(['/dashboard']);
  }
}

