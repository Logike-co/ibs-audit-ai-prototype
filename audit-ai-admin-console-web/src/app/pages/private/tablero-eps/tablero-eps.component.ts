import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin/admin.service';

interface FilaTableroEps {
  tenantSchema: string;
  factura: string;
  nur: string;
  periodo: '2025' | '2026';
  regional: string;
  regimen: 'Contributivo' | 'Subsidiado';
  ips: string;
  causal: string;
  valorGlosa: number;
  estado: string;
}

const FILAS: FilaTableroEps[] = [
  {
    tenantSchema: 'tenant_sos',
    factura: 'A118492568',
    nur: 'NUR-2026-8849202',
    periodo: '2026',
    regional: 'Valle',
    regimen: 'Contributivo',
    ips: 'Clínica Imbanaco',
    causal: 'TA0201 · tarifa vs SOAT',
    valorGlosa: 1450000,
    estado: 'Notificada'
  },
  {
    tenantSchema: 'tenant_sos',
    factura: 'A118492601',
    nur: 'NUR-2026-8849203',
    periodo: '2026',
    regional: 'Valle',
    regimen: 'Subsidiado',
    ips: 'Clínica Valle del Lili',
    causal: 'AU0101 · sin autorización',
    valorGlosa: 950000,
    estado: 'En conciliación'
  },
  {
    tenantSchema: 'tenant_neps',
    factura: 'A117880012',
    nur: 'NUR-2025-4411001',
    periodo: '2025',
    regional: 'Cauca',
    regimen: 'Contributivo',
    ips: 'Hospital San José',
    causal: 'FA0302 · factura duplicada',
    valorGlosa: 3200000,
    estado: 'Cerrada'
  },
  {
    tenantSchema: 'tenant_neps',
    factura: 'A119003344',
    nur: 'NUR-2026-9001888',
    periodo: '2026',
    regional: 'Nariño',
    regimen: 'Subsidiado',
    ips: 'ESE Pasto',
    causal: 'ME0104 · pertinencia',
    valorGlosa: 780000,
    estado: 'Bandeja HITL'
  }
];

