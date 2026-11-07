import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-200">
        <div>
          <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">Portal del Auditor IBS</h2>
        </div>

        <form *ngIf="!mostrarOtp()" class="mt-8 space-y-6" (ngSubmit)="intentarLogin()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <input [(ngModel)]="email" name="email" type="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="auditor@ibs.com">
            </div>
            <div>
              <input [(ngModel)]="password" name="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Contraseña">
            </div>
          </div>
          <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90" style="background-color: var(--color-brand);">
            Ingresar
          </button>
        </form>

        <form *ngIf="mostrarOtp()" class="mt-8 space-y-6" (ngSubmit)="verificar()">
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <p class="text-sm text-blue-700">Ingrese el código de 6 dígitos enviado a su dispositivo móvil (123456).</p>
          </div>
          <input [(ngModel)]="otp" name="otp" type="text" required class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="OTP (Ej: 123456)">
          <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
            Verificar Identidad
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  email = '';
  password = '';
  otp = '';
  mostrarOtp = signal(false);

  intentarLogin() {
    if (this.authService.login(this.email, this.password)) {
      this.mostrarOtp.set(true);
    } else {
      alert('Credenciales incorrectas');
    }
  }

  verificar() {
    if (!this.authService.verifyOtp(this.otp)) {
      alert('Código OTP inválido');
    }
  }
}