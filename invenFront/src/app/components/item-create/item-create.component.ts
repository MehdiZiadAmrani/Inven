import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ItemService, ItemType, ItemCreateDTO } from '../../services/item.service';
import { AuthService } from '../../services/auth.service';
import { LocationService, LocationDTO } from '../../services/location.service';
import { IncidenciaService } from '../../services/incidencia.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

const ITEM_LABELS: Record<ItemType, string> = {
  computer: 'Computer',
  monitor: 'Monitor',
  keyboard: 'Keyboard',
  mouse: 'Mouse'
};

const ENDPOINTS_MAP: Record<ItemType, string> = {
  computer: 'computers',
  monitor: 'monitors',
  keyboard: 'keyboards',
  mouse: 'mice'
};

@Component({
  selector: 'app-item-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="item-create-container">
      <button class="btn-back" (click)="goBack()">← Back to {{ typeLabel }}s</button>

      <div class="content">
        <div class="form-section">
          <h2>Create New {{ typeLabel }}</h2>

          <div class="form-group">
            <label for="brand">Brand *</label>
            <input
              id="brand"
              type="text"
              [(ngModel)]="formData.brand"
              placeholder="e.g. Dell, Lenovo, Apple"
              maxlength="100"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="model">Model *</label>
            <input
              id="model"
              type="text"
              [(ngModel)]="formData.model"
              placeholder="e.g. XPS 15, ThinkPad X1"
              maxlength="100"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="serialNumber">Serial Number</label>
            <input
              id="serialNumber"
              type="text"
              [(ngModel)]="formData.serialNumber"
              placeholder="e.g. SN-12345ABC"
              maxlength="100"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="inventoryCode">Inventory Code</label>
            <input
              id="inventoryCode"
              type="text"
              [(ngModel)]="formData.inventoryCode"
              placeholder="e.g. INV-001"
              maxlength="50"
              class="form-input"
            />
          </div>

          <!-- Computer-specific fields -->
          <ng-container *ngIf="itemType === 'computer'">
            <h3>Computer Specifications</h3>
            <div class="form-group">
              <label for="cpu">Processor</label>
              <input
                id="cpu"
                type="text"
                [(ngModel)]="formData.cpu"
                placeholder="e.g. Intel Core i7-12700K"
                maxlength="100"
                class="form-input"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="ram">RAM (GB)</label>
                <input
                  id="ram"
                  type="number"
                  [(ngModel)]="formData.ramGb"
                  placeholder="e.g. 16"
                  min="0"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="storage">Storage (GB)</label>
                <input
                  id="storage"
                  type="number"
                  [(ngModel)]="formData.storageGb"
                  placeholder="e.g. 512"
                  min="0"
                  class="form-input"
                />
              </div>
            </div>
          </ng-container>

          <!-- Monitor-specific fields -->
          <ng-container *ngIf="itemType === 'monitor'">
            <h3>Monitor Specifications</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="screenSize">Screen Size (inches)</label>
                <input
                  id="screenSize"
                  type="number"
                  [(ngModel)]="formData.screenSizeIn"
                  placeholder="e.g. 27"
                  min="0"
                  step="0.1"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="resolution">Resolution</label>
                <input
                  id="resolution"
                  type="text"
                  [(ngModel)]="formData.resolution"
                  placeholder="e.g. 1920x1080"
                  maxlength="50"
                  class="form-input"
                />
              </div>
            </div>
          </ng-container>

          <!-- Keyboard-specific fields -->
          <ng-container *ngIf="itemType === 'keyboard'">
            <h3>Keyboard Specifications</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="layout">Layout</label>
                <input
                  id="layout"
                  type="text"
                  [(ngModel)]="formData.layout"
                  placeholder="e.g. QWERTY, AZERTY"
                  maxlength="50"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="wireless">Connection</label>
                <select [(ngModel)]="formData.wireless" id="wireless" class="form-input">
                  <option [ngValue]="false">Wired</option>
                  <option [ngValue]="true">Wireless</option>
                </select>
              </div>
            </div>
          </ng-container>

          <!-- Mouse-specific fields -->
          <ng-container *ngIf="itemType === 'mouse'">
            <h3>Mouse Specifications</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="dpi">Max DPI</label>
                <input
                  id="dpi"
                  type="number"
                  [(ngModel)]="formData.dpiMax"
                  placeholder="e.g. 16000"
                  min="0"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="wireless-mouse">Connection</label>
                <select [(ngModel)]="formData.wireless" id="wireless-mouse" class="form-input">
                  <option [ngValue]="false">Wired</option>
                  <option [ngValue]="true">Wireless</option>
                </select>
              </div>
            </div>
          </ng-container>

          <!-- Error message -->
          <p *ngIf="errorMessage" class="form-error">{{ errorMessage }}</p>

          <!-- Location Assignment Section -->
          <div class="location-section" *ngIf="locations.length > 0">
            <h3>Assign Location (Optional)</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="location">Location</label>
                <select [(ngModel)]="selectedLocationId" id="location" class="form-input">
                  <option [ngValue]="null" disabled>-- Select a location --</option>
                  <option *ngFor="let loc of locations" [ngValue]="loc.locationId">{{ loc.name }}</option>
                </select>
              </div>
            </div>
            <p *ngIf="locationMessage" class="form-success">{{ locationMessage }}</p>
            <p *ngIf="locationError" class="form-error">{{ locationError }}</p>
          </div>

          <!-- Report Incident Section -->
          <div class="incidencia-section">
            <h3>Report Incident (Optional)</h3>
            <button class="btn-report" type="button" *ngIf="!showIncidenciaForm" (click)="showIncidenciaForm = true">
              Report Incident
            </button>
            <div class="incidencia-form" *ngIf="showIncidenciaForm">
              <div class="form-group">
                <label for="incidenciaTitle">Title</label>
                <input
                  id="incidenciaTitle"
                  type="text"
                  [(ngModel)]="incidenciaTitle"
                  placeholder="e.g. Screen flickering"
                  maxlength="200"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="incidenciaDesc">Description</label>
                <textarea
                  id="incidenciaDesc"
                  [(ngModel)]="incidenciaDescription"
                  placeholder="Describe the issue..."
                  rows="3"
                  class="form-input"
                ></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="incidenciaPriority">Priority</label>
                  <select [(ngModel)]="incidenciaPriority" id="incidenciaPriority" class="form-input">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div class="incidencia-actions">
                <button
                  type="button"
                  class="btn-submit"
                  (click)="submitIncidencia()"
                  [disabled]="!incidenciaTitle.trim() || incidenciaSubmitting"
                >
                  {{ incidenciaSubmitting ? 'Submitting...' : 'Report Incident' }}
                </button>
                <button type="button" class="btn-cancel-incident" (click)="cancelIncidencia()">Cancel</button>
              </div>
              <p *ngIf="incidenciaError" class="form-error">{{ incidenciaError }}</p>
              <p *ngIf="incidenciaSuccess" class="form-success">{{ incidenciaSuccess }}</p>
            </div>
          </div>

          <!-- Error message -->
          <div class="form-actions">
            <button
              class="btn-create"
              (click)="submitForm()"
              [disabled]="!isFormValid() || isSubmitting"
            >
              {{ isSubmitting ? 'Creating...' : 'Create ' + typeLabel }}
            </button>
            <button class="btn-cancel" (click)="goBack()" [disabled]="isSubmitting">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .item-create-container {
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

    .content {
      flex: 1;
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
    }

    .form-section {
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
      margin-bottom: 24px;
    }

    h3 {
      color: var(--primary);
      font-size: 16px;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 13px;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 14px;
      box-sizing: border-box;
      font-family: var(--font-family);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--border-focus);
      background: var(--bg-input);
    }

    .form-input::placeholder {
      color: var(--text-muted);
    }

    select.form-input {
      cursor: pointer;
    }

    .form-error {
      color: var(--status-disabled);
      font-size: 13px;
      margin: 16px 0;
      padding: 12px;
      background: rgba(244, 67, 54, 0.08);
      border: 1px solid rgba(244, 67, 54, 0.3);
      border-radius: var(--radius-sm);
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }

    .btn-create, .btn-cancel {
      padding: 12px 24px;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      flex: 1;
      transition: all 0.2s;
    }

    .btn-create {
      background: var(--primary);
      color: var(--text-on-primary);
    }

    .btn-create:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn-cancel {
      background: var(--btn-cancel);
      color: white;
    }

    .btn-cancel:hover:not(:disabled) {
      opacity: 0.9;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .location-section,
    .incidencia-section {
      margin-top: 24px;
      padding: 16px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
    }

    .location-section h3,
    .incidencia-section h3 {
      margin-top: 0;
      margin-bottom: 16px;
    }

    .location-actions,
    .incidencia-actions {
      display: flex;
      gap: 10px;
      margin-top: 12px;
    }

    .btn-report,
    .btn-submit,
    .btn-cancel-incident {
      padding: 10px 20px;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      flex: 1;
      transition: all 0.2s;
    }

    .btn-report {
      background: var(--primary);
      color: var(--text-on-primary);
    }

    .btn-report:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn-submit {
      background: var(--primary);
      color: var(--text-on-primary);
    }

    .btn-submit:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn-cancel-incident {
      background: var(--btn-cancel);
      color: white;
    }

    .btn-cancel-incident:hover:not(:disabled) {
      opacity: 0.9;
    }

    .form-success {
      color: var(--status-available);
      font-size: 13px;
      margin: 12px 0 0 0;
      padding: 8px 12px;
      background: rgba(76, 175, 80, 0.08);
      border: 1px solid rgba(76, 175, 80, 0.3);
      border-radius: var(--radius-sm);
    }

    .incidencia-form {
      margin-top: 12px;
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
    }

    @media (max-width: 768px) {
      .form-section {
        padding: 20px;
      }

      h2 {
        font-size: 18px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions,
      .incidencia-actions,
      .location-actions {
        flex-direction: column;
      }

      .btn-create,
      .btn-cancel,
      .btn-report,
      .btn-submit,
      .btn-cancel-incident {
        flex: unset;
      }
    }
  `]
})
export class ItemCreateComponent implements OnInit, OnDestroy {
  itemType: ItemType | null = null;
  typeLabel = '';

  formData: any = {
    brand: '',
    model: '',
    serialNumber: '',
    inventoryCode: '',
    cpu: '',
    ramGb: null,
    storageGb: null,
    screenSizeIn: null,
    resolution: '',
    layout: '',
    wireless: false,
    dpiMax: null
  };

  errorMessage = '';
  isSubmitting = false;

  // Location properties
  locations: LocationDTO[] = [];
  selectedLocationId: number | null = null;
  locationMessage = '';
  locationError = '';
  locationLoading = false;

  // Incidencia properties
  showIncidenciaForm = false;
  incidenciaTitle = '';
  incidenciaDescription = '';
  incidenciaPriority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  incidenciaMessage = '';
  incidenciaError = '';
  incidenciaSuccess = '';
  incidenciaSubmitting = false;

  private readonly itemService = inject(ItemService);
  private readonly authService = inject(AuthService);
  private readonly locationService = inject(LocationService);
  private readonly incidenciaService = inject(IncidenciaService);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      this.router.navigate(['/home']);
      return;
    }

    // Get item type from route data
    this.route.data.subscribe(data => {
      this.itemType = data['itemType'] as ItemType;
      this.typeLabel = ITEM_LABELS[this.itemType] || 'Item';
    });

    // Load available locations
    this.loadLocations();
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations.filter(loc => loc.status !== 'deleted');
      },
      error: () => {
        this.locations = [];
      }
    });
  }

  isFormValid(): boolean {
    return this.formData.brand?.trim().length > 0 && this.formData.model?.trim().length > 0;
  }

  submitForm(): void {
    if (!this.isFormValid() || !this.itemType) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    // Prepare DTO - backend only accepts brand and model for creation
    const createData: ItemCreateDTO = {
      brand: this.formData.brand.trim(),
      model: this.formData.model.trim()
    };

    this.itemService.create(this.itemType, createData).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        
        // If location was selected, assign it to the newly created item
        if (this.selectedLocationId && result && this.itemType) {
          let itemId = 0;
          // Extract the correct ID based on item type
          if (this.itemType === 'computer') {
            itemId = (result as any).computerId;
          } else if (this.itemType === 'monitor') {
            itemId = (result as any).monitorId;
          } else if (this.itemType === 'keyboard') {
            itemId = (result as any).keyboardId;
          } else if (this.itemType === 'mouse') {
            itemId = (result as any).mouseId;
          }
          
          if (itemId) {
            this.assignLocationToNewItem(itemId);
          } else {
            this.router.navigate([`/${ENDPOINTS_MAP[this.itemType!]}`]);
          }
        } else {
          // Navigate to the list view with success
          this.router.navigate([`/${ENDPOINTS_MAP[this.itemType!]}`]);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          'Failed to create ' +
          this.typeLabel +
          ': ' +
          (err.error?.message || 'Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

  private assignLocationToNewItem(itemId: number): void {
    if (!this.selectedLocationId || !this.itemType) return;

    this.http.post('/api/product-locations', {
      locationId: this.selectedLocationId,
      itemType: this.itemType,
      itemId: itemId
    }).subscribe({
      next: () => {
        this.locationMessage = 'Item created and location assigned successfully.';
        // Navigate after a short delay
        setTimeout(() => {
          this.router.navigate([`/${ENDPOINTS_MAP[this.itemType!]}`]);
        }, 500);
      },
      error: (err) => {
        this.locationError = 'Item created but failed to assign location: ' + (err.error?.message || 'Please try again.');
        // Still navigate after showing error
        setTimeout(() => {
          this.router.navigate([`/${ENDPOINTS_MAP[this.itemType!]}`]);
        }, 1500);
      }
    });
  }

  submitIncidencia(): void {
    if (!this.incidenciaTitle.trim()) return;
    this.incidenciaSubmitting = true;
    this.incidenciaError = '';
    this.incidenciaSuccess = '';

    this.incidenciaService.createIncidencia({
      title: this.incidenciaTitle.trim(),
      description: this.incidenciaDescription.trim() || undefined,
      priority: this.incidenciaPriority,
      productId: 0
    }).subscribe({
      next: () => {
        this.incidenciaSuccess = 'Incident reported successfully.';
        this.incidenciaSubmitting = false;
        this.incidenciaTitle = '';
        this.incidenciaDescription = '';
        this.incidenciaPriority = 'medium';
        setTimeout(() => {
          this.showIncidenciaForm = false;
          this.incidenciaSuccess = '';
        }, 2000);
      },
      error: (err) => {
        this.incidenciaError = 'Failed to report incident: ' + (err.error?.message || 'Please try again.');
        this.incidenciaSubmitting = false;
      }
    });
  }

  cancelIncidencia(): void {
    this.showIncidenciaForm = false;
    this.incidenciaTitle = '';
    this.incidenciaDescription = '';
    this.incidenciaPriority = 'medium';
    this.incidenciaError = '';
    this.incidenciaSuccess = '';
  }

  goBack(): void {
    if (this.itemType) {
      this.router.navigate([`/${ENDPOINTS_MAP[this.itemType]}`]);
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {}
}
