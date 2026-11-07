import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin/admin.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
        <h2 class="text-xl font-bold text-slate-800">Inicio</h2>
        <p class="text-sm text-slate-600 mt-1">
          {{ service.perfil() === 'ADMIN_TENANT'
            ? 'Consola de ' + service.tenantEnPantalla().name + '. Solo ve datos y contratos de su EPS.'
            : 'Operador central IBS. Puede conmutar tenant en Analítica, Tablero y Contratos.' }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a *ngFor="let card of cards()"
           [routerLink]="card.ruta"
           class="block bg-white p-5 rounded-lg border border-slate-200 hover:border-[var(--color-brand)] shadow-sm transition">
          <h3 class="font-bold text-slate-900">{{ card.titulo }}</h3>
          <p class="text-xs text-slate-500 mt-1">{{ card.descripcion }}</p>
        </a>
      </div>
    </div>
  `
})
export class InicioComponent {
  service = inject(AdminService);

  cards() {
    const base = [
      { ruta: '/dashboard', titulo: 'Analítica', descripcion: 'KPI y cartera de la EPS en sesión.' },
      { ruta: '/tablero-eps', titulo: 'Tablero EPS', descripcion: 'Glosas filtradas por periodo, regional y régimen.' },
      { ruta: '/contratos', titulo: 'Contratos y tarifas', descripcion: 'Red contractual de la EPS en sesión.' }
    ];
    if (this.service.puedeCambiarTenant()) {
      return [
        ...base,
        { ruta: '/tenants', titulo: 'Tenants y S3', descripcion: 'Alta y aislamiento de entidades pagadoras.' }
      ];
    }
    return base;
  }
}
