import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadicacionService, FacturaRadicada } from '../../../services/radicacion/radicacion.service';

@Component({
  selector: 'app-radicaciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-4 min-h-[32rem] items-stretch">
      <aside class="w-56 flex-shrink-0 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
        <div class="px-3 py-2.5 border-b border-slate-200 bg-slate-50">
          <h2 class="text-sm font-bold text-slate-800">Radicaciones</h2>
          <p class="text-[10px] text-slate-500 mt-0.5">Agrupador del día · el NUR va por factura</p>
        </div>
        <ul class="flex-1 overflow-y-auto">
          <li *ngFor="let r of service.radicacionesDelUsuario()">
            <button type="button"
                    (click)="service.seleccionarRadicacion(r.id)"
                    class="w-full text-left px-3 py-2.5 border-b border-slate-100 text-xs font-mono hover:bg-slate-50"
                    [class.font-bold]="service.radicacionSeleccionadaId() === r.id"
                    [class.bg-slate-100]="service.radicacionSeleccionadaId() === r.id"
                    [style.borderLeft]="service.radicacionSeleccionadaId() === r.id ? '4px solid var(--color-brand)' : '4px solid transparent'">
              <span class="block text-slate-900">{{ r.id }}</span>
              <span class="block text-[10px] font-sans font-medium text-slate-500 truncate">{{ r.ips }}</span>
            </button>
          </li>
        </ul>
      </aside>

      <section class="flex-1 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex flex-col min-w-0">
        <ng-container *ngIf="sel() as r; else vacio">
          <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-start gap-3">
            <div>
              <h3 class="text-sm font-bold uppercase tracking-wide text-slate-600">Facturas radicadas y su NUR</h3>
              <p class="text-[11px] text-slate-500 mt-0.5">
                {{ r.ips }} · {{ r.cuentas }} facturas ·
                <span *ngIf="r.estadoPaquete === 'RECHAZO_SIN_NUR'" class="text-rose-700 font-bold">Rechazo sin NUR</span>
                <span *ngIf="r.estadoPaquete === 'RADICADA'">{{ r.valorTotal | currency:'COP':'symbol':'1.0-0' }}</span>
              </p>
            </div>
            <button *ngIf="r.estadoPaquete === 'RADICADA'"
                    (click)="service.descargarNurCsv()"
                    class="text-[11px] font-bold px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50">
              Exportar NUR (CSV)
            </button>
          </div>
          <div class="flex-1 overflow-auto">
            <table class="w-full text-xs">
              <thead class="bg-white text-slate-500 sticky top-0">
                <tr>
                  <th class="text-left px-3 py-2 font-semibold">Factura</th>
                  <th class="text-left px-3 py-2 font-semibold">NUR</th>
                  <th class="text-right px-3 py-2 font-semibold">Valor</th>
                  <th class="text-left px-3 py-2 font-semibold">Huella</th>
                  <th class="text-left px-3 py-2 font-semibold">Trámite</th>
                  <th class="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of r.facturas" class="border-t border-slate-200 bg-white"
                    [class.bg-amber-50]="f.tramite === 'GLOSA_AUTO'"
                    [class.bg-rose-50]="f.tramite === 'RECHAZO_SIN_NUR'">
                  <td class="px-3 py-2 font-mono font-semibold text-slate-900">{{ f.factura }}</td>
                  <td class="px-3 py-2 font-mono font-bold text-slate-800">{{ f.nur || '—' }}</td>
                  <td class="px-3 py-2 text-right font-mono">{{ f.valor | currency:'COP':'symbol':'1.0-0' }}</td>
                  <td class="px-3 py-2 font-mono text-[10px] text-slate-500 truncate max-w-[10rem]">{{ f.hash }}</td>
                  <td class="px-3 py-2 font-bold"
                      [class.text-amber-800]="f.tramite === 'GLOSA_AUTO'"
                      [class.text-rose-800]="f.tramite === 'RECHAZO_SIN_NUR'">
                    {{ service.etiquetaTramite(f.tramite) }}
                  </td>
                  <td class="px-3 py-2 text-right">
                    <button (click)="pdf(f)" class="text-[var(--color-brand)] hover:underline font-bold">PDF</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>
        <ng-template #vacio>
          <div class="p-8 text-center text-sm text-slate-500">No hay radicaciones para este radicador.</div>
        </ng-template>
      </section>
    </div>
  `
})
export class RadicacionesComponent {
  service = inject(RadicacionService);
  sel = this.service.radicacionSeleccionada;

  pdf(f: FacturaRadicada) {
    this.service.descargarCertificadoFactura(f);
  }
}
