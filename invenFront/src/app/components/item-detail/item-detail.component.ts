import { Component, Input, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ItemService, ItemType, ItemDTO, ItemUpdateDTO, InventoryMovementDTO, ComputerDTO, MonitorDTO, KeyboardDTO, MouseDTO } from '../../services/item.service';
import { AuthService } from '../../services/auth.service';
import { QrCodeService } from '../../services/qr-code.service';
import { LocationService, LocationDTO } from '../../services/location.service';
import { IncidenciaService } from '../../services/incidencia.service';
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

const ENDPOINTS_MAP: Record<ItemType, string> = {
  computer: 'computers',
  monitor: 'monitors',
  keyboard: 'keyboards',
  mouse: 'mice'
};

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, LoadingSpinnerComponent, EmptyStateComponent, ConfirmDialogComponent],
  template: `
    <div class="item-detail-container">
      <button class="btn-back" (click)="goBack()">← Back to {{ typeLabel }}s</button>

      <app-loading-spinner *ngIf="isLoading" [message]="'Loading ' + typeLabel.toLowerCase() + '...'" />

      <div *ngIf="!isLoading && errorMessage" class="error-container">
        <p>{{ errorMessage }}</p>
      </div>

      <div class="content" *ngIf="!isLoading && item && !errorMessage">
        <div class="info-section">
          <h2>{{ getBrand(item) }} {{ getModel(item) }}</h2>

          <div class="details-grid">
            <div class="detail-item">
              <strong>Type:</strong>
              <span>{{ typeLabel }}</span>
            </div>
            <div class="detail-item">
              <strong>Status:</strong>
              <app-status-badge [status]="getStatus(item)" />
            </div>
            <div class="detail-item">
              <strong>Brand:</strong>
              <span>{{ getBrand(item) }}</span>
            </div>
            <div class="detail-item">
              <strong>Model:</strong>
              <span>{{ getModel(item) }}</span>
            </div>

            <!-- Computer-specific fields -->
            <ng-container *ngIf="itemType === 'computer'">
              <div class="detail-item">
                <strong>Processor:</strong>
                <span>{{ getField(item, 'cpu') || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <strong>RAM:</strong>
                <span>{{ getField(item, 'ramGb') != null ? getField(item, 'ramGb') + ' GB' : 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <strong>Storage:</strong>
                <span>{{ getField(item, 'storageGb') != null ? getField(item, 'storageGb') + ' GB' : 'N/A' }}</span>
              </div>
            </ng-container>

            <!-- Monitor-specific fields -->
            <ng-container *ngIf="itemType === 'monitor'">
              <div class="detail-item">
                <strong>Screen Size:</strong>
                <span>{{ getField(item, 'screenSizeIn') != null ? getField(item, 'screenSizeIn') + '"' : 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <strong>Resolution:</strong>
                <span>{{ getField(item, 'resolution') || 'N/A' }}</span>
              </div>
            </ng-container>

            <!-- Keyboard-specific fields -->
            <ng-container *ngIf="itemType === 'keyboard'">
              <div class="detail-item">
                <strong>Layout:</strong>
                <span>{{ getField(item, 'layout') || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <strong>Connection:</strong>
                <span>{{ getField(item, 'wireless') ? 'Wireless' : 'Wired' }}</span>
              </div>
            </ng-container>

            <!-- Mouse-specific fields -->
            <ng-container *ngIf="itemType === 'mouse'">
              <div class="detail-item">
                <strong>DPI:</strong>
                <span>{{ getField(item, 'dpiMax') != null ? getField(item, 'dpiMax') : 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <strong>Connection:</strong>
                <span>{{ getField(item, 'wireless') ? 'Wireless' : 'Wired' }}</span>
              </div>
            </ng-container>

            <div class="detail-item">
              <strong>Serial Number:</strong>
              <span>{{ getField(item, 'serialNumber') || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <strong>Inventory Code:</strong>
              <span>{{ getField(item, 'inventoryCode') || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <strong>Created:</strong>
              <span>{{ getCreatedAt(item) | date:'medium' }}</span>
            </div>
          </div>

          <!-- Edit Form -->
          <div class="edit-form" *ngIf="isEdit">
            <h3>Edit {{ typeLabel }}</h3>

            <div class="form-row">
              <div class="form-group">
                <label>Brand</label>
                <input type="text" [(ngModel)]="editBrand" placeholder="Brand" maxlength="100" class="form-input" />
              </div>
              <div class="form-group">
                <label>Model</label>
                <input type="text" [(ngModel)]="editModel" placeholder="Model" maxlength="100" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Serial Number</label>
                <input type="text" [(ngModel)]="editSerialNumber" placeholder="e.g. SN-12345" maxlength="100" class="form-input" />
              </div>
              <div class="form-group">
                <label>Inventory Code</label>
                <input type="text" [(ngModel)]="editInventoryCode" placeholder="e.g. INV-001" maxlength="50" class="form-input" />
              </div>
            </div>

            <!-- Computer edit fields -->
            <div class="form-row" *ngIf="itemType === 'computer'">
              <div class="form-group">
                <label>Processor</label>
                <input type="text" [(ngModel)]="editCpu" placeholder="e.g. Intel i7-12700" maxlength="100" class="form-input" />
              </div>
              <div class="form-group">
                <label>RAM (GB)</label>
                <input type="number" [(ngModel)]="editRam" placeholder="e.g. 16" min="0" class="form-input" />
              </div>
              <div class="form-group">
                <label>Storage (GB)</label>
                <input type="number" [(ngModel)]="editStorage" placeholder="e.g. 512" min="0" class="form-input" />
              </div>
            </div>

            <!-- Monitor edit fields -->
            <div class="form-row" *ngIf="itemType === 'monitor'">
              <div class="form-group">
                <label>Screen Size (inches)</label>
                <input type="number" [(ngModel)]="editScreenSize" placeholder="e.g. 27" min="0" step="0.1" class="form-input" />
              </div>
              <div class="form-group">
                <label>Resolution</label>
                <input type="text" [(ngModel)]="editResolution" placeholder="e.g. 1920x1080" maxlength="50" class="form-input" />
              </div>
            </div>

            <!-- Keyboard edit fields -->
            <div class="form-row" *ngIf="itemType === 'keyboard'">
              <div class="form-group">
                <label>Layout</label>
                <input type="text" [(ngModel)]="editLayout" placeholder="e.g. QWERTY" maxlength="50" class="form-input" />
              </div>
              <div class="form-group">
                <label>Connection</label>
                <select [(ngModel)]="editWireless" class="form-input">
                  <option [ngValue]="false">Wired</option>
                  <option [ngValue]="true">Wireless</option>
                </select>
              </div>
            </div>

            <!-- Mouse edit fields -->
            <div class="form-row" *ngIf="itemType === 'mouse'">
              <div class="form-group">
                <label>DPI</label>
                <input type="number" [(ngModel)]="editDpi" placeholder="e.g. 16000" min="0" class="form-input" />
              </div>
              <div class="form-group">
                <label>Connection</label>
                <select [(ngModel)]="editWireless" class="form-input">
                  <option [ngValue]="false">Wired</option>
                  <option [ngValue]="true">Wireless</option>
                </select>
              </div>
            </div>

            <!-- Location Assignment -->
            <div class="location-section">
              <h3>Location</h3>
              <div class="location-controls">
                <div class="form-group">
                  <label>Current Location</label>
                  <span class="current-location">{{ currentLocation?.name || 'Not assigned' }}</span>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Assign Location</label>
                    <select [(ngModel)]="selectedLocationId" class="form-input">
                      <option [ngValue]="null" disabled>-- Select a location --</option>
                      <option *ngFor="let loc of locations" [ngValue]="loc.locationId">{{ loc.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="location-actions">
                  <button class="btn-assign" (click)="assignLocation()" [disabled]="!selectedLocationId || locationLoading">Assign Location</button>
                  <button class="btn-remove" *ngIf="currentLocation" (click)="removeLocation()" [disabled]="locationLoading">Remove</button>
                </div>
                <p *ngIf="locationMessage" class="form-success">{{ locationMessage }}</p>
                <p *ngIf="locationError" class="form-error">{{ locationError }}</p>
              </div>
            </div>

            <!-- Quick Incidencia -->
            <div class="incidencia-section">
              <h3>Report Incident</h3>
              <button class="btn-report" *ngIf="!showIncidenciaForm" (click)="showIncidenciaForm = true">Report Incident</button>
              <div class="incidencia-form" *ngIf="showIncidenciaForm">
                <div class="form-group">
                  <label>Title *</label>
                  <input type="text" [(ngModel)]="incidenciaTitle" placeholder="e.g. Screen flickering" maxlength="200" class="form-input" />
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea [(ngModel)]="incidenciaDescription" placeholder="Describe the issue..." rows="3" class="form-input"></textarea>
                </div>
                <div class="form-group">
                  <label>Priority</label>
                  <select [(ngModel)]="incidenciaPriority" class="form-input">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div class="incidencia-actions">
                  <button class="btn-submit" (click)="submitIncidencia()" [disabled]="!incidenciaTitle.trim() || incidenciaSubmitting">
                    {{ incidenciaSubmitting ? 'Submitting...' : 'Submit' }}
                  </button>
                  <button class="btn-cancel" (click)="cancelIncidencia()">Cancel</button>
                </div>
                <p *ngIf="incidenciaError" class="form-error">{{ incidenciaError }}</p>
                <p *ngIf="incidenciaSuccess" class="form-success">{{ incidenciaSuccess }}</p>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn-save" (click)="saveEdit()" [disabled]="!editBrand.trim() || !editModel.trim()">Save</button>
              <button class="btn-cancel" (click)="cancelEdit()">Cancel</button>
            </div>
            <p *ngIf="editError" class="form-error">{{ editError }}</p>
          </div>

          <div class="actions" *ngIf="isAdmin && !isEdit">
            <button class="btn-edit" (click)="startEdit()">Edit</button>
            <button class="btn-deactivate" *ngIf="getStatus(item) !== 'disabled'" (click)="requestDeactivate()">Deactivate</button>
            <button class="btn-reactivate" *ngIf="getStatus(item) === 'disabled'" (click)="reactivate()">Reactivate</button>
          </div>
        </div>

        <!-- QR Code Section -->
        <div class="qr-section">
          <h3>QR Code</h3>
          <div class="qr-display">
            <img [src]="qrCodeDataUrl" alt="QR Code for {{ getBrand(item) }} {{ getModel(item) }}" *ngIf="qrCodeDataUrl" />
            <p *ngIf="!qrCodeDataUrl">Generating QR Code...</p>
          </div>
          <p class="qr-info">Scan this QR code to access this item's information</p>
          <button class="btn-download-qr" *ngIf="qrCodeDataUrl" (click)="downloadQR()">Download QR</button>
        </div>

        <!-- Movement History Section -->
        <div class="movement-section">
          <h3>Movement History</h3>
          <div class="movement-timeline" *ngIf="movements.length > 0">
            <div *ngFor="let m of movements; let i = index" class="movement-item" [class.first]="i === 0">
              <div class="movement-dot"></div>
              <div class="movement-content">
                <div class="movement-header">
                  <strong>{{ m.movementType === 'IN' ? 'Stock In' : 'Stock Out' }}</strong>
                  <span class="movement-badge" [class]="'movement-' + m.movementType.toLowerCase()">{{ m.movementType }}</span>
                </div>
                <div class="movement-meta">
                  <span>Qty: {{ m.quantity }}</span>
                  <span>{{ m.movementDate | date:'medium' }}</span>
                </div>
                <p *ngIf="m.notes" class="movement-notes">{{ m.notes }}</p>
              </div>
            </div>
          </div>
          <p *ngIf="movements.length === 0 && !isLoading && item" class="no-movements">
            No movement history recorded yet.
          </p>
        </div>
      </div>

      <app-empty-state *ngIf="!isLoading && !item && !errorMessage" [message]="typeLabel + ' not found'" />
    </div>

    <app-confirm-dialog
      [visible]="showDeactivateModal"
      title="Deactivate {{ typeLabel }}"
      [message]="'Are you sure you want to deactivate this ' + typeLabel.toLowerCase() + '?'"
      confirmText="Deactivate"
      (confirmed)="confirmDeactivate()"
      (cancelled)="showDeactivateModal = false">
    </app-confirm-dialog>
  `,
  styles: [`
    .item-detail-container {
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

    .actions {
      display: flex;
      gap: 10px;
      margin-top: 24px;
    }

    .btn-edit, .btn-deactivate, .btn-reactivate {
      padding: 10px 24px;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-edit {
      background: var(--btn-edit);
      color: white;
    }

    .btn-deactivate {
      background: var(--btn-delete);
      color: white;
    }

    .btn-reactivate {
      background: var(--status-available);
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

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* QR Code Section */
    .qr-section {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 25px;
      box-shadow: var(--shadow-card);
      margin-top: 30px;
      text-align: center;
    }

    .qr-section h3 {
      margin-top: 0;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--border-color);
    }

    .qr-display {
      margin: 16px auto;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 160px;
    }

    .qr-display img {
      width: 200px;
      height: 200px;
      image-rendering: pixelated;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 8px;
      background: white;
    }

    .qr-info {
      color: var(--text-muted);
      font-size: 13px;
      margin: 8px 0 16px;
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

    /* Movement History */
    .movement-section {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 25px;
      box-shadow: var(--shadow-card);
      margin-top: 30px;
    }

    .movement-section h3 {
      margin-top: 0;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--border-color);
    }

    .movement-timeline {
      position: relative;
      padding-left: 30px;
    }

    .movement-item {
      position: relative;
      padding-bottom: 20px;
      border-left: 2px solid var(--border-color);
    }

    .movement-item:last-child {
      border-left-color: transparent;
    }

    .movement-item.first {
      border-left-color: var(--primary);
    }

    .movement-dot {
      position: absolute;
      left: -37px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--text-muted);
      border: 2px solid var(--bg-surface);
    }

    .movement-item.first .movement-dot {
      background: var(--primary);
    }

    .movement-content {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 15px;
    }

    .movement-item.first .movement-content {
      border-color: var(--primary);
      background: rgba(255, 214, 0, 0.04);
    }

    .movement-header {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .movement-header strong {
      color: var(--text-primary);
      font-size: 15px;
    }

    .movement-badge {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
    }

    .movement-in {
      background: var(--status-available);
      color: white;
    }

    .movement-out {
      background: var(--status-unavailable);
      color: white;
    }

    .movement-meta {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 5px;
    }

    .movement-notes {
      color: var(--text-secondary);
      font-size: 13px;
      margin: 8px 0 0 0;
      font-style: italic;
    }

    .no-movements {
      text-align: center;
      color: var(--text-muted);
      padding: 30px;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .details-grid {
        grid-template-columns: 1fr;
      }
      .form-row {
        flex-direction: column;
      }
    }

    .location-section, .incidencia-section {
      margin-top: 24px;
      padding: 20px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
    }

    .location-section h3, .incidencia-section h3 {
      margin-top: 0;
      margin-bottom: 16px;
    }

    .current-location {
      display: block;
      padding: 8px 12px;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 14px;
    }

    .location-actions, .incidencia-actions {
      display: flex;
      gap: 10px;
      margin-top: 12px;
    }

    .btn-assign {
      padding: 8px 20px;
      background: var(--primary);
      color: var(--text-on-primary);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
    }

    .btn-remove {
      padding: 8px 20px;
      background: var(--btn-delete);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
    }

    .btn-report {
      padding: 10px 24px;
      background: var(--primary);
      color: var(--text-on-primary);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-submit {
      padding: 8px 20px;
      background: var(--primary);
      color: var(--text-on-primary);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
    }

    .form-success {
      color: var(--status-available);
      font-size: 13px;
      margin-top: 8px;
    }

    textarea.form-input {
      resize: vertical;
      font-family: inherit;
    }
  `]
})
export class ItemDetailComponent implements OnInit, OnDestroy {
  @Input({ required: true }) itemType!: ItemType;

