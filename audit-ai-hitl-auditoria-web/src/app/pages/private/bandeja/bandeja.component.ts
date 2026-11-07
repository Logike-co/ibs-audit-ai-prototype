import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuditoriaService } from '../../../services/auditoria/auditoria.service';

@Component({
  selector: 'app-bandeja',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-8 max-w-5xl mx-auto w-full overflow-y-auto h-full">
      <div class="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        
        <!-- Header de la Bandeja -->
        <div class="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-xl font-bold text-slate-800">Bandeja de Excepciones Médicas (HITL)</h2>
              <span class="demo-us-label bg-indigo-900 text-indigo-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-700">
                US-08 · SEMÁFORO RES. 2284
              </span>
              <span class="demo-us-label bg-blue-900 text-blue-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-700">
                US-11 · BANDEJA HITL
              </span>
              <span class="demo-us-label bg-rose-900 text-rose-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-rose-700">
                US-17 · RELOJ 20 DÍAS
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Expedientes clínicos priorizados automáticamente por días hábiles restantes para evitar glosa tácita o sanción MinSalud.
            </p>
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="text-xs px-3 py-1 rounded-full font-bold text-[var(--color-brand)]"
                  style="background-color: color-mix(in srgb, var(--color-brand) 12%, white);">
              {{ bandeja().length }} casos pendientes
            </span>
          </div>
        </div>

        <!-- T-03N-06 · conteos que pidieron los funcionales (mesa 03-nov) -->
        <div class="px-6 py-4 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white border-b border-slate-100">
          <button type="button" (click)="filtro.set('TODAS')" class="text-left p-3 rounded-lg border transition"
                  [ngClass]="filtro() === 'TODAS' ? 'border-[var(--color-brand)] bg-[color-mix(in_srgb,var(--color-brand)_10%,white)]' : 'border-slate-200 hover:bg-slate-50'">
            <p class="text-[10px] uppercase tracking-wide text-slate-500 font-bold">En bandeja</p>
            <p class="text-2xl font-black text-slate-900">{{ bandeja().length }}</p>
          </button>
          <button type="button" (click)="filtro.set('ROJO')" class="text-left p-3 rounded-lg border transition"
                  [ngClass]="filtro() === 'ROJO' ? 'border-rose-400 bg-rose-50' : 'border-slate-200 hover:bg-slate-50'">
            <p class="text-[10px] uppercase tracking-wide text-rose-700 font-bold">Rojo · ≤5 días</p>
            <p class="text-2xl font-black text-rose-700">{{ conteo().rojo }}</p>
          </button>
          <button type="button" (click)="filtro.set('AMARILLO')" class="text-left p-3 rounded-lg border transition"
                  [ngClass]="filtro() === 'AMARILLO' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'">
            <p class="text-[10px] uppercase tracking-wide text-amber-800 font-bold">Amarillo</p>
            <p class="text-2xl font-black text-amber-700">{{ conteo().amarillo }}</p>
          </button>
          <button type="button" (click)="filtro.set('VERDE')" class="text-left p-3 rounded-lg border transition"
                  [ngClass]="filtro() === 'VERDE' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'">
            <p class="text-[10px] uppercase tracking-wide text-emerald-800 font-bold">Verde</p>
            <p class="text-2xl font-black text-emerald-700">{{ conteo().verde }}</p>
          </button>
        </div>
        
        <!-- Lista de Cuentas -->
        <div class="divide-y divide-slate-100">
          <div *ngFor="let cuenta of visibles()" class="p-5 hover:bg-slate-50/80 flex items-center justify-between transition-colors">
            <div class="flex items-start space-x-4">
              <!-- Semáforo visual con pulso en rojo -->
              <span 
                class="w-3.5 h-3.5 rounded-full mt-1.5 flex-shrink-0 shadow-sm"
                [ngClass]="{
                  'bg-rose-500 ring-4 ring-rose-100 animate-pulse': cuenta.colorBadge === 'ROJO',
                  'bg-amber-400 ring-2 ring-amber-100': cuenta.colorBadge === 'AMARILLO',
                  'bg-emerald-500 ring-2 ring-emerald-100': cuenta.colorBadge === 'VERDE'
                }"></span>
              
              <div>
                <div class="flex items-center space-x-2">
                  <p class="text-sm font-bold text-slate-900 font-mono">{{ cuenta.numeroFev || cuenta.nur }}</p>
                  
                  <span *ngIf="cuenta.id" class="bg-slate-900 text-amber-400 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
                    {{ cuenta.id }}
                  </span>

                  <span *ngIf="cuenta.nur" class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-200" [title]="cuenta.nur">
                    NUR {{ cuenta.nur }}
                  </span>
                  
                  <span *ngIf="cuenta.ips" class="text-xs text-[var(--color-brand)] font-medium">
                    · {{ cuenta.ips.razonSocial }}
                  </span>
                </div>

                <p *ngIf="cuenta.paciente" class="text-xs text-slate-600 mt-1">
                  Paciente: <strong class="text-slate-800">{{ cuenta.paciente.nombre }}</strong> ({{ cuenta.paciente.tipoDocumento }} {{ cuenta.paciente.numeroDocumento }})
                </p>

                <div class="flex items-center space-x-3 text-xs text-slate-500 mt-1.5">
                  <span>CUPS: <code class="text-slate-700 font-semibold">{{ cuenta.cups }}</code></span>
                  <span>·</span>
                  <span>Facturado: <strong class="text-slate-900 font-mono">{{ cuenta.valorFacturado | currency:'COP':'symbol':'1.0-0' }}</strong></span>
                  <span>·</span>
                  <span class="font-medium" [ngClass]="{'text-rose-600 font-bold': cuenta.colorBadge === 'ROJO', 'text-amber-700': cuenta.colorBadge === 'AMARILLO', 'text-emerald-600': cuenta.colorBadge === 'VERDE'}">
                    Vence en {{ cuenta.diasVencimiento }} días hábiles
                  </span>
                  <span *ngIf="cuenta.recomendacionIa?.monto && cuenta.recomendacionIa.monto > 0" 
                        class="bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded text-[10px] font-bold font-mono">
                    Glosa Propuesta: {{ cuenta.recomendacionIa.monto | currency:'COP':'symbol':'1.0-0' }}
                  </span>
                </div>
              </div>
            </div>

            <button [routerLink]="['/auditoria', cuenta.nur]" 
                    class="px-4 py-2 text-white rounded-lg font-medium text-xs shadow-sm hover:opacity-90 transition flex items-center space-x-1.5 flex-shrink-0 group"
                    style="background-color: var(--color-brand);">
              <span>Auditar Caso (Split-Screen)</span>
              <span class="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
          
          <!-- Bandeja Vacía / Todos resueltos -->
          <div *ngIf="bandeja().length > 0 && visibles().length === 0" class="p-8 text-center text-slate-500 text-sm">
            No hay casos en este semáforo. Pulse «En bandeja» para ver todos.
          </div>
          <div *ngIf="bandeja().length === 0" class="p-12 text-center text-slate-500 space-y-3">
            <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
            <h3 class="font-bold text-slate-800 text-base">¡Bandeja al día! No hay excepciones pendientes.</h3>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              Todas las cuentas médicas han sido auditadas (ratificadas o sobreescritas con justificación clínica conforme a la Resolución 2284).
            </p>
            <button (click)="service.resetData()" 
                    class="px-4 py-2 text-white rounded-lg text-xs font-semibold shadow transition hover:opacity-90"
                    style="background-color: var(--color-brand);">
              ↺ Reiniciar Demostración (Restablecer 3 Casos)
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class BandejaComponent {
  service = inject(AuditoriaService);
  bandeja = this.service.bandejaOrdenada;
  filtro = signal<'TODAS' | 'ROJO' | 'AMARILLO' | 'VERDE'>('TODAS');

  conteo = computed(() => {
    const list = this.bandeja();
    return {
      rojo: list.filter(c => c.colorBadge === 'ROJO').length,
      amarillo: list.filter(c => c.colorBadge === 'AMARILLO').length,
      verde: list.filter(c => c.colorBadge === 'VERDE').length
    };
  });

  visibles = computed(() => {
    const f = this.filtro();
    const list = this.bandeja();
    return f === 'TODAS' ? list : list.filter(c => c.colorBadge === f);
  });
}
