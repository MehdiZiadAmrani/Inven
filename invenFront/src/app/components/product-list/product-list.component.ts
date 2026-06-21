import { Component, OnInit, inject, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService, ProductDTO } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { QrCodeService } from '../../services/qr-code.service';
import { Html5Qrcode } from 'html5-qrcode';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogComponent, ProductCardComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="product-list-container">
      <div class="content">
        <div class="controls">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearchQueryChange($event)"
            placeholder="Search by product name or component model..."
            class="search-input"
          />
          <button class="btn-refresh" (click)="loadProducts()" [disabled]="isLoading">{{ isLoading ? 'Loading...' : 'Refresh' }}</button>
          <button class="btn-scan" (click)="toggleScanner()" [disabled]="isLoading">{{ showScanner ? 'Close Scanner' : 'Scan QR Code' }}</button>
          <button class="btn-add" *ngIf="isAdmin" routerLink="/product/new" [disabled]="isLoading">Add Product</button>
        </div>

        <!-- QR Scanner Section -->
        <div class="scanner-container" *ngIf="showScanner">
          <div class="scanner-box">
            <div id="qr-reader" #qrReader></div>
            <p *ngIf="scannerError" class="scanner-error">{{ scannerError }}</p>
          </div>
        </div>

        <app-loading-spinner *ngIf="isLoading" message="Loading products..." />

        <div *ngIf="!isLoading && errorMessage" class="error-container">
          <p>{{ errorMessage }}</p>
          <button class="btn-retry" (click)="loadProducts()">Retry</button>
        </div>

        <div class="products-grid" *ngIf="!isLoading && !errorMessage && products.length > 0">
          <app-product-card
            *ngFor="let product of products"
            [product]="product"
            [isAdmin]="isAdmin"
            (view)="openProduct($event)"
            (edit)="editProduct($event)"
            (delete)="requestDelete($event)"
          />
        </div>

        <app-empty-state *ngIf="!isLoading && !errorMessage && products.length === 0" message="No products found.">
          <span *ngIf="isAdmin">Create one to get started!</span>
        </app-empty-state>
      </div>
    </div>

    <app-confirm-dialog
      [visible]="showDeleteModal"
      title="Deactivate Product"
      [message]="'Are you sure you want to deactivate this product?' + (deleteErrorMessage ? '\n\nError: ' + deleteErrorMessage : '') + '\nIt can be reactivated by an admin.'"
      confirmText="Deactivate"
      (confirmed)="confirmDeactivate()"
      (cancelled)="showDeleteModal = false">
    </app-confirm-dialog>
  `,
  styles: [`
    .product-list-container {
      min-height: 100vh;
      background: var(--bg-page);
      font-family: var(--font-family);
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1;
      padding: 30px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .search-input {
      flex: 1;
      min-width: 200px;
      padding: 12px 15px;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-input::placeholder {
      color: var(--text-muted);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    .btn-refresh, .btn-add, .btn-scan {
      padding: 12px 20px;
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

    .btn-scan {
      background: var(--bg-surface);
      color: var(--primary);
      border: 1px solid var(--primary);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .scanner-container {
      margin: 20px 0;
      padding: 20px;
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      border: 2px dashed var(--primary);
    }

    .scanner-box {
      max-width: 500px;
      margin: 0 auto;
    }

    #qr-reader {
      width: 100%;
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .scanner-error {
      color: var(--status-unavailable);
      margin-top: 10px;
      text-align: center;
      font-weight: 600;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ProductListComponent implements OnInit, OnDestroy {
  @ViewChild('qrReader') qrReaderElement: ElementRef | null = null;

  products: ProductDTO[] = [];
  searchQuery = '';
  isAdmin = false;
  isLoading = false;
  errorMessage = '';
  showScanner = false;
  scannerError = '';

  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private qrCodeService = inject(QrCodeService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private html5QrCode: Html5Qrcode | null = null;
  private loadTimeout: any = null;

  // Debounced search
  private searchSubject = new Subject<string>();
  private readonly SEARCH_DEBOUNCE_MS = 350;
  private readonly SEARCH_MIN_CHARS = 2;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.isAdmin = user.role === 'ADMIN';
    }

    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(this.SEARCH_DEBOUNCE_MS),
      distinctUntilChanged()
    ).subscribe(query => this.executeSearch(query));

    this.loadProducts();
  }

  loadProducts(): void {
    // Clear any existing timeout
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.products = [];
    
    // Set 10-second timeout to prevent infinite loading
    this.loadTimeout = setTimeout(() => {
      if (this.isLoading && this.products.length === 0) {
        this.isLoading = false;
        this.errorMessage = 'Loading took too long. Please check if backend is running at http://localhost:8080';
        this.cdr.detectChanges();
      }
    }, 10000);
    
    const user = this.authService.getCurrentUser();

    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.zone.run(() => {
          if (this.loadTimeout) {
            clearTimeout(this.loadTimeout);
            this.loadTimeout = null;
          }
          this.products = data;
          this.isLoading = false;
          this.errorMessage = '';
          this.cdr.detectChanges();
        });
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
          this.errorMessage = `Error loading products (${err.status}): ${err.statusText || err.message}`;
        }
        this.cdr.detectChanges();
      }
    });
  }

  onSearchQueryChange(value: string): void {
    this.searchSubject.next(value.trim());
  }

  private executeSearch(query: string): void {
    // Require minimum characters before searching
    if (query.length < this.SEARCH_MIN_CHARS) {
      if (!query) {
        // Empty or too short → reload all products
        this.loadProducts();
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.productService.searchProducts(query).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to search products.';
        this.cdr.detectChanges();
      }
    });
  }

  openProduct(id: number): void {
    this.router.navigate(['/product', id]);
  }

  editProduct(id: number): void {
    this.router.navigate(['/product', id, 'edit']);
  }

  showDeleteModal = false;
  deleteTargetId: number | null = null;
  deleteErrorMessage = '';

  requestDelete(id: number): void {
    this.deleteTargetId = id;
    this.deleteErrorMessage = '';
    this.showDeleteModal = true;
  }

  confirmDeactivate(): void {
    if (!this.deleteTargetId) return;
    this.productService.deleteProduct(this.deleteTargetId).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.deleteTargetId = null;
        this.loadProducts();
      },
      error: (err) => {
        this.deleteErrorMessage = err.error?.message || 'Failed to delete product. It may have related records.';
      }
    });
  }

  ngOnDestroy(): void {
    this.stopScanner();
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }
    this.searchSubject.complete();
  }

  toggleScanner(): void {
    this.showScanner = !this.showScanner;
    this.scannerError = '';
    if (this.showScanner) {
      setTimeout(() => this.startScanner(), 100);
    } else {
      this.stopScanner();
    }
  }

  startScanner(): void {
    if (!this.qrReaderElement) return;
    
    this.html5QrCode = new Html5Qrcode('qr-reader');
    this.html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => this.onQRCodeScanned(decodedText),
      () => { /* suppress scan frame errors */ }
    ).catch(() => {
      this.scannerError = 'Failed to access camera. Make sure you have granted permission.';
      this.cdr.detectChanges();
    });
  }

  stopScanner(): void {
    if (this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        this.html5QrCode = null;
      }).catch(() => { /* scanner already stopped */ });
    }
  }

  onQRCodeScanned(decodedText: string): void {
    try {
      const scannedData = JSON.parse(decodedText);
      if (scannedData.id) {
        this.stopScanner();
        this.showScanner = false;
        this.cdr.detectChanges();
        // Navigate to product details
        this.router.navigate(['/product', scannedData.id]);
      }
    } catch {
      this.scannerError = 'Invalid QR code format';
      this.cdr.detectChanges();
    }
  }
}
