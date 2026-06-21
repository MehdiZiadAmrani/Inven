import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductLocationDTO } from '../../../services/product-location.service';
import { LocationService, LocationDTO } from '../../../services/location.service';
import { LOCATION_TYPE_LABELS } from '../../../config/enums';

@Component({
  selector: 'app-location-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="location-section">
      <div class="section-header">
        <h2>Location History</h2>
        <button class="btn-add-location" *ngIf="isAdmin" (click)="toggleForm.emit()">
          {{ showForm ? 'Cancel' : '+ Record Move' }}
        </button>
      </div>

      <!-- Current Location Banner -->
      <div *ngIf="currentLocation" class="current-location-banner">
        <span class="current-badge">CURRENT</span>
        <strong>{{ currentLocation.locationName }}</strong>
        <span class="location-type-badge">{{ getLocationTypeLabel(currentLocation.locationType) }}</span>
        <span *ngIf="currentLocation.assignedTo" class="assigned-info">→ {{ currentLocation.assignedTo }}</span>
      </div>

      <!-- Location Move Form -->
      <div *ngIf="showForm" class="location-form">
        <div class="form-row">
          <div class="form-group">
            <label>Location Name *</label>
            <select [(ngModel)]="newLocation.locationName" name="locationName">
              <option value="" disabled selected>Select a location...</option>
              <option *ngFor="let loc of locations" [value]="loc.name">{{ loc.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Location Type</label>
            <select [(ngModel)]="newLocation.locationType" name="locationType">
              <option *ngFor="let opt of locationTypeOptions" [value]="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Assigned To</label>
            <input type="text" [(ngModel)]="newLocation.assignedTo" name="assignedTo" 
                   placeholder="Employee name" />
          </div>
          <div class="form-group">
            <label>Notes</label>
            <input type="text" [(ngModel)]="newLocation.notes" name="notes" 
                   placeholder="Optional notes..." />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-save" (click)="onRecordMove()">Save Move</button>
          <button class="btn-cancel" (click)="toggleForm.emit()">Cancel</button>
        </div>
      </div>

      <!-- Location Timeline -->
      <div *ngIf="locationHistory.length > 0" class="location-timeline">
        <div *ngFor="let loc of locationHistory" class="timeline-item" [class.current]="loc.isCurrent">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <strong>{{ loc.locationName }}</strong>
              <span class="location-type-badge">{{ getLocationTypeLabel(loc.locationType) }}</span>
              <span *ngIf="loc.isCurrent" class="current-badge-sm">CURRENT</span>
            </div>
            <div class="timeline-meta">
              <span *ngIf="loc.assignedTo">👤 {{ loc.assignedTo }}</span>
              <span>📅 {{ loc.movedAt | date:'short' }}</span>
              <span *ngIf="loc.movedBy">by {{ loc.movedBy }}</span>
            </div>
            <p *ngIf="loc.notes" class="timeline-notes">{{ loc.notes }}</p>
          </div>
        </div>
      </div>

      <p *ngIf="locationHistory.length === 0 && !showForm" class="no-locations">
        No location history recorded yet. {{ isAdmin ? 'Click "+ Record Move" to start tracking.' : '' }}
      </p>
    </div>
  `,
  styles: [`
    .location-section { background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:25px; box-shadow:var(--shadow-card); margin-top:30px; }
    .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
    .section-header h2 { border-bottom:none; margin-bottom:0; padding-bottom:0; margin-top:0; color:var(--primary); font-size:20px; font-weight:600; }
    .btn-add-location { background:var(--primary); color:var(--text-on-primary); border:none; padding:10px 18px; border-radius:var(--radius-sm); font-weight:600; cursor:pointer; font-size:13px; }
    .current-location-banner { background:rgba(255,214,0,0.08); border:1px solid var(--primary); border-left:4px solid var(--primary); border-radius:var(--radius-sm); padding:15px 20px; margin-bottom:20px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .current-location-banner strong { color:var(--primary); font-size:16px; }
    .current-badge { background:var(--primary); color:var(--text-on-primary); padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700; }
    .current-badge-sm { background:var(--primary); color:var(--text-on-primary); padding:2px 8px; border-radius:10px; font-size:10px; font-weight:700; }
    .location-type-badge { background:var(--bg-surface-elevated); color:var(--text-secondary); padding:3px 10px; border-radius:12px; font-size:12px; }
    .assigned-info { color:var(--text-secondary); font-size:13px; }
    .location-form { background:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:20px; margin-bottom:20px; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:15px; }
    .form-group { margin-bottom:15px; }
    .form-group label { display:block; margin-bottom:8px; font-weight:600; color:var(--text-secondary); font-size:14px; }
    .form-group input,.form-group select { width:100%; padding:10px 14px; background:var(--bg-input); border:1px solid var(--border-color); border-radius:var(--radius-sm); color:var(--text-primary); font-size:14px; box-sizing:border-box; }
    .form-group input:focus,.form-group select:focus { outline:none; border-color:var(--border-focus); }
    .form-actions { display:flex; gap:10px; margin-top:20px; }
    .btn-save,.btn-cancel { flex:1; padding:10px 20px; border:none; border-radius:var(--radius-sm); font-weight:600; cursor:pointer; font-size:14px; }
    .btn-save { background:var(--primary); color:var(--text-on-primary); }
    .btn-cancel { background:var(--btn-cancel); color:white; }
    .location-timeline { position:relative; padding-left:30px; }
    .timeline-item { position:relative; padding-bottom:20px; border-left:2px solid var(--border-color); }
    .timeline-item:last-child { border-left-color:transparent; }
    .timeline-item.current .timeline-dot { background:var(--primary); }
    .timeline-item.current { border-left-color:var(--primary); }
    .timeline-dot { position:absolute; left:-37px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--text-muted); border:2px solid var(--bg-surface); }
    .timeline-content { background:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:15px; }
    .timeline-item.current .timeline-content { border-color:var(--primary); background:rgba(255,214,0,0.04); }
    .timeline-header { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:8px; }
    .timeline-header strong { color:var(--text-primary); font-size:15px; }
    .timeline-meta { display:flex; gap:15px; flex-wrap:wrap; font-size:12px; color:var(--text-muted); margin-bottom:5px; }
    .timeline-notes { color:var(--text-secondary); font-size:13px; margin:8px 0 0 0; font-style:italic; }
    .no-locations { text-align:center; color:var(--text-muted); padding:30px; font-size:14px; }
    @media (max-width:768px) { .form-row { grid-template-columns:1fr; } }
  `]
})
export class LocationHistoryComponent implements OnInit {
  @Input() locationHistory: ProductLocationDTO[] = [];
  @Input() currentLocation: ProductLocationDTO | null = null;
  @Input() newLocation: Partial<ProductLocationDTO> = { locationType: 'office' };
  @Input() showForm = false;
  @Input() isAdmin = false;

  @Output() toggleForm = new EventEmitter<void>();
  @Output() recordMove = new EventEmitter<Partial<ProductLocationDTO>>();

  private locationService = inject(LocationService);
  locations: LocationDTO[] = [];
  locationTypeOptions = Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  ngOnInit(): void {
    this.locationService.getLocations().subscribe({
      next: (data) => { this.locations = data; },
      error: () => { this.locations = []; }
    });
  }

  onRecordMove(): void {
    this.recordMove.emit(this.newLocation);
  }

  onToggleForm(): void {
    this.toggleForm.emit();
  }

  getLocationTypeLabel(type: string): string {
    return LOCATION_TYPE_LABELS[type as keyof typeof LOCATION_TYPE_LABELS] || type;
  }
}
