import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { ProductDTO } from '../../../services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="product-card">
      <div class="card-header">
        <h3>{{ product.bundleName }}</h3>
        <app-status-badge [status]="product.status || 'available'" />
      </div>

      <div class="card-body">
        <p *ngIf="product.computerModel"><strong>Computer:</strong> {{ product.computerModel }}</p>
        <p *ngIf="product.monitorModel"><strong>Monitor:</strong> {{ product.monitorModel }}</p>
        <p *ngIf="product.keyboardModel"><strong>Keyboard:</strong> {{ product.keyboardModel }}</p>
        <p *ngIf="product.mouseModel"><strong>Mouse:</strong> {{ product.mouseModel }}</p>
        <p><strong>Created:</strong> {{ product.createdAt | date:'short' }}</p>
      </div>

      <div class="card-actions">
        <button class="btn-view" (click)="view.emit(product.productId)">View Details</button>
        <button class="btn-edit" *ngIf="isAdmin" (click)="edit.emit(product.productId)">Edit</button>
        <button class="btn-deactivate" *ngIf="isAdmin" (click)="delete.emit(product.productId)">Deactivate</button>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-card);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .card-header {
      background: var(--bg-surface-elevated);
      border-bottom: 1px solid var(--border-color);
      padding: 18px 15px;
      display: flex;
      justify-content: space-between;
      align-items: start;
    }
    .card-header h3 {
      margin: 0;
      font-size: 17px;
      flex: 1;
      color: var(--primary);
      font-weight: 600;
    }
    .card-body {
      padding: 15px;
      flex: 1;
    }
    .card-body p {
      margin: 6px 0;
      color: var(--text-secondary);
      font-size: 13px;
    }
    .card-body p strong {
      color: var(--text-primary);
    }
    .card-actions {
      display: flex;
      gap: 8px;
      padding: 12px 15px;
      border-top: 1px solid var(--border-color);
    }
    .btn-view, .btn-edit, .btn-deactivate {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-view {
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    .btn-edit {
      background: var(--btn-edit);
      color: white;
    }
    .btn-deactivate {
      background: var(--btn-delete);
      color: white;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductDTO;
  @Input() isAdmin = false;

  @Output() view = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
}
