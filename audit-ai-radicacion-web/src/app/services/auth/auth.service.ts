import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface SesionIps {
  email: string;
  role: 'RADICADOR' | 'AUDITOR_MEDICO';
  ips: string;
  nit: string;
  tenantSchema: string;
}

const SESION_RADICADOR_IMBANACO: SesionIps = {
  email: 'radicador@sos.com',
  role: 'RADICADOR',
  ips: 'Clínica Imbanaco',
  nit: '805.001.157-2',
  tenantSchema: 'tenant_sos'
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal(false);
  failedAttempts = signal(0);
  isBlocked = signal(false);
  sesion = signal<SesionIps>(SESION_RADICADOR_IMBANACO);

  constructor(private router: Router) {}

  authenticate(email: string, pass: string): { success: boolean, role?: string, error?: string } {
    if (this.isBlocked()) return { success: false, error: 'Usuario bloqueado por múltiples intentos fallidos.' };

    if (email === 'radicador@sos.com' && pass === '1234') {
      this.isAuthenticated.set(true);
      this.failedAttempts.set(0);
      this.sesion.set({ ...SESION_RADICADOR_IMBANACO, email });
      return { success: true, role: 'RADICADOR' };
    }

    if (email === 'auditor@ibs.com' && pass === '1234') {
      this.isAuthenticated.set(true);
      this.failedAttempts.set(0);
      this.sesion.set({
        email,
        role: 'AUDITOR_MEDICO',
        ips: 'SOS EPS',
        nit: '805.000.427-1',
        tenantSchema: 'tenant_sos'
      });
      return { success: true, role: 'AUDITOR_MEDICO' };
    }

    this.failedAttempts.update(v => v + 1);
    if (this.failedAttempts() >= 3) {
      this.isBlocked.set(true);
    }
    return { success: false, error: 'Credenciales inválidas.' };
  }

  logout() {
    this.isAuthenticated.set(false);
    this.sesion.set(SESION_RADICADOR_IMBANACO);
    this.router.navigate(['/login']);
  }
}
