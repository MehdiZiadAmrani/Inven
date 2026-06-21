import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" role="navigation" aria-label="Main navigation">
      <div class="navbar-brand">
        <img src="IvenFavIcon2.png" alt="Iven Logo" class="navbar-logo">
        <span class="navbar-title">Iven</span>
      </div>

      <button
        class="hamburger"
        [attr.aria-expanded]="isMenuOpen"
        aria-label="Toggle navigation menu"
        (click)="toggleMenu()">
        <span class="hamburger-line" [class.open]="isMenuOpen"></span>
        <span class="hamburger-line" [class.open]="isMenuOpen"></span>
        <span class="hamburger-line" [class.open]="isMenuOpen"></span>
      </button>

      <div class="nav-links" [class.open]="isMenuOpen" role="menubar">
        <a
          role="menuitem"
          routerLink="/home"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="closeMenu()">
          Dashboard
        </a>
        <a
          role="menuitem"
          routerLink="/computers"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: false }"
          (click)="closeMenu()">
          Computers
        </a>
        <a
          role="menuitem"
          routerLink="/monitors"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: false }"
          (click)="closeMenu()">
          Monitors
        </a>
        <a
          role="menuitem"
          routerLink="/keyboards"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: false }"
          (click)="closeMenu()">
          Keyboards
        </a>
        <a
          role="menuitem"
          routerLink="/mice"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: false }"
          (click)="closeMenu()">
          Mice
        </a>
        <a
          role="menuitem"
          routerLink="/incidencias"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: false }"
          (click)="closeMenu()">
          Incidencias
        </a>

        <ng-container *ngIf="currentUser$ | async as currentUser">
          <a
            *ngIf="currentUser?.role === 'ADMIN'"
            role="menuitem"
            routerLink="/admin/item-types"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
            class="nav-link-admin"
            (click)="closeMenu()">
            Types
          </a>
          <a
            *ngIf="currentUser?.role === 'ADMIN'"
            role="menuitem"
            routerLink="/admin/locations"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
            class="nav-link-admin"
            (click)="closeMenu()">
            Locations
          </a>
          <a
            *ngIf="currentUser?.role === 'ADMIN'"
            role="menuitem"
            routerLink="/admin/brands"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
            class="nav-link-admin"
            (click)="closeMenu()">
            Brands
          </a>
        </ng-container>
      </div>

      <div class="navbar-actions" *ngIf="currentUser$ | async as currentUser">
        <span class="user-display">{{ currentUser?.username }}</span>
        <button class="btn-logout" (click)="logout()">Logout</button>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar {
      background: var(--bg-surface);
      border-bottom: 2px solid var(--primary);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 30px;
      height: var(--navbar-height, 64px);
      transition: height 250ms;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .navbar-logo {
      height: 36px;
      width: auto;
      display: block;
    }

    .navbar-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--primary);
      letter-spacing: -0.5px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      transition: transform 250ms, opacity 250ms;
    }

    .nav-links a {
      color: var(--text-secondary);
      text-decoration: none;
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 14px;
      transition: color 150ms, background 150ms;
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      white-space: nowrap;
    }

    .nav-links a:hover {
      color: var(--primary);
      background: var(--bg-surface-elevated);
      transition: color 150ms, background 150ms;
    }

    .nav-links a.active {
      color: var(--primary);
      background: rgba(255, 214, 0, 0.1);
    }

    .nav-links a:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .nav-link-admin {
      border: 1px solid var(--primary);
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      transition: opacity 250ms;
    }

    .user-display {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .btn-logout {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      min-height: 44px;
      transition: color 150ms, border-color 150ms, background 150ms;
    }

    .btn-logout:hover {
      color: var(--text-primary);
      border-color: var(--text-secondary);
      background: var(--bg-surface-elevated);
      transition: color 150ms, border-color 150ms, background 150ms;
    }

    .btn-logout:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .hamburger {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      min-width: 44px;
      min-height: 44px;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 4px;
      padding: 8px;
      transition: gap 250ms, transform 250ms;
    }

    .hamburger:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .hamburger-line {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--text-primary);
      border-radius: 2px;
      transition: transform 250ms, opacity 250ms;
    }

    .hamburger-line.open:nth-child(1) {
      transform: translateY(6px) rotate(45deg);
    }

    .hamburger-line.open:nth-child(2) {
      opacity: 0;
    }

    .hamburger-line.open:nth-child(3) {
      transform: translateY(-6px) rotate(-45deg);
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0 16px;
      }

      .hamburger {
        display: flex;
        order: 2;
      }

      .navbar-brand {
        order: 1;
      }

      .nav-links {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-surface);
        border-bottom: 2px solid var(--primary);
        flex-direction: column;
        padding: 12px 16px;
        gap: 4px;
        box-shadow: var(--shadow-card);
        transition: opacity 250ms;
      }

      .nav-links.open {
        display: flex;
      }

      .nav-links a {
        width: 100%;
        justify-content: center;
      }

      .navbar-actions {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .navbar,
      .nav-links,
      .nav-links a,
      .btn-logout,
      .hamburger,
      .hamburger-line,
      .navbar-actions,
      .nav-links a:hover,
      .btn-logout:hover {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }
  `]
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly currentUser$ = this.authService.currentUser$;

  protected isMenuOpen = false;

  protected toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  protected closeMenu(): void {
    this.isMenuOpen = false;
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
