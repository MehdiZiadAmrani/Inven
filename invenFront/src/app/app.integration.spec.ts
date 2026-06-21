import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingHarness } from '@angular/router/testing';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { AuthService, User } from './services/auth.service';
import { authGuard } from './services/auth.guard';

@Component({
  standalone: true,
  template: '<p>dashboard-stub</p>',
  host: { 'data-testid': 'dashboard-stub' },
})
class DashboardStubComponent {}

@Component({
  standalone: true,
  template: '<p>login-stub</p>',
  host: { 'data-testid': 'login-stub' },
})
class LoginStubComponent {}

const testRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardStubComponent },
    ],
  },
  { path: 'login', component: LoginStubComponent },
];

describe('App Integration: layout shell', () => {
  let currentUserSubject: BehaviorSubject<User | null>;
  let mockAuthService: {
    currentUser$: BehaviorSubject<User | null>;
    isLoggedIn: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User | null>(null);
    mockAuthService = {
      currentUser$: currentUserSubject,
      isLoggedIn: vi.fn(),
      logout: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter(testRoutes),
        { provide: AuthService, useValue: mockAuthService },
      ],
      teardown: { destroyAfterEach: true },
    });
  });

  it('should render <app-navbar> when navigating to /dashboard (protected route inside layout shell)', async () => {
    mockAuthService.isLoggedIn.mockReturnValue(true);
    currentUserSubject.next({ username: 'admin', role: 'ADMIN', token: 'abc' });

    const harness = await RouterTestingHarness.create('/dashboard');
    harness.detectChanges();

    const navbarEl = harness.fixture.debugElement.query(By.css('app-navbar'));
    expect(navbarEl).toBeTruthy();
  });

  it('should not render <app-navbar> when navigating to /login (public route outside layout shell)', async () => {
    const harness = await RouterTestingHarness.create('/login');
    harness.detectChanges();

    const navbarEl = harness.fixture.debugElement.query(By.css('app-navbar'));
    expect(navbarEl).toBeFalsy();
  });
});
