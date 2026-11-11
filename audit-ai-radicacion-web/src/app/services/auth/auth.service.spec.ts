import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService US-01 lockout', () => {
  let service: AuthService;
  let now = 1_700_000_000_000;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    now = 1_700_000_000_000;
    service.nowMs = () => now;
  });

  it('no bloquea a los 3 intentos fallidos', () => {
    for (let i = 0; i < 3; i++) {
      const result = service.authenticate('radicador@sos.com', 'mala');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales inválidas.');
    }
    expect(service.isBlocked()).toBe(false);
    expect(service.eventosSeguridad()).toEqual([]);
  });

  it('bloquea 15 minutos al quinto fallo y registra evento con usuario, fecha y hora', () => {
    for (let i = 0; i < 4; i++) {
      service.authenticate('radicador@sos.com', 'mala');
    }
    const result = service.authenticate('radicador@sos.com', 'mala');
    expect(result.success).toBe(false);
    expect(result.error).toContain('15 minutos');
    expect(service.isBlocked()).toBe(true);
    expect(service.eventosSeguridad()).toEqual([
      {
        tipo: 'account_lockout',
        usuario: 'radicador@sos.com',
        fecha: new Date(now).toISOString(),
      },
    ]);
  });

  it('sigue bloqueado con la contraseña correcta antes de 15 minutos', () => {
    for (let i = 0; i < 5; i++) {
      service.authenticate('radicador@sos.com', 'mala');
    }
    now += 14 * 60 * 1000;
    const result = service.authenticate('radicador@sos.com', '1234');
    expect(result.success).toBe(false);
    expect(result.error).toContain('15 minutos');
    expect(service.isBlocked()).toBe(true);
  });

  it('desbloquea a los 15 minutos y permite el login', () => {
    for (let i = 0; i < 5; i++) {
      service.authenticate('radicador@sos.com', 'mala');
    }
    now += 15 * 60 * 1000;
    const result = service.authenticate('radicador@sos.com', '1234');
    expect(result.success).toBe(true);
    expect(service.isBlocked()).toBe(false);
  });

  it('un login exitoso reinicia el conteo de fallos', () => {
    for (let i = 0; i < 4; i++) {
      service.authenticate('radicador@sos.com', 'mala');
    }
    expect(service.authenticate('radicador@sos.com', '1234').success).toBe(true);
    expect(service.authenticate('radicador@sos.com', 'mala').error).toBe('Credenciales inválidas.');
    expect(service.isBlocked()).toBe(false);
  });
});
