import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-container">
      <p>{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-container {
      text-align: center;
      padding: 50px;
      color: var(--text-muted);
      font-size: 14px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() message = 'No items found.';
}
