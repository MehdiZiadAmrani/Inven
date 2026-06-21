import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NavbarComponent } from './navbar.component';
import { AuthService, User } from '../../../services/auth.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let currentUserSubject: BehaviorSubject<User | null>;
  let mockAuthService: {
    currentUser$: BehaviorSubject<User | null>;
    logout: ReturnType<typeof vi.fn>;
  };

  const adminUser: User = { username: 'admin', role: 'ADMIN', token: 'admin-token' };
  const regularUser: User = { username: 'user', role: 'USER', token: 'user-token' };

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User | null>(null);
    mockAuthService = {
      currentUser$: currentUserSubject,
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should render item-type navigation links (Computers, Monitors, Keyboards, Mice)', () => {
    fixture.detectChanges();

    const links = fixture.debugElement.queryAll(By.css('.nav-links a[role="menuitem"]'));
    const linkTexts = links.map((l) => l.nativeElement.textContent.trim());

    expect(linkTexts).toContain('Computers');
    expect(linkTexts).toContain('Monitors');
    expect(linkTexts).toContain('Keyboards');
    expect(linkTexts).toContain('Mice');
  });

  it('should show "Add Item" link when currentUser.role is ADMIN', () => {
    currentUserSubject.next(adminUser);
    fixture.detectChanges();

    const addItemLink = fixture.debugElement.query(By.css('.nav-link-admin'));
    expect(addItemLink).toBeTruthy();
    expect(addItemLink.nativeElement.textContent.trim()).toBe('Add Item');
  });

  it('should hide "Add Item" link when currentUser.role is USER', () => {
    currentUserSubject.next(regularUser);
    fixture.detectChanges();

    const addItemLink = fixture.debugElement.query(By.css('.nav-link-admin'));
    expect(addItemLink).toBeFalsy();
  });

  it('should hide "Add Item" link when no user is logged in', () => {
    fixture.detectChanges();

    const addItemLink = fixture.debugElement.query(By.css('.nav-link-admin'));
    expect(addItemLink).toBeFalsy();
  });

  it('should toggle isMenuOpen on hamburger click', () => {
    fixture.detectChanges();
    expect(component['isMenuOpen']).toBe(false);

    const hamburger = fixture.debugElement.query(By.css('.hamburger'));
    hamburger.nativeElement.click();
    expect(component['isMenuOpen']).toBe(true);

    hamburger.nativeElement.click();
    expect(component['isMenuOpen']).toBe(false);
  });

  it('should call authService.logout() and navigate to /login on logout', () => {
    currentUserSubject.next(adminUser);
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const logoutBtn = fixture.debugElement.query(By.css('.btn-logout'));
    logoutBtn.nativeElement.click();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
