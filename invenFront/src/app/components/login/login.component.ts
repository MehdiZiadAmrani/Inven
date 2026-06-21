import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-box">
        <div class="logo-container">
          <div class="logo-border">
          <img src="IvenFavIcon2.png" alt="Iven Logo" class="login-logo">
        </div>
        </div>
        
        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Username:</label>
            <input 
              type="text" 
              [(ngModel)]="username" 
              name="username"
              required
               />
          </div>

          <div class="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password"
              required
               />
          </div>

          <button type="submit" [disabled]="isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

        <p class="register-link">
          Don't have an account? 
          <a routerLink="/register">Register here</a>
        </p>

        <div class="demo-users">
          <p><strong>Demo Users:</strong></p>
          <p>Admin: admin / password123</p>
          <p>User: user / password123</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--bg-page);
      font-family: var(--font-family);
      padding: 20px;
    }

    .login-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      padding: 40px;
      width: 100%;
      max-width: 420px;
    }

    h1 {
      text-align: center;
      color: var(--primary);
      margin-bottom: 30px;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 30px;
    }

    .logo-border {
      padding: 15px;
      border: 3px solid var(--primary);
      border-radius: var(--radius-md);
      display: inline-block;
    }

    .login-logo {
      width: 150px;
      height: auto;
      display: block;
    }

    form {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 14px;
    }

    input {
      width: 100%;
      padding: 12px 14px;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 15px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    input::placeholder {
      color: var(--text-muted);
    }

    input:focus {
      outline: none;
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px rgba(255, 214, 0, 0.15);
    }

    button {
      width: 100%;
      padding: 13px;
      background: var(--primary);
      color: var(--text-on-primary);
      border: none;
      border-radius: var(--radius-sm);
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error {
      color: var(--status-unavailable);
      text-align: center;
      margin-bottom: 20px;
      font-size: 14px;
      background: rgba(244, 67, 54, 0.1);
      padding: 10px;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(244, 67, 54, 0.3);
    }

    .register-link {
      text-align: center;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .register-link a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }

    .demo-users {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
      font-size: 13px;
      color: var(--text-muted);
    }

    .demo-users p {
      margin: 5px 0;
    }

    .demo-users strong {
      color: var(--text-secondary);
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']).catch(() => {});
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
