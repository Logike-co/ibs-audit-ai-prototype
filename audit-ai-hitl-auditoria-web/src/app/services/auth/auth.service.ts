import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal(false);
  
  constructor(private router: Router) {}

  login(email: string, pass: string): boolean {
    if (email === 'auditor@ibs.com') {
      return true; // Requiere OTP
    }
    return false;
  }

  verifyOtp(code: string): boolean {
    if (code === '123456') {
      this.isAuthenticated.set(true);
      this.router.navigate(['/inicio']);
      return true;
    }
    return false;
  }

  logout() {
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
}