@Component({
  selector: 'app-tablero-eps',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div>
          <div class="flex items-center space-x-2">
            <h2 class="text-xl font-bold text-slate-800">Tablero de glosas EPS</h2>
            <span class="demo-us-label bg-violet-900 text-violet-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-violet-700">
              US-18 · TABLERO EPS (T-03N-08)
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Vista de demostración con datos ficticios 2025–2026 y <strong>configurador de columnas parametrizables</strong> (Acuerdo 3 Mesa 06-Nov).
          </p>
        </div>

        <!-- Botón Modal Columnas -->
        <button type="button" 
                (click)="modalColumnas.set(!modalColumnas())"
                class="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 shadow-xs">
          <span>⚙ Columnas Visibles</span>
        </button>
      </div>

      <!-- MODAL / POPOVER CONFIGURADOR DE COLUMNAS -->
      <div *ngIf="modalColumnas()" class="bg-slate-50 p-3.5 rounded-lg border border-slate-300 shadow-sm flex flex-wrap gap-4 text-xs font-semibold text-slate-700 animate-in fade-in">
        <span class="text-slate-500 font-bold uppercase tracking-wider self-center text-[10px]">Configurar Columnas:</span>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" [(ngModel)]="colPeriodo" class="rounded text-blue-600" /> Periodo
        </label>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" [(ngModel)]="colRegional" class="rounded text-blue-600" /> Regional
        </label>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" [(ngModel)]="colRegimen" class="rounded text-blue-600" /> Régimen
        </label>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" [(ngModel)]="colIps" class="rounded text-blue-600" /> IPS
        </label>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" [(ngModel)]="colCausal" class="rounded text-blue-600" /> Causal
        </label>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" [(ngModel)]="colValor" class="rounded text-blue-600" /> Valor Glosa
        </label>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-3">
        <label *ngIf="service.puedeCambiarTenant()" class="text-xs font-bold text-slate-600 uppercase tracking-wide">
          EPS
          <select name="tenant" class="mt-1 w-full border-slate-300 rounded text-sm p-2 font-medium bg-white"
                  [ngModel]="service.tenantActivo()" (ngModelChange)="onTenant($event)">
            <option value="tenant_sos">SOS EPS</option>
            <option value="tenant_neps">Nueva EPS</option>
          </select>
        </label>
        <p *ngIf="!service.puedeCambiarTenant()" class="text-xs font-bold text-slate-600 uppercase tracking-wide">
          EPS
          <span class="mt-1 block text-sm font-medium text-slate-900 normal-case tracking-normal">{{ service.tenantEnPantalla().name }}</span>
        </p>
        <label class="text-xs font-bold text-slate-600 uppercase tracking-wide">
          Periodo
          <select name="periodo" class="mt-1 w-full border-slate-300 rounded text-sm p-2 font-medium"
                  [ngModel]="periodo()" (ngModelChange)="periodo.set($event)">
            <option value="TODOS">Todos</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </label>
        <label class="text-xs font-bold text-slate-600 uppercase tracking-wide">
          Regional
          <select name="regional" class="mt-1 w-full border-slate-300 rounded text-sm p-2 font-medium"
                  [ngModel]="regional()" (ngModelChange)="regional.set($event)">
            <option value="TODAS">Todas</option>
            <option value="Valle">Valle</option>
            <option value="Cauca">Cauca</option>
            <option value="Nariño">Nariño</option>
          </select>
        </label>
        <label class="text-xs font-bold text-slate-600 uppercase tracking-wide">
          Régimen
          <select name="regimen" class="mt-1 w-full border-slate-300 rounded text-sm p-2 font-medium"
                  [ngModel]="regimen()" (ngModelChange)="regimen.set($event)">
            <option value="TODOS">Todos</option>
            <option value="Contributivo">Contributivo</option>
            <option value="Subsidiado">Subsidiado</option>
          </select>
        </label>
        <label class="text-xs font-bold text-slate-600 uppercase tracking-wide">
          Buscar factura
          <input type="search" name="factura" class="mt-1 w-full border-slate-300 rounded text-sm p-2 font-mono"
                 placeholder="A118492568"
                 [ngModel]="busqueda()" (ngModelChange)="busqueda.set($event)">
        </label>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Factura</th>
              <th *ngIf="colPeriodo" class="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Periodo</th>
              <th *ngIf="colRegional" class="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Regional</th>
              <th *ngIf="colRegimen" class="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Régimen</th>
              <th *ngIf="colIps" class="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">IPS</th>
              <th *ngIf="colCausal" class="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Causal</th>
              <th *ngIf="colValor" class="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Valor glosa</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let f of filtradas()"
                (click)="seleccionar(f)"
                class="hover:bg-slate-50 cursor-pointer"
                [style.background-color]="detalle()?.factura === f.factura ? 'color-mix(in srgb, var(--color-brand) 10%, white)' : null">
              <td class="px-4 py-3 text-sm font-mono font-bold text-slate-900">{{ f.factura }}</td>
              <td *ngIf="colPeriodo" class="px-4 py-3 text-sm text-slate-700">{{ f.periodo }}</td>
              <td *ngIf="colRegional" class="px-4 py-3 text-sm text-slate-700">{{ f.regional }}</td>
              <td *ngIf="colRegimen" class="px-4 py-3 text-sm text-slate-700">{{ f.regimen }}</td>
              <td *ngIf="colIps" class="px-4 py-3 text-sm text-slate-700">{{ f.ips }}</td>
              <td *ngIf="colCausal" class="px-4 py-3 text-sm text-slate-700">{{ f.causal }}</td>
              <td *ngIf="colValor" class="px-4 py-3 text-sm text-right font-medium text-rose-700">{{ f.valorGlosa | currency:'COP':'symbol':'1.0-0' }}</td>
            </tr>
            <tr *ngIf="filtradas().length === 0">
              <td colspan="7" class="px-4 py-8 text-center text-sm text-slate-500">Ninguna factura con esos filtros.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="detalle()" class="bg-white p-6 rounded-lg shadow border-2 relative"
           style="border-color: color-mix(in srgb, var(--color-brand) 35%, white);">
        <button type="button" (click)="detalle.set(null)" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700">✕</button>
        <p class="text-[10px] font-bold uppercase tracking-wide text-[var(--color-brand)]">Detalle de glosa (demo)</p>
        <h3 class="text-lg font-black text-slate-900 font-mono mt-1">{{ detalle()!.factura }}</h3>
        <p class="text-xs text-slate-500 font-mono">{{ detalle()!.nur }} · tenant {{ service.tenantEnPantalla().name }}</p>
        <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><dt class="text-xs text-slate-500">Estado</dt><dd class="font-medium">{{ detalle()!.estado }}</dd></div>
          <div><dt class="text-xs text-slate-500">Causal</dt><dd class="font-medium">{{ detalle()!.causal }}</dd></div>
          <div><dt class="text-xs text-slate-500">IPS</dt><dd class="font-medium">{{ detalle()!.ips }}</dd></div>
          <div><dt class="text-xs text-slate-500">Valor</dt><dd class="font-medium text-rose-700">{{ detalle()!.valorGlosa | currency:'COP':'symbol':'1.0-0' }}</dd></div>
        </dl>
      </div>
    </div>
  `
})
export class TableroEpsComponent {
  service = inject(AdminService);
  periodo = signal('TODOS');
  regional = signal('TODAS');
  regimen = signal('TODOS');
  busqueda = signal('');
  detalle = signal<FilaTableroEps | null>(null);

  modalColumnas = signal(false);
  colPeriodo = true;
  colRegional = true;
  colRegimen = true;
  colIps = true;
  colCausal = true;
  colValor = true;

  filtradas = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const periodo = this.periodo();
    const regional = this.regional();
    const regimen = this.regimen();
    const tenant = this.service.tenantActivo();
    return FILAS.filter(f =>
      f.tenantSchema === tenant &&
      (periodo === 'TODOS' || f.periodo === periodo) &&
      (regional === 'TODAS' || f.regional === regional) &&
      (regimen === 'TODOS' || f.regimen === regimen) &&
      (!q || f.factura.toLowerCase().includes(q))
    );
  });

  onTenant(tenant: string) {
    this.service.cambiarTenant(tenant);
    this.detalle.set(null);
  }

  seleccionar(f: FilaTableroEps) {
    this.detalle.set(f);
  }
}
