import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export type PerfilAdmin = 'SUPERADMIN' | 'ADMIN_TENANT';

export interface SesionAdmin {
  email: string;
  perfil: PerfilAdmin;
  tenantSchema: string;
  tenantNombre: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal(false);
  sesion = signal<SesionAdmin | null>(null);
  private pendiente: SesionAdmin | null = null;

  constructor(private router: Router) {}

  login(email: string, _pass: string): boolean {
    const normalizado = email.trim().toLowerCase();
    if (normalizado === 'admin@ibs.com') {
      this.pendiente = {
        email: normalizado,
        perfil: 'SUPERADMIN',
        tenantSchema: 'tenant_sos',
        tenantNombre: 'SOS EPS'
      };
      return true;
    }
    if (normalizado === 'admin@sos.com') {
      this.pendiente = {
        email: normalizado,
        perfil: 'ADMIN_TENANT',
        tenantSchema: 'tenant_sos',
        tenantNombre: 'SOS EPS'
      };
      return true;
    }
    return false;
  }

  verifyOtp(code: string): SesionAdmin | null {
    if (code === '123456' && this.pendiente) {
      this.isAuthenticated.set(true);
      this.sesion.set(this.pendiente);
      const aplicada = this.pendiente;
      this.pendiente = null;
      this.router.navigate(['/inicio']);
      return aplicada;
    }
    return null;
  }

  logout() {
    this.isAuthenticated.set(false);
    this.sesion.set(null);
    this.pendiente = null;
    this.router.navigate(['/login']);
  }
}