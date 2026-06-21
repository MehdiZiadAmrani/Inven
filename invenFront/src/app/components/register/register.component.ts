import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-box">
        <h1>Create Account</h1>
        
        <form (ngSubmit)="onRegister()">
          <div class="form-group">
            <label>Username:</label>
            <input 
              type="text" 
              [(ngModel)]="username" 
              name="username"
              required
              pattern="[a-zA-Z0-9]+"
              title="Username must contain only letters and numbers"
            />
          </div>

          <div class="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password"
              required
              minlength="6"
              title="Password must be at least 6 characters"
            />
          </div>

          <div class="form-group">
            <label>Confirm Password:</label>
            <input 
              type="password" 
              [(ngModel)]="confirmPassword" 
              name="confirmPassword"
              required
            />
          </div>

          <button type="submit" [disabled]="isLoading">
            {{ isLoading ? 'Creating Account...' : 'Register' }}
          </button>
        </form>

        <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

        <p class="login-link">
          Already have an account? 
          <a routerLink="/login">Login here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--bg-page);
      font-family: var(--font-family);
      padding: 20px;
    }

    .register-box {
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

    .login-link {
      text-align: center;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .login-link a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  onRegister(): void {
    if (!this.username || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Username may already exist.';
      }
    });
  }
}
