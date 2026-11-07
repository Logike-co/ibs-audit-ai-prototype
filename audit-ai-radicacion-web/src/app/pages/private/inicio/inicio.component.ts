import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { RadicacionService } from '../../../services/radicacion/radicacion.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
        <h2 class="text-xl font-bold text-slate-800">Inicio</h2>
        <p class="text-sm text-slate-600 mt-1">
          {{ auth.sesion().ips }} · NIT {{ auth.sesion().nit }}.
          Este radicador solo ve facturas y glosas de su prestadora.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a routerLink="/radicacion"
           class="block bg-white p-5 rounded-lg border border-slate-200 hover:border-[var(--color-brand)] shadow-sm transition">
          <h3 class="font-bold text-slate-900">Carga del paquete</h3>
          <p class="text-xs text-slate-500 mt-1">ZIP FEV/RIPS, tipo de contrato y NUR.</p>
        </a>
        <a routerLink="/radicaciones"
           class="block bg-white p-5 rounded-lg border border-slate-200 hover:border-[var(--color-brand)] shadow-sm transition">
          <h3 class="font-bold text-slate-900">Radicaciones</h3>
          <p class="text-xs text-slate-500 mt-1">{{ service.radicacionesDelUsuario().length }} agrupadores de esta IPS.</p>
        </a>
        <a routerLink="/respuestas"
           class="block bg-white p-5 rounded-lg border border-slate-200 hover:border-[var(--color-brand)] shadow-sm transition">
          <h3 class="font-bold text-slate-900">Respuestas a glosas</h3>
          <p class="text-xs text-slate-500 mt-1">{{ service.cuentasGlosadasPendientes().length }} pendientes de esta IPS.</p>
        </a>
      </div>
    </div>
  `
})
export class InicioComponent {
  auth = inject(AuthService);
  service = inject(RadicacionService);
}
