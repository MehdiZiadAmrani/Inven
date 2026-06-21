import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of, race, timer } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProductService, ProductDTO } from '../../services/product.service';
import { ItemService } from '../../services/item.service';
import { IncidenciaService, IncidenciaDTO } from '../../services/incidencia.service';
import { LocationService, LocationDTO } from '../../services/location.service';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  link?: string;
}

interface StatBar {
  label: string;
  value: number;
  color: string;
  total: number;
}

type Tab = 'overview' | 'statistics' | 'activity';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <div class="home-header">
        <h1 class="home-title">Dashboard</h1>
        <p class="home-subtitle">Bienvenido a Iven — Sistema de Inventario Escolar</p>
      </div>

      <div class="carousel" (mouseenter)="isPaused = true" (mouseleave)="isPaused = false" role="region" aria-label="Informacion destacada">
        <div class="carousel-track" [style.transform]="'translateX(-' + currentSlide * 100 + '%)'" >
          @for (slide of slides; track $index) {
            <div class="carousel-slide">
              <h2 class="carousel-brand">{{ slide.title }}</h2>
              <p class="carousel-sub">{{ slide.subtitle }}</p>
              <p class="carousel-msg">{{ slide.text }}</p>
            </div>
          }
        </div>
        <button class="carousel-arrow carousel-arrow--prev" (click)="prevSlide()" aria-label="Anterior"><span aria-hidden="true">&#10094;</span></button>
        <button class="carousel-arrow carousel-arrow--next" (click)="nextSlide()" aria-label="Siguiente"><span aria-hidden="true">&#10095;</span></button>
        <div class="carousel-dots">
          @for (slide of slides; track $index) {
            <button
              class="carousel-dot"
              [class.active]="$index === currentSlide"
              (click)="goToSlide($index)"
              [attr.aria-label]="'Ir al slide ' + ($index + 1)">
            </button>
          }
        </div>
      </div>

      <nav class="tab-nav" role="tablist" aria-label="Dashboard sections">
        <button
          role="tab"
          [attr.aria-selected]="activeTab === 'overview'"
          [class.active]="activeTab === 'overview'"
          (click)="setTab('overview')">
          Overview
        </button>
        <button
          role="tab"
          [attr.aria-selected]="activeTab === 'statistics'"
          [class.active]="activeTab === 'statistics'"
          (click)="setTab('statistics')">
          Statistics
        </button>
        <button
          role="tab"
          [attr.aria-selected]="activeTab === 'activity'"
          [class.active]="activeTab === 'activity'"
          (click)="setTab('activity')">
          Recent Activity
        </button>
      </nav>

      <div role="tabpanel" [attr.aria-labelledby]="activeTab">
        @if (loading) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        } @else if (error) {
          <div class="error-state">
            <p>Could not load dashboard data. Please try again later.</p>
          </div>
        } @else {
          @switch (activeTab) {
            @case ('overview') {
              <section class="tab-content">
                <div class="stat-cards-grid">
                  @for (card of overviewCards(); track card.label) {
                    <div
                      class="stat-card"
                      [style.--card-accent]="card.color"
                      [class.clickable]="!!card.link">
                      <span class="stat-card-icon">{{ card.icon }}</span>
                      <span class="stat-card-value">{{ card.value }}</span>
                      <span class="stat-card-label">{{ card.label }}</span>
                      @if (card.link) {
                        <a
                          class="stat-card-link"
                          [routerLink]="card.link"
                          [attr.aria-label]="'View ' + card.label">
                          View &rarr;
                        </a>
                      }
                    </div>
                  }
                </div>

                <div class="quick-links">
                  <h2 class="section-title">Quick Links</h2>
                  <div class="quick-links-grid">
                    <a routerLink="/computers" class="quick-link-card">
                      <span class="quick-link-icon">💻</span>
                      <span class="quick-link-label">Computers</span>
                      <span class="quick-link-count">{{ itemCounts().computers }} items</span>
                    </a>
                    <a routerLink="/monitors" class="quick-link-card">
                      <span class="quick-link-icon">🖥️</span>
                      <span class="quick-link-label">Monitors</span>
                      <span class="quick-link-count">{{ itemCounts().monitors }} items</span>
                    </a>
                    <a routerLink="/keyboards" class="quick-link-card">
                      <span class="quick-link-icon">⌨️</span>
                      <span class="quick-link-label">Keyboards</span>
                      <span class="quick-link-count">{{ itemCounts().keyboards }} items</span>
                    </a>
                    <a routerLink="/mice" class="quick-link-card">
                      <span class="quick-link-icon">🖱️</span>
                      <span class="quick-link-label">Mice</span>
                      <span class="quick-link-count">{{ itemCounts().mice }} items</span>
                    </a>
                    <a routerLink="/incidencias" class="quick-link-card">
                      <span class="quick-link-icon">⚠️</span>
                      <span class="quick-link-label">Incidencias</span>
                      <span class="quick-link-count">{{ itemCounts().incidencias }} open</span>
                    </a>
                    <a routerLink="/admin/locations" class="quick-link-card">
                      <span class="quick-link-icon">📍</span>
                      <span class="quick-link-label">Locations</span>
                      <span class="quick-link-count">{{ itemCounts().locations }} total</span>
                    </a>
                    <a routerLink="/admin/brands" class="quick-link-card">
                      <span class="quick-link-icon">🏷️</span>
                      <span class="quick-link-label">Brands</span>
                    </a>
                  </div>
                </div>
              </section>
            }
            @case ('statistics') {
              <section class="tab-content">
                <div class="stats-grid">
                  <div class="stats-panel">
                    <h2 class="section-title">Items by Type</h2>
                    <div class="bar-chart">
                      @for (bar of itemsByType(); track bar.label) {
                        <div class="bar-row">
                          <span class="bar-label">{{ bar.label }}</span>
                          <div class="bar-track">
                            <div
                              class="bar-fill"
                              [style.width.%]="bar.total ? (bar.value / bar.total) * 100 : 0"
                              [style.background]="bar.color">
                            </div>
                          </div>
                          <span class="bar-value">{{ bar.value }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="stats-panel">
                    <h2 class="section-title">Items by Status</h2>
                    <div class="bar-chart">
                      @for (bar of itemsByStatus(); track bar.label) {
                        <div class="bar-row">
                          <span class="bar-label">{{ bar.label }}</span>
                          <div class="bar-track">
                            <div
                              class="bar-fill"
                              [style.width.%]="bar.total ? (bar.value / bar.total) * 100 : 0"
                              [style.background]="bar.color">
                            </div>
                          </div>
                          <span class="bar-value">{{ bar.value }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="stats-panel">
                    <h2 class="section-title">Incidents by Status</h2>
                    <div class="bar-chart">
                      @for (bar of incidentsByStatus(); track bar.label) {
                        <div class="bar-row">
                          <span class="bar-label">{{ bar.label }}</span>
                          <div class="bar-track">
                            <div
                              class="bar-fill"
                              [style.width.%]="bar.total ? (bar.value / bar.total) * 100 : 0"
                              [style.background]="bar.color">
                            </div>
                          </div>
                          <span class="bar-value">{{ bar.value }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="stats-panel">
                    <h2 class="section-title">Incidents by Priority</h2>
                    <div class="bar-chart">
                      @for (bar of incidentsByPriority(); track bar.label) {
                        <div class="bar-row">
                          <span class="bar-label">{{ bar.label }}</span>
                          <div class="bar-track">
                            <div
                              class="bar-fill"
                              [style.width.%]="bar.total ? (bar.value / bar.total) * 100 : 0"
                              [style.background]="bar.color">
                            </div>
                          </div>
                          <span class="bar-value">{{ bar.value }}</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </section>
            }
            @case ('activity') {
              <section class="tab-content">
                <div class="activity-panel">
                  <h2 class="section-title">Recent Incidencias</h2>
                  @if (recentIncidencias().length === 0) {
                    <p class="empty-state">No recent incidencias found.</p>
                  } @else {
                    <div class="activity-list">
                      @for (inc of recentIncidencias(); track inc.incidenciaId) {
                        <a
                          class="activity-item"
                          [routerLink]="['/incidencias', inc.incidenciaId]">
                          <span
                            class="activity-priority"
                            [class.priority-low]="inc.priority === 'low'"
                            [class.priority-medium]="inc.priority === 'medium'"
                            [class.priority-high]="inc.priority === 'high'"
                            [class.priority-critical]="inc.priority === 'critical'">
                            {{ inc.priority }}
                          </span>
                          <span
                            class="activity-status"
                            [class.status-open]="inc.status === 'open'"
                            [class.status-in-progress]="inc.status === 'in_progress'">
                            {{ inc.status === 'in_progress' ? 'In Progress' : inc.status }}
                          </span>
                          <div class="activity-details">
                            <span class="activity-title">{{ inc.title }}</span>
                            <span class="activity-meta">
                              {{ inc.productName || 'No product' }} &middot; {{ inc.createdAt | date:'mediumDate' }}
                            </span>
                          </div>
                        </a>
                      }
                    </div>
                  }
                </div>
              </section>
            }
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .home-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .home-header {
      margin-bottom: 24px;
    }

    .home-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .home-subtitle {
      color: var(--text-secondary);
      font-size: 15px;
    }

    /* Tab Navigation */
    .tab-nav {
      display: flex;
      gap: 0;
      border-bottom: 2px solid var(--border-color);
      margin-bottom: 24px;
    }

    .tab-nav button {
      background: none;
      border: none;
      color: var(--text-secondary);
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: color 150ms, border-color 150ms;
      min-height: 44px;
      min-width: 44px;
    }

    .tab-nav button:hover {
      color: var(--text-primary);
    }

    .tab-nav button.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }

    .tab-nav button:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .tab-content {
      animation: fadeIn 200ms ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Stat Cards */
    .stat-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      --card-accent: var(--primary);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--card-accent);
      border-radius: var(--radius-md);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: transform 150ms, box-shadow 150ms;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-card);
    }

    .stat-card-icon {
      font-size: 24px;
    }

    .stat-card-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .stat-card-label {
      font-size: 13px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-card-link {
      color: var(--primary);
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      margin-top: 4px;
    }

    .stat-card-link:hover {
      text-decoration: underline;
    }

    /* Quick Links */
    .quick-links {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
    }

    .quick-links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
    }

    .quick-link-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 16px;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      transition: transform 150ms, border-color 150ms, box-shadow 150ms;
      text-align: center;
    }

    .quick-link-card:hover {
      transform: translateY(-2px);
      border-color: var(--primary);
      box-shadow: var(--shadow-card);
    }

    .quick-link-icon {
      font-size: 28px;
    }

    .quick-link-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .quick-link-count {
      font-size: 12px;
      color: var(--text-secondary);
    }

    /* Statistics */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .stats-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 20px;
    }

    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bar-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bar-label {
      min-width: 90px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .bar-track {
      flex: 1;
      height: 10px;
      background: var(--bg-surface-elevated);
      border-radius: 5px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 5px;
      transition: width 600ms ease-out;
    }

    .bar-value {
      min-width: 36px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      text-align: right;
    }

    /* Activity */
    .activity-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 20px;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      text-decoration: none;
      transition: border-color 150ms, background 150ms;
    }

    .activity-item:hover {
      border-color: var(--primary);
      background: var(--bg-surface);
    }

    .activity-priority {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 3px;
      min-width: 70px;
      text-align: center;
    }

    .priority-low { background: #2E7D32; color: #A5D6A7; }
    .priority-medium { background: #1565C0; color: #90CAF9; }
    .priority-high { background: #E65100; color: #FFCC80; }
    .priority-critical { background: #B71C1C; color: #EF9A9A; }

    .activity-status {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 3px;
      min-width: 85px;
      text-align: center;
    }

    .status-open { background: rgba(244, 67, 54, 0.2); color: #EF9A9A; }
    .status-in-progress { background: rgba(255, 152, 0, 0.2); color: #FFCC80; }

    .activity-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }

    .activity-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .activity-meta {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .empty-state {
      color: var(--text-secondary);
      text-align: center;
      padding: 32px 0;
      font-size: 14px;
    }

    /* Loading */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 64px 0;
      color: var(--text-secondary);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 600ms linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-state {
      text-align: center;
      padding: 64px 0;
      color: var(--text-secondary);
    }

    /* Carousel */
    .carousel {
      position: relative;
      overflow: hidden;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      margin-bottom: 24px;
      min-height: 180px;
    }

    .carousel-track {
      display: flex;
      transition: transform 500ms ease-in-out;
    }

    .carousel-slide {
      min-width: 100%;
      padding: 40px 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      box-sizing: border-box;
    }

    .carousel-brand {
      font-size: 36px;
      font-weight: 800;
      color: #FFD600;
      margin: 0 0 4px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .carousel-sub {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 8px;
    }

    .carousel-msg {
      font-size: 14px;
      color: rgba(255,255,255,0.8);
      margin: 0;
      max-width: 500px;
    }

    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0,0,0,0.4);
      color: #fff;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: background 150ms;
      z-index: 2;
      padding: 0;
    }

    .carousel-arrow:hover {
      background: rgba(0,0,0,0.7);
    }

    .carousel-arrow--prev {
      left: 12px;
    }

    .carousel-arrow--next {
      right: 12px;
    }

    .carousel-dots {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
    }

    .carousel-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255,255,255,0.4);
      border: none;
      cursor: pointer;
      transition: background 150ms, transform 150ms;
      padding: 0;
    }

    .carousel-dot.active {
      background: #FFD600;
      transform: scale(1.3);
    }

    .carousel-dot:hover {
      background: rgba(255,255,255,0.7);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .home-container {
        padding: 0;
      }

      .carousel-slide {
        padding: 28px 40px;
      }

      .carousel-brand {
        font-size: 26px;
      }

      .carousel-sub {
        font-size: 15px;
      }

      .carousel-msg {
        font-size: 13px;
      }

      .carousel-arrow {
        width: 30px;
        height: 30px;
        font-size: 13px;
      }

      .tab-nav {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .tab-nav button {
        padding: 12px 16px;
        font-size: 13px;
        white-space: nowrap;
      }

      .stat-cards-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
      }

      .stat-card {
        padding: 14px;
      }

      .stat-card-value {
        font-size: 24px;
      }

      .quick-links-grid {
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .bar-label {
        min-width: 70px;
        font-size: 12px;
      }

      .activity-item {
        flex-wrap: wrap;
        gap: 8px;
      }
    }

    @media (max-width: 480px) {
      .carousel-slide {
        padding: 24px 16px;
      }

      .carousel-brand {
        font-size: 22px;
      }

      .carousel-sub {
        font-size: 14px;
      }

      .carousel-msg {
        font-size: 12px;
      }

      .carousel-arrow {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .carousel-track {
        transition: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tab-content {
        animation: none;
      }

      .spinner {
        animation: none;
      }

      .bar-fill {
        transition: none;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly itemService = inject(ItemService);
  private readonly incidenciaService = inject(IncidenciaService);
  private readonly locationService = inject(LocationService);

  protected activeTab: Tab = 'overview';
  protected loading = true;
  protected error = false;

  protected slides = [
    { title: 'Iven', subtitle: 'Sistema de Inventario Escolar', text: 'Gestiona tu inventario escolar de forma eficiente' },
    { title: 'Iven', subtitle: 'Control Total', text: 'Control de equipos, ubicaciones e incidencias' },
    { title: 'Iven', subtitle: 'Codigos QR', text: 'Codigos QR para identificacion rapida' },
    { title: 'Iven', subtitle: 'Informes Profesionales', text: 'Informes PDF con localizaciones' },
  ];
  protected currentSlide = 0;
  protected isPaused = false;
  private carouselInterval: ReturnType<typeof setInterval> | null = null;

  protected nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  protected prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  protected goToSlide(index: number): void {
    this.currentSlide = index;
  }

  private startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, 5000);
  }

  private products: ProductDTO[] = [];
  private computerCount = 0;
  private monitorCount = 0;
  private keyboardCount = 0;
  private mouseCount = 0;
  private incidencias: IncidenciaDTO[] = [];
  private locationCount = 0;

  /* ---- computed signals ---- */

  protected overviewCards = signal<StatCard[]>([]);
  protected itemCounts = signal({
    computers: 0, monitors: 0, keyboards: 0, mice: 0,
    incidencias: 0, locations: 0
  });
  protected itemsByType = signal<StatBar[]>([]);
  protected itemsByStatus = signal<StatBar[]>([]);
  protected incidentsByStatus = signal<StatBar[]>([]);
  protected incidentsByPriority = signal<StatBar[]>([]);
  protected recentIncidencias = signal<IncidenciaDTO[]>([]);

  protected setTab(tab: Tab): void {
    this.activeTab = tab;
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.startCarousel();
  }

  private loadDashboard(): void {
    race(
      forkJoin({
        products: this.productService.getAllProducts().pipe(
          catchError(() => of([]))
        ),
        computers: this.itemService.getAll('computer').pipe(
          catchError(() => of([]))
        ),
        monitors: this.itemService.getAll('monitor').pipe(
          catchError(() => of([]))
        ),
        keyboards: this.itemService.getAll('keyboard').pipe(
          catchError(() => of([]))
        ),
        mice: this.itemService.getAll('mouse').pipe(
          catchError(() => of([]))
        ),
        incidencias: this.incidenciaService.getIncidencias().pipe(
          catchError(() => of([]))
        ),
        locations: this.locationService.getLocations().pipe(
          catchError(() => of([]))
        )
      }),
      timer(10000).pipe(map(() => null))
    ).subscribe({
      next: (data) => {
        if (!data) {
          this.error = true;
          this.loading = false;
          return;
        }
        this.products = data.products;
        this.computerCount = data.computers.length;
        this.monitorCount = data.monitors.length;
        this.keyboardCount = data.keyboards.length;
        this.mouseCount = data.mice.length;
        this.incidencias = data.incidencias;
        this.locationCount = data.locations.length;

        this.computeOverview();
        this.computeStatistics();
        this.computeActivity();
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  private computeOverview(): void {
    const totalItems = this.computerCount + this.monitorCount + this.keyboardCount + this.mouseCount;
    const activeStatuses = ['available', 'assigned'];
    const activeItems = this.products.filter(p => activeStatuses.includes(p.status)).length;
    const openIncidents = this.incidencias.filter(i => i.status === 'open' || i.status === 'in_progress').length;

    this.overviewCards.set([
      { label: 'Total Items', value: totalItems, icon: '📦', color: '#FFD600' },
      { label: 'Computers', value: this.computerCount, icon: '💻', color: '#2196F3', link: '/computers' },
      { label: 'Monitors', value: this.monitorCount, icon: '🖥️', color: '#4CAF50', link: '/monitors' },
      { label: 'Keyboards', value: this.keyboardCount, icon: '⌨️', color: '#FF9800', link: '/keyboards' },
      { label: 'Mice', value: this.mouseCount, icon: '🖱️', color: '#9C27B0', link: '/mice' },
      { label: 'Active Items', value: activeItems, icon: '✅', color: '#4CAF50' },
      { label: 'Incidents Open', value: openIncidents, icon: '⚠️', color: '#F44336', link: '/incidencias' },
      { label: 'Locations', value: this.locationCount, icon: '📍', color: '#00BCD4', link: '/admin/locations' },
    ]);

    this.itemCounts.set({
      computers: this.computerCount,
      monitors: this.monitorCount,
      keyboards: this.keyboardCount,
      mice: this.mouseCount,
      incidencias: openIncidents,
      locations: this.locationCount
    });
  }

  private computeStatistics(): void {
    const totalItems = this.computerCount + this.monitorCount + this.keyboardCount + this.mouseCount;

    this.itemsByType.set([
      { label: 'Computers', value: this.computerCount, color: '#2196F3', total: totalItems },
      { label: 'Monitors', value: this.monitorCount, color: '#4CAF50', total: totalItems },
      { label: 'Keyboards', value: this.keyboardCount, color: '#FF9800', total: totalItems },
      { label: 'Mice', value: this.mouseCount, color: '#9C27B0', total: totalItems },
    ]);

    const statusOrder = ['available', 'assigned', 'maintenance', 'disabled'];
    const statusColors: Record<string, string> = {
      available: '#4CAF50',
      assigned: '#2196F3',
      maintenance: '#FF9800',
      disabled: '#9E9E9E'
    };
    const statusLabels: Record<string, string> = {
      available: 'Available',
      assigned: 'Assigned',
      maintenance: 'Maintenance',
      disabled: 'Disabled'
    };
    const total = this.products.length;
    this.itemsByStatus.set(
      statusOrder.map(status => ({
        label: statusLabels[status],
        value: this.products.filter(p => p.status === status).length,
        color: statusColors[status],
        total
      }))
    );

    const incStatusOrder = ['open', 'in_progress', 'resolved', 'closed'];
    const incStatusColors: Record<string, string> = {
      open: '#F44336',
      in_progress: '#FF9800',
      resolved: '#4CAF50',
      closed: '#9E9E9E'
    };
    const incStatusLabels: Record<string, string> = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed'
    };
    const incTotal = this.incidencias.length;
    this.incidentsByStatus.set(
      incStatusOrder.map(status => ({
        label: incStatusLabels[status],
        value: this.incidencias.filter(i => i.status === status).length,
        color: incStatusColors[status],
        total: incTotal
      }))
    );

    const priorityOrder = ['low', 'medium', 'high', 'critical'];
    const priorityColors: Record<string, string> = {
      low: '#4CAF50',
      medium: '#2196F3',
      high: '#FF9800',
      critical: '#F44336'
    };
    const priorityLabels: Record<string, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    };
    this.incidentsByPriority.set(
      priorityOrder.map(priority => ({
        label: priorityLabels[priority],
        value: this.incidencias.filter(i => i.priority === priority).length,
        color: priorityColors[priority],
        total: incTotal
      }))
    );
  }

  private computeActivity(): void {
    const activeIncidencias = this.incidencias
      .filter(i => i.status === 'open' || i.status === 'in_progress')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    this.recentIncidencias.set(activeIncidencias);
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }
}
