import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MainLayoutComponent } from './main-layout.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AuthService, User } from '../../services/auth.service';

describe('MainLayoutComponent', () => {
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    const currentUserSubject = new BehaviorSubject<User | null>(null);

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser$: currentUserSubject.asObservable(),
            logout: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    fixture.detectChanges();
  });

  it('should render <router-outlet> in the template', () => {
    const outletEl = fixture.debugElement.query(By.css('router-outlet'));
    expect(outletEl).toBeTruthy();
  });

  it('should render <app-navbar> in the template', () => {
    const navbarEl = fixture.debugElement.query(By.directive(NavbarComponent));
    expect(navbarEl).toBeTruthy();
  });
});
