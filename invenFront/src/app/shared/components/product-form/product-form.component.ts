import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductDTO } from '../../../services/product.service';
import { ComputerItem, MonitorItem, MouseItem, KeyboardItem } from '../../../services/component.service';
import { ItemTypeDTO } from '../../../services/item-type.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-form-container">
      <h2>{{ isNew ? 'Create New Product' : 'Edit Product' }}</h2>
      <form (ngSubmit)="onSave()">
        <div class="form-group">
          <label>Bundle Name:</label>
          <input type="text" [(ngModel)]="form.bundleName" name="bundleName" required 
                 placeholder="e.g. Developer Workstation - Standard" />
        </div>

        <div class="form-group">
          <label>Device Type:</label>
          <select [(ngModel)]="form.typeId" name="typeId">
            <option [ngValue]="null">None</option>
            <option *ngFor="let t of activeItemTypes" [value]="t.itemTypeId">{{ t.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Computer:</label>
          <select [ngModel]="form.computerId" (ngModelChange)="onComputerSelect($event)" name="computerId">
            <option [ngValue]="null">None</option>
            <option *ngFor="let c of computers" [value]="c.computerId">{{ c.brand }} {{ c.model }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Monitor:</label>
          <select [ngModel]="form.monitorId" (ngModelChange)="onMonitorSelect($event)" name="monitorId">
            <option [ngValue]="null">None</option>
            <option *ngFor="let m of monitors" [value]="m.monitorId">{{ m.brand }} {{ m.model }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Keyboard:</label>
          <select [ngModel]="form.keyboardId" (ngModelChange)="onKeyboardSelect($event)" name="keyboardId">
            <option [ngValue]="null">None</option>
            <option *ngFor="let k of keyboards" [value]="k.keyboardId">{{ k.brand }} {{ k.model }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Mouse:</label>
          <select [ngModel]="form.mouseId" (ngModelChange)="onMouseSelect($event)" name="mouseId">
            <option [ngValue]="null">None</option>
            <option *ngFor="let m of mice" [value]="m.mouseId">{{ m.brand }} {{ m.model }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Status:</label>
          <select [(ngModel)]="form.status" name="status">
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="maintenance">Maintenance</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save">{{ isNew ? 'Create Product' : 'Save Changes' }}</button>
          <button type="button" class="btn-cancel" (click)="onCancel()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .product-form-container { background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:25px; box-shadow:var(--shadow-card); }
    h2 { margin-top:0; color:var(--primary); border-bottom:2px solid var(--border-color); padding-bottom:10px; font-size:20px; font-weight:600; }
    .form-group { margin-bottom:20px; }
    .form-group label { display:block; margin-bottom:8px; font-weight:600; color:var(--text-secondary); font-size:14px; }
    .form-group input,.form-group select { width:100%; padding:10px 14px; background:var(--bg-input); border:1px solid var(--border-color); border-radius:var(--radius-sm); color:var(--text-primary); font-size:14px; box-sizing:border-box; }
    .form-group input:focus,.form-group select:focus { outline:none; border-color:var(--border-focus); }
    .form-group select { cursor:pointer; }
    .form-actions { display:flex; gap:10px; margin-top:20px; }
    .btn-save,.btn-cancel { flex:1; padding:10px 20px; border:none; border-radius:var(--radius-sm); font-weight:600; cursor:pointer; font-size:14px; }
    .btn-save { background:var(--primary); color:var(--text-on-primary); }
    .btn-cancel { background:var(--btn-cancel); color:white; }
  `]
})
export class ProductFormComponent {
  @Input() form: Partial<ProductDTO> = {};
  @Input() computers: ComputerItem[] = [];
  @Input() monitors: MonitorItem[] = [];
  @Input() mice: MouseItem[] = [];
  @Input() keyboards: KeyboardItem[] = [];
  @Input() itemTypes: ItemTypeDTO[] = [];
  @Input() isNew = false;

  @Output() save = new EventEmitter<Partial<ProductDTO>>();
  @Output() cancel = new EventEmitter<void>();

  get activeItemTypes(): ItemTypeDTO[] {
    return this.itemTypes.filter(t => t.status === 'active');
  }

  onSave(): void {
    this.save.emit(this.form);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onComputerSelect(value: string): void {
    this.form.computerId = value ? parseInt(value, 10) : null;
  }

  onMonitorSelect(value: string): void {
    this.form.monitorId = value ? parseInt(value, 10) : null;
  }

  onKeyboardSelect(value: string): void {
    this.form.keyboardId = value ? parseInt(value, 10) : null;
  }

  onMouseSelect(value: string): void {
    this.form.mouseId = value ? parseInt(value, 10) : null;
  }
}
