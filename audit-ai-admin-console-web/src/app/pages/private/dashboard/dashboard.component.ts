import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div>
          <div class="flex items-center space-x-2">
            <h2 class="text-xl font-bold text-slate-800">Panel de Analítica Ejecutiva & ROI</h2>
            <span class="demo-us-label bg-violet-900 text-violet-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-violet-700">
              US-18 · TABLEROS & EXPOSICIÓN JURÍDICA
            </span>
            <span class="demo-us-label bg-slate-800 text-slate-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-700">
              US-20 · TRAZA FORENSE
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Cartera aislada de <strong class="text-[var(--color-brand)]">{{ service.tenantEnPantalla().name }}</strong>
            · esquema <span class="font-mono">{{ service.tenantActivo() }}</span>
            · {{ service.tenantEnPantalla().cuentasAuditadas | number }} cuentas. Las otras EPS no entran en estos KPIs.
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <label *ngIf="service.puedeCambiarTenant()" class="text-xs font-bold text-slate-600 uppercase tracking-wide">
            EPS
            <select class="mt-1 block border-slate-300 rounded shadow-sm text-sm p-1.5 bg-white font-medium min-w-[10rem]"
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
          <label class="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Periodo
            <select class="mt-1 block border-slate-300 rounded shadow-sm text-sm p-1.5 bg-slate-50 font-medium">
              <option>Octubre 2026 (Piloto en Producción)</option>
              <option>Septiembre 2026</option>
            </select>
          </label>
        </div>
      </div>
      
      <!-- GRID DE 4 KPIS EJECUTIVOS -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200 text-center">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Tasa Auto-Aprobación</h3>
          <p class="text-3xl font-black text-slate-900 mt-2">{{ service.kpis().tasaAutoAprobacion }}%</p>
          <p class="text-[11px] text-emerald-600 mt-1 font-bold">✓ Conforme (meta > 60%)</p>
        </div>
        
        <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200 text-center">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiempo Promedio Auditoría</h3>
          <p class="text-3xl font-black text-[var(--color-brand)] mt-2">{{ service.kpis().tiempoPromedioSegundos }}<span class="text-sm font-normal text-slate-500"> seg/cuenta</span></p>
          <p class="text-[11px] text-emerald-600 mt-1 font-bold">⚡ Reducción 96% (vs 20 min manual)</p>
        </div>

        <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200 text-center">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Cumplimiento Res. 2284</h3>
          <p class="text-3xl font-black text-emerald-600 mt-2">{{ service.kpis().cumplimientoNormativo2284 }}%</p>
          <p class="text-[11px] mt-1 font-medium" [ngClass]="service.kpis().glosasTacitasVencidas === 0 ? 'text-slate-500' : 'text-amber-700'">
            {{ service.kpis().glosasTacitasVencidas === 0 ? '0 glosas tácitas vencidas' : service.kpis().glosasTacitasVencidas + ' alertas de término en este tenant' }}
          </p>
        </div>

        <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200 text-center">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Glosas Detectadas (Mes)</h3>
          <p class="text-2xl font-black text-slate-900 mt-2">{{ service.kpis().totalGlosasRecuperadasCop | currency:'COP':'symbol':'1.0-0' }}</p>
          <p class="text-[11px] text-[var(--color-brand)] mt-1 font-bold">ROI Estimado: {{ service.kpis().roiEstimado }}x</p>
        </div>
      </div>

      <!-- DISTRIBUCIÓN DE CAUSALES DE GLOSA & RESUMEN DE TENANTS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Top Causales -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 class="font-bold text-slate-800 text-sm mb-4 flex items-center justify-between">
            <span>Top Causales de Glosa (Res. 3047 / 2284)</span>
            <span class="text-[11px] font-mono text-slate-400">Total Auditado: {{ service.tenantEnPantalla().cuentasAuditadas | number }} cuentas</span>
          </h3>
          <div class="space-y-4">
            <div *ngFor="let causal of service.causalesActivas()">
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-700 font-medium">{{ causal.codigo }} - {{ causal.descripcion }}</span>
                <span class="font-bold text-slate-900">{{ causal.porcentaje }}% ({{ causal.cuentas | number }})</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="h-2 rounded-full" style="background-color: var(--color-brand);" [style.width.%]="causal.porcentaje"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cartera del tenant activo (US-02: no mezcla otras EPS) -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 class="font-bold text-slate-800 text-sm mb-1">Cartera del tenant activo</h3>
          <p class="text-[11px] text-slate-500 mb-4">
            {{ service.tenantEnPantalla().name }} · {{ service.tenantEnPantalla().cuentasAuditadas | number }} cuentas.
            Las otras EPS quedan fuera de este esquema (US-02).
          </p>
          <div class="space-y-3">
            <div *ngFor="let fila of service.volumenCartera()"
                 class="p-3 rounded border flex items-center justify-between"
                 style="background-color: color-mix(in srgb, var(--color-brand) 8%, white); border-color: color-mix(in srgb, var(--color-brand) 22%, white);">
              <div>
                <p class="text-xs font-bold text-slate-900">{{ fila.ips }}</p>
                <p class="text-[10px] font-mono text-slate-500">{{ service.tenantActivo() }}</p>
              </div>
              <div class="text-right">
                <span class="text-xs font-black text-slate-900">{{ fila.cuentas | number }}</span>
                <span class="text-[10px] text-slate-500 block">cuentas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  service = inject(AdminService);
}
