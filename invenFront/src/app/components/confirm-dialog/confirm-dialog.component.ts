import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="visible" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" (click)="onCancel()">Cancel</button>
          <button class="btn-danger" (click)="onConfirm()">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: #1a1a2e;
      border: 1px solid rgba(122,141,230,0.2);
      border-radius: 8px;
      padding: 24px;
      min-width: 400px;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .modal-content h3 {
      margin: 0 0 12px;
      color: #ffffff;
      font-size: 18px;
    }
    .modal-content p {
      margin: 0 0 24px;
      color: #a0a0b0;
      font-size: 14px;
      line-height: 1.5;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn-cancel, .btn-danger {
      padding: 8px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .btn-cancel {
      background: #2a2a3e;
      color: #a0a0b0;
    }
    .btn-danger {
      background: #e74c3c;
      color: #ffffff;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Delete';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