  item: ItemDTO | null = null;
  isLoading = true;
  errorMessage = '';
  isAdmin = false;

  isEdit = false;
  editBrand = '';
  editModel = '';
  editCpu = '';
  editRam: number | null = null;
  editStorage: number | null = null;
  editScreenSize: number | null = null;
  editResolution = '';
  editLayout = '';
  editWireless = false;
  editDpi: number | null = null;
  editSerialNumber = '';
  editInventoryCode = '';
  editError = '';

  showDeactivateModal = false;

  qrCodeDataUrl = '';

  movements: InventoryMovementDTO[] = [];

  // Location properties
  locations: LocationDTO[] = [];
  currentLocation: { productLocationId: number; locationId: number; name: string } | null = null;
  selectedLocationId: number | null = null;
  locationLoading = false;
  locationMessage = '';
  locationError = '';

  // Incidencia properties
  showIncidenciaForm = false;
  incidenciaTitle = '';
  incidenciaDescription = '';
  incidenciaPriority = 'medium';
  incidenciaSubmitting = false;
  incidenciaError = '';
  incidenciaSuccess = '';

  private readonly itemService = inject(ItemService);
  private readonly authService = inject(AuthService);
  private readonly qrCodeService = inject(QrCodeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly http = inject(HttpClient);
  private readonly locationService = inject(LocationService);
  private readonly incidenciaService = inject(IncidenciaService);
  private loadTimeout: any = null;

  get typeLabel(): string {
    return ITEM_LABELS[this.itemType];
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'ADMIN';

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadItem(parseInt(id));
    } else {
      this.isLoading = false;
      this.errorMessage = 'No item ID provided.';
    }

    this.route.paramMap.subscribe(params => {
      const newId = params.get('id');
      if (newId) {
        this.isEdit = false;
        this.loadItem(parseInt(newId));
      }
    });
  }

