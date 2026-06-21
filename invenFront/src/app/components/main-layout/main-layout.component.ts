import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <footer class="app-footer" role="contentinfo">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="footer-title">Iven &mdash; Sistema de Inventario</span>
          <span class="footer-year">&copy; {{ currentYear }}</span>
        </div>
        <nav class="footer-links" aria-label="Footer navigation">
          <a routerLink="/home">Home</a>
          <a routerLink="/computers">Items</a>
          <a routerLink="/incidencias">Incidencias</a>
        </nav>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      background: var(--bg-page);
      padding: 24px 30px;
    }

    .app-footer {
      background: var(--bg-surface);
      border-top: 1px solid var(--border-color);
      padding: 20px 30px;
    }

    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .footer-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .footer-year {
      font-size: 12px;
      color: var(--text-muted);
    }

    .footer-links {
      display: flex;
      gap: 20px;
    }

    .footer-links a {
      font-size: 13px;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      transition: color 150ms;
    }

    .footer-links a:hover {
      color: var(--primary);
    }

    .footer-links a:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 16px;
      }

      .app-footer {
        padding: 16px;
      }

      .footer-inner {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .footer-links a {
        transition: none;
      }
    }
  `]
})
export class MainLayoutComponent {
  protected readonly currentYear = new Date().getFullYear();
}
