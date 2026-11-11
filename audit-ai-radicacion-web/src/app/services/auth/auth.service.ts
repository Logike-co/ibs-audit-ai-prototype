import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface SesionIps {
  email: string;
  role: 'RADICADOR' | 'AUDITOR_MEDICO';
  ips: string;
  nit: string;
  tenantSchema: string;
}

export interface EventoSeguridad {
  tipo: 'account_lockout';
  usuario: string;
  fecha: string;
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
  static readonly MAX_FAILED_ATTEMPTS = 5;
  static readonly LOCK_MS = 15 * 60 * 1000;

  isAuthenticated = signal(false);
  failedAttempts = signal(0);
  isBlocked = signal(false);
  blockedUntilMs = signal<number | null>(null);
  eventosSeguridad = signal<EventoSeguridad[]>([]);
  sesion = signal<SesionIps>(SESION_RADICADOR_IMBANACO);

  nowMs = (): number => Date.now();

  constructor(private router: Router) {}

  authenticate(email: string, pass: string): { success: boolean, role?: string, error?: string } {
    this.refreshLockout();
    if (this.isBlocked()) {
      return { success: false, error: 'Cuenta bloqueada temporalmente por 15 minutos por intentos fallidos.' };
    }

    if (email === 'radicador@sos.com' && pass === '1234') {
      this.isAuthenticated.set(true);
      this.failedAttempts.set(0);
      this.blockedUntilMs.set(null);
      this.isBlocked.set(false);
      this.sesion.set({ ...SESION_RADICADOR_IMBANACO, email });
      return { success: true, role: 'RADICADOR' };
    }

    if (email === 'auditor@ibs.com' && pass === '1234') {
      this.isAuthenticated.set(true);
      this.failedAttempts.set(0);
      this.blockedUntilMs.set(null);
      this.isBlocked.set(false);
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
    if (this.failedAttempts() >= AuthService.MAX_FAILED_ATTEMPTS) {
      const until = this.nowMs() + AuthService.LOCK_MS;
      this.blockedUntilMs.set(until);
      this.isBlocked.set(true);
      this.eventosSeguridad.update(events => [...events, {
        tipo: 'account_lockout',
        usuario: email,
        fecha: new Date(this.nowMs()).toISOString()
      }]);
      return { success: false, error: 'Cuenta bloqueada temporalmente por 15 minutos por intentos fallidos.' };
    }
    return { success: false, error: 'Credenciales inválidas.' };
  }

  logout() {
    this.isAuthenticated.set(false);
    this.sesion.set(SESION_RADICADOR_IMBANACO);
    this.router.navigate(['/login']);
  }

  private refreshLockout(): void {
    const until = this.blockedUntilMs();
    if (until !== null && this.nowMs() >= until) {
      this.isBlocked.set(false);
      this.blockedUntilMs.set(null);
      this.failedAttempts.set(0);
    }
  }
}
