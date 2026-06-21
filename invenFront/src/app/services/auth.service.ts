import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from '../config/environment';

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface User {
  username: string;
  role: 'ADMIN' | 'USER';
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly AUTH_URL = `${API_BASE_URL}/auth`;
  
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor() {
    const storedUser = this.getUserFromStorage();
    
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.AUTH_URL}/login`, { username, password }).pipe(
      tap(response => {
        const user: User = {
          username: response.username,
          role: response.role as 'ADMIN' | 'USER',
          token: response.token
        };
        this.safeSetInStorage('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.AUTH_URL}/register`, { username, password }).pipe(
      tap(response => {
        const user: User = {
          username: response.username,
          role: response.role as 'ADMIN' | 'USER',
          token: response.token
        };
        this.safeSetInStorage('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    this.safeRemoveFromStorage('user');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    const user = this.getCurrentUser();
    return user?.token || null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ADMIN';
  }

  private getUserFromStorage(): User | null {
    try {
      if (!isPlatformBrowser(this.platformId)) {
        return null;
      }

      const userJson = localStorage.getItem('user');
      if (!userJson) return null;

      const parsed: User = JSON.parse(userJson);
      
      if (!parsed.username || !parsed.token || !parsed.role) {
        this.safeRemoveFromStorage('user');
        return null;
      }

      return parsed;
    } catch {
      this.safeRemoveFromStorage('user');
      return null;
    }
  }

  private safeSetInStorage(key: string, value: string): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(key, value);
      }
    } catch {
      // Storage unavailable — silent fallback
    }
  }

  private safeRemoveFromStorage(key: string): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem(key);
      }
    } catch {
      // Storage unavailable — silent fallback
    }
  }
}
