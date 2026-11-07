import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email = signal('');
  password = signal('');
  otp = signal('');
  
  errorMessage = signal('');
  requiresOtp = signal(false);

  login() {
    this.errorMessage.set('');
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor ingresa correo y contraseña.');
      return;
    }
    
    const result = this.authService.authenticate(this.email(), this.password());
    
    if (result.success) {
      if (result.role === 'AUDITOR_MEDICO') {
        this.requiresOtp.set(true);
      } else {
        this.router.navigate(['/inicio']);
      }
    } else {
      this.errorMessage.set(result.error || 'Credenciales inválidas.');
    }
  }

  validateOtp() {
    if (this.otp().length === 6) {
      this.router.navigate(['/inicio']);
    } else {
      this.errorMessage.set('Código OTP inválido.');
    }
  }
}