import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Contrato } from '../../../services/admin/admin.service';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center bg-white p-4 rounded shadow border border-gray-200">
        <div>
          <div class="flex items-center space-x-2">
            <h2 class="text-xl font-bold text-gray-800">Contratos Vigentes y Manuales Tarifarios</h2>
            <span class="demo-us-label bg-emerald-900 text-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-700">
              US-19 · CONTRATOS, TARIFAS & REGLAS
            </span>
            <span class="demo-us-label bg-blue-900 text-blue-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-700">
              US-08 · CRUCE TARIFARIO
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ service.contratosDelTenant().length }} acuerdos de {{ service.tenantEnPantalla().name }}.
            {{ service.puedeCambiarTenant() ? 'El selector de EPS filtra la red contractual de esta pantalla.' : 'Este perfil solo ve los contratos de su EPS.' }}
          </p>
        </div>
        <label *ngIf="service.puedeCambiarTenant()" class="text-xs font-bold text-slate-600 uppercase tracking-wide">
          EPS
          <select class="mt-1 block border-slate-300 rounded text-sm p-2 font-medium bg-white min-w-[10rem]"
                  [ngModel]="service.tenantActivo()"
                  (ngModelChange)="service.cambiarTenant($event)">
            <option value="tenant_sos">SOS EPS</option>
            <option value="tenant_neps">Nueva EPS</option>
          </select>
        </label>
        <p *ngIf="!service.puedeCambiarTenant()" class="text-xs font-bold text-slate-600 uppercase tracking-wide">
          EPS
          <span class="mt-1 block text-sm font-medium text-slate-900 normal-case tracking-normal">{{ service.tenantEnPantalla().name }}</span>
        </p>
      </div>

      <div class="bg-white rounded shadow border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IPS / NIT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modalidad</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manual Tarifario Base</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reglas de Auditoría Especiales</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let c of service.contratosDelTenant()">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <span class="block font-bold">{{ c.ips }}</span>
                <span class="text-xs text-gray-400 font-mono">NIT: {{ c.nit }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                <span class="px-2 py-1 rounded-full font-bold text-[10px]"
                      [ngClass]="c.modalidad === 'EVENTO' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'">
                  {{ c.modalidad }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-gray-700">{{ c.manual }}</td>
              <td class="px-6 py-4 text-xs text-gray-600 max-w-xs">{{ c.reglasEspeciales }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{{ c.vigenciaDesde }} al {{ c.vigenciaHasta }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-slate-50 rounded shadow border border-slate-200 p-6 mt-8">
        <h3 class="text-lg font-bold text-slate-800 mb-4">Registrar Nuevo Contrato</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre IPS</label>
            <input [(ngModel)]="nuevaIps" placeholder="Ej. Clínica Nueva Cali" class="w-full border-gray-300 rounded shadow-sm text-sm p-2 focus:ring-violet-500 focus:border-violet-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">NIT</label>
            <input [(ngModel)]="nuevoNit" placeholder="Ej. 800.123.456-7" class="w-full border-gray-300 rounded shadow-sm text-sm p-2 focus:ring-violet-500 focus:border-violet-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
            <select [(ngModel)]="nuevaMod" class="w-full border-gray-300 rounded shadow-sm text-sm p-2 focus:ring-violet-500 focus:border-violet-500">
              <option value="EVENTO">EVENTO</option>
              <option value="CAPITA">CAPITA</option>
              <option value="PAGO GLOBAL PROSPECTIVO">PAGO GLOBAL PROSPECTIVO</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Manual Tarifario</label>
            <select [(ngModel)]="nuevoManual" class="w-full border-gray-300 rounded shadow-sm text-sm p-2 focus:ring-violet-500 focus:border-violet-500">
              <option>SOAT 2026 Pleno</option>
              <option>SOAT 2026 + 5% Quirúrgico</option>
              <option>SOAT 2026 + 10%</option>
              <option>ISS 2001 + 15%</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Reglas Especiales de Auditoría</label>
            <input [(ngModel)]="nuevasReglas" placeholder="Condiciones de Bounding Box, derechos de sala o porcentajes pactados..." class="w-full border-gray-300 rounded shadow-sm text-sm p-2 focus:ring-violet-500 focus:border-violet-500">
          </div>
          <div class="flex space-x-2 col-span-2">
            <div class="w-1/2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <input type="date" [(ngModel)]="nuevoDesde" class="w-full border-gray-300 rounded shadow-sm text-sm p-2 focus:ring-violet-500 focus:border-violet-500">
            </div>
            <div class="w-1/2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <input type="date" [(ngModel)]="nuevoHasta" class="w-full border-gray-300 rounded shadow-sm text-sm p-2 focus:ring-violet-500 focus:border-violet-500">
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button (click)="guardar()" class="px-4 py-2 bg-slate-800 text-white rounded font-medium shadow hover:bg-slate-900 transition-colors">
            Guardar Contrato
          </button>
        </div>
      </div>
    </div>
  `
})
export class ContratosComponent {
  service = inject(AdminService);
  nuevaIps = '';
  nuevoNit = '';
  nuevaMod: 'EVENTO' | 'CAPITA' | 'PAGO GLOBAL PROSPECTIVO' = 'EVENTO';
  nuevoManual = 'SOAT 2026 + 5% Quirúrgico';
  nuevasReglas = '';
  nuevoDesde = '2026-01-01';
  nuevoHasta = '2027-01-01';

  guardar() {
    if (this.nuevaIps) {
      this.service.agregarContrato({ 
        ips: this.nuevaIps, 
        nit: this.nuevoNit || '800.000.000-0',
        modalidad: this.nuevaMod, 
        manual: this.nuevoManual, 
        vigenciaDesde: this.nuevoDesde, 
        vigenciaHasta: this.nuevoHasta,
        reglasEspeciales: this.nuevasReglas || 'Sin reglas especiales declaradas.'
      });
      this.nuevaIps = '';
      this.nuevoNit = '';
      this.nuevasReglas = '';
    }
  }
}