  loadItem(id: number): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.item = null;

    this.loadTimeout = setTimeout(() => {
      if (this.isLoading && !this.item) {
        this.isLoading = false;
        this.errorMessage = 'Loading took too long. Please try refreshing the page.';
      }
    }, 10000);

    this.itemService.getById(this.itemType, id).subscribe({
      next: (data) => {
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }
        this.item = data;
        this.isLoading = false;
        this.errorMessage = '';
        this.qrCodeDataUrl = '';
        this.generateQRCode();
        this.loadMovements(id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }
        this.isLoading = false;
        this.errorMessage = 'Failed to load item: ' + (err.error?.message || 'Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

  loadMovements(id: number): void {
    this.itemService.getMovements(this.itemType, id).subscribe({
      next: (data) => {
        this.movements = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.movements = [];
      }
    });
  }

  private generateQRCode(): void {
    if (!this.item) return;
    const baseUrl = window.location.origin;
    const route = ENDPOINTS_MAP[this.itemType];
    const qrData = `${baseUrl}/${route}/${this.getId(this.item)}`;
    this.qrCodeService.generateQRCode(qrData).then(dataUrl => {
      this.qrCodeDataUrl = dataUrl;
      setTimeout(() => this.cdr.detectChanges(), 0);
    });
  }

  protected downloadQR(): void {
    if (!this.qrCodeDataUrl || !this.item) return;
    const link = document.createElement('a');
    link.href = this.qrCodeDataUrl;
    link.download = `${this.getBrand(this.item)}-${this.getModel(this.item)}-qr.png`.replace(/\s+/g, '-').toLowerCase();
    link.click();
  }

  startEdit(): void {
    if (!this.item) return;
    this.isEdit = true;
    this.editBrand = this.getBrand(this.item);
    this.editModel = this.getModel(this.item);
    this.editSerialNumber = this.getField(this.item, 'serialNumber') || '';
    this.editInventoryCode = this.getField(this.item, 'inventoryCode') || '';
    this.editError = '';

    if (this.itemType === 'computer') {
      const c = this.item as ComputerDTO;
      this.editCpu = c.cpu || '';
      this.editRam = c.ramGb ?? null;
      this.editStorage = c.storageGb ?? null;
    } else if (this.itemType === 'monitor') {
      const m = this.item as MonitorDTO;
      this.editScreenSize = m.screenSizeIn ?? null;
      this.editResolution = m.resolution || '';
    } else if (this.itemType === 'keyboard') {
      const k = this.item as KeyboardDTO;
      this.editLayout = k.layout || '';
      this.editWireless = k.wireless ?? false;
    } else if (this.itemType === 'mouse') {
      const m = this.item as MouseDTO;
      this.editDpi = m.dpiMax ?? null;
      this.editWireless = m.wireless ?? false;
    }

    this.loadLocationData();
  }

  saveEdit(): void {
    if (!this.item) return;
    const brand = this.editBrand.trim();
    const model = this.editModel.trim();
    if (!brand || !model) return;

    const data: ItemUpdateDTO = { brand, model };

    data.serialNumber = this.editSerialNumber.trim() || undefined;
    data.inventoryCode = this.editInventoryCode.trim() || undefined;

    if (this.itemType === 'computer') {
      data.cpu = this.editCpu.trim() || undefined;
      data.ramGb = this.editRam ?? undefined;
      data.storageGb = this.editStorage ?? undefined;
    } else if (this.itemType === 'monitor') {
      data.screenSizeIn = this.editScreenSize ?? undefined;
      data.resolution = this.editResolution.trim() || undefined;
    } else if (this.itemType === 'keyboard') {
      data.layout = this.editLayout.trim() || undefined;
      data.wireless = this.editWireless;
    } else if (this.itemType === 'mouse') {
      data.dpiMax = this.editDpi ?? undefined;
      data.wireless = this.editWireless;
    }

    this.itemService.update(this.itemType, this.getId(this.item), data).subscribe({
      next: (result) => {
        this.item = result;
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
    this.editBrand = '';
    this.editModel = '';
    this.editCpu = '';
    this.editRam = null;
    this.editStorage = null;
    this.editScreenSize = null;
    this.editResolution = '';
    this.editLayout = '';
    this.editWireless = false;
    this.editDpi = null;
    this.editSerialNumber = '';
    this.editInventoryCode = '';
    this.editError = '';

    this.currentLocation = null;
    this.selectedLocationId = null;
    this.locations = [];
    this.locationMessage = '';
    this.locationError = '';
    this.cancelIncidencia();
  }

  requestDeactivate(): void {
    this.showDeactivateModal = true;
  }

  confirmDeactivate(): void {
    if (!this.item) return;
    this.itemService.updateStatus(this.itemType, this.getId(this.item), 'disabled').subscribe({
      next: (data) => {
        this.item = data;
        this.showDeactivateModal = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to deactivate: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  reactivate(): void {
    if (!this.item) return;
    this.itemService.updateStatus(this.itemType, this.getId(this.item), 'available').subscribe({
      next: (data) => {
        this.item = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to reactivate: ' + (err.error?.message || 'Please try again.');
      }
    });
  }

  goBack(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }
    this.router.navigate([`/${ENDPOINTS_MAP[this.itemType]}`]);
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
    return (item as any).status ?? '';
  }

  getCreatedAt(item: ItemDTO): string {
    return (item as any).createdAt ?? '';
  }

  getField(item: ItemDTO, field: string): any {
    return (item as any)[field] ?? null;
  }

  private loadLocationData(): void {
    this.locationLoading = true;
    this.locationError = '';
    this.locationMessage = '';

    this.locationService.getLocations().subscribe({
      next: (data) => {
        this.locations = data;
        this.loadCurrentLocation();
      },
      error: () => {
        this.locationError = 'Failed to load locations.';
        this.locationLoading = false;
      }
    });
  }

  private loadCurrentLocation(): void {
    this.http.get<any[]>(`/api/product-locations/item/${this.itemType}/${this.getId(this.item!)}`).subscribe({
      next: (data) => {
        if (data.length > 0) {
          const pl = data[0];
          this.currentLocation = {
            productLocationId: pl.productLocationId,
            locationId: pl.locationId,
            name: pl.locationName || pl.location?.name || 'Unknown'
          };
          this.selectedLocationId = pl.locationId;
        } else {
          this.currentLocation = null;
          this.selectedLocationId = null;
        }
        this.locationLoading = false;
      },
      error: () => {
        this.currentLocation = null;
        this.locationLoading = false;
      }
    });
  }

  assignLocation(): void {
    if (!this.selectedLocationId || !this.item) return;
    this.locationLoading = true;
    this.locationError = '';
    this.locationMessage = '';

    this.http.post('/api/product-locations', {
      locationId: this.selectedLocationId,
      itemType: this.itemType,
      itemId: this.getId(this.item)
    }).subscribe({
      next: () => {
        this.locationMessage = 'Location assigned successfully.';
        this.locationLoading = false;
        this.loadCurrentLocation();
      },
      error: (err) => {
        this.locationError = 'Failed to assign location: ' + (err.error?.message || 'Please try again.');
        this.locationLoading = false;
      }
    });
  }

  removeLocation(): void {
    if (!this.currentLocation || !this.item) return;
    this.locationLoading = true;
    this.locationError = '';
    this.locationMessage = '';

    this.http.delete(`/api/product-locations/${this.currentLocation.productLocationId}`).subscribe({
      next: () => {
        this.locationMessage = 'Location removed successfully.';
        this.currentLocation = null;
        this.selectedLocationId = null;
        this.locationLoading = false;
      },
      error: (err) => {
        this.locationError = 'Failed to remove location: ' + (err.error?.message || 'Please try again.');
        this.locationLoading = false;
      }
    });
  }

  submitIncidencia(): void {
    if (!this.incidenciaTitle.trim() || !this.item) return;
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
}
