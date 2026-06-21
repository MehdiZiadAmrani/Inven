import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductStatus, PRODUCT_STATUS_LABELS } from '../../../config/enums';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class]="badgeClass">
      {{ displayLabel }}
    </span>
  `,
  styles: [`
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: white;
    }
    .status-available { background: var(--status-available); }
    .status-assigned { background: var(--status-assigned); }
    .status-maintenance { background: var(--status-maintenance); }
    .status-disabled { background: var(--status-disabled); }
    .status-default { background: var(--text-muted); }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = 'available';

  get badgeClass(): string {
    const cls = `status-${this.status.toLowerCase()}`;
    return ['status-available', 'status-assigned', 'status-maintenance', 'status-disabled'].includes(cls)
      ? cls
      : 'status-default';
  }

  get displayLabel(): string {
    return PRODUCT_STATUS_LABELS[this.status] || this.status;
  }
}
