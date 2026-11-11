import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface DevolucionNotificadaIps {
  id: string;
  nur: string;
  factura: string;
  eps: string;
  paciente: string;
  valor: number;
  causalDevolucion: string;
  descripcionCausal: string;
  fechaNotificacion: string;
  diasRestantesRespuesta: number; // 5 days max
  estado: 'PENDIENTE_RESPUESTA' | 'ACEPTADA_RE9701' | 'CONTROVERTIDA_RE9601';
  respuestaDetalle?: {
    camino: 'RE9701' | 'RE9601';
    fechaRespuesta: string;
    notaCredito?: string;
    nuevoNur?: string;
    argumentoControversia?: string;
    soporteAdjunto?: string;
  };
}

@Component({
  selector: 'app-devoluciones-ips',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-6 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto h-full space-y-6">
      
      <!-- HEADER CONTEXTO NORMATIVO -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-xl font-bold text-slate-900">Portal IPS: Respuesta a Devoluciones</h1>
              <span class="bg-indigo-900 text-indigo-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-700">
                SCR-15 · FASE T
              </span>
              <span class="bg-emerald-900 text-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-700">
                US-25 · DOS CAMINOS RES. 2284
              </span>
              <span class="bg-amber-900 text-amber-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-700">
                TÉRMINO 5 DÍAS HÁBILES
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Bandeja de expedientes devueltos por la aseguradora. La IPS dispone de 5 días hábiles para responder por dos caminos reglamentarios: <strong>Camino A (RE9701 con Nota Crédito + Nuevo NUR)</strong> o <strong>Camino B (RE9601 Controvertir en el Mismo NUR)</strong>.
            </p>
          </div>

          <div class="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-right">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Término de Respuesta IPS</span>
            <span class="text-xs font-mono font-black text-indigo-700">5 DÍAS HÁBILES PERENTORIOS</span>
          </div>
        </div>

        <!-- CONTADORES -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p class="text-[10px] uppercase font-bold text-amber-800">Pendientes de Respuesta</p>
            <p class="text-2xl font-black text-amber-700">{{ conteos().pendientes }}</p>
            <span class="text-[10px] text-amber-600 font-medium">Reloj de 5 días corriendo</span>
          </div>

          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p class="text-[10px] uppercase font-bold text-emerald-800">Camino A: Aceptadas (RE9701)</p>
            <p class="text-2xl font-black text-emerald-700">{{ conteos().aceptadas }}</p>
            <span class="text-[10px] text-emerald-600 font-medium">Nota Crédito + Nuevo NUR emitido</span>
          </div>

          <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p class="text-[10px] uppercase font-bold text-purple-800">Camino B: Controvertidas (RE9601)</p>
            <p class="text-2xl font-black text-purple-700">{{ conteos().controvertidas }}</p>
            <span class="text-[10px] text-purple-600 font-medium">Mismo NUR · Mesa de Conciliación</span>
          </div>
        </div>
      </div>

      <!-- GRID PRINCIPAL -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- BANDEJA DE DEVOLUCIONES NOTIFICADAS (7 COLUMNAS) -->
        <div class="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div class="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Devoluciones Notificadas por EPS
            </h2>
            <span class="text-xs text-slate-500 font-medium">
              Seleccione para gestionar respuesta
            </span>
          </div>

          <div class="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[580px]">
            <div *ngFor="let dev of devoluciones()"
                 (click)="seleccionarDevolucion(dev)"
                 class="p-4 hover:bg-slate-50 cursor-pointer transition-colors border-l-4"
                 [ngClass]="{
                   'border-l-indigo-600 bg-indigo-50/20': devSeleccionada()?.id === dev.id,
                   'border-l-transparent': devSeleccionada()?.id !== dev.id
                 }">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold text-slate-900">{{ dev.factura }}</span>
                    <span class="text-[11px] font-mono text-slate-500">· {{ dev.nur }}</span>
                  </div>
                  <p class="text-xs font-semibold text-slate-800 mt-1">{{ dev.paciente }}</p>
                  <p class="text-[11px] text-slate-500">{{ dev.eps }}</p>
                  
                  <!-- Causal EPS -->
                  <div class="mt-2 inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[10px]">
                    <span class="font-bold font-mono">{{ dev.causalDevolucion }}</span>
                    <span class="text-slate-600">· {{ dev.descripcionCausal }}</span>
                  </div>
                </div>

                <div class="text-right flex flex-col items-end gap-1">
                  <span class="text-xs font-black text-slate-900">$ {{ dev.valor | number:'1.0-0' }} COP</span>

                  <div *ngIf="dev.estado === 'PENDIENTE_RESPUESTA'" 
                       class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <span>⏱ Restan {{ dev.diasRestantesRespuesta }}d hábiles</span>
                  </div>

                  <div *ngIf="dev.estado === 'ACEPTADA_RE9701'" 
                       class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span>✓ RE9701 · NUEVO NUR</span>
                  </div>

                  <div *ngIf="dev.estado === 'CONTROVERTIDA_RE9601'" 
                       class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                    <span>⚖ RE9601 · MISMO NUR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PANEL DE RESPUESTA EN DOS CAMINOS (5 COLUMNAS) -->
        <div class="lg:col-span-5 flex flex-col gap-4">
          <div *ngIf="devSeleccionada() as dev" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            
            <div class="border-b border-slate-100 pb-3">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expediente Seleccionado</span>
              <div class="flex justify-between items-baseline mt-1">
                <h3 class="text-base font-bold text-slate-900">{{ dev.factura }}</h3>
                <span class="font-mono text-xs text-slate-500">{{ dev.nur }}</span>
              </div>
              <p class="text-xs text-slate-600 mt-1">{{ dev.paciente }} · {{ dev.eps }}</p>
            </div>

            <!-- SI ESTÁ PENDIENTE DE RESPUESTA: SELECTOR DE LOS 2 CAMINOS -->
            <div *ngIf="dev.estado === 'PENDIENTE_RESPUESTA'" class="space-y-4">
              <label class="block text-xs font-bold text-slate-800">
                Seleccione el Camino Reglamentario de Respuesta (Res. 2284):
              </label>

              <!-- SELECTOR BIFURCACIÓN -->
              <div class="grid grid-cols-2 gap-2">
                <button type="button" 
                        (click)="caminoSeleccionado.set('CAMINO_A')"
                        class="p-3 rounded-lg border text-left transition flex flex-col justify-between"
                        [ngClass]="caminoSeleccionado() === 'CAMINO_A' ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:bg-slate-50'">
                  <div>
                    <span class="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">RE9701</span>
                    <h4 class="text-xs font-bold text-slate-900 mt-1.5">Camino A: Aceptar Devolución</h4>
                    <p class="text-[11px] text-slate-600 mt-1 leading-snug">
                      Acepta la causal formulada por la EPS. Requiere adjuntar Nota Crédito y solicita <strong>Nuevo NUR</strong> para la nueva factura corregida.
                    </p>
                  </div>
                  <span class="text-[10px] font-bold text-emerald-700 mt-2">→ Genera Nuevo NUR</span>
                </button>

                <button type="button" 
                        (click)="caminoSeleccionado.set('CAMINO_B')"
                        class="p-3 rounded-lg border text-left transition flex flex-col justify-between"
                        [ngClass]="caminoSeleccionado() === 'CAMINO_B' ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20' : 'border-slate-200 hover:bg-slate-50'">
                  <div>
                    <span class="text-[10px] font-mono font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">RE9601</span>
                    <h4 class="text-xs font-bold text-slate-900 mt-1.5">Camino B: Controvertir</h4>
                    <p class="text-[11px] text-slate-600 mt-1 leading-snug">
                      Rechaza la devolución argumentando validez del expediente dentro del término. Mantiene el <strong>Mismo NUR</strong> original hacia mesa de conciliación.
                    </p>
                  </div>
                  <span class="text-[10px] font-bold text-purple-700 mt-2">→ Conserva Mismo NUR</span>
                </button>
              </div>

              <!-- FORMULARIO CAMINO A (RE9701) -->
              <div *ngIf="caminoSeleccionado() === 'CAMINO_A'" class="space-y-3 p-4 bg-emerald-50/40 border border-emerald-200 rounded-lg">
                <span class="text-xs font-bold text-emerald-900 block">Requisitos Camino A (RE9701):</span>
                
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Número de Nota Crédito DIAN
                  </label>
                  <input type="text" 
                         [(ngModel)]="numeroNotaCredito" 
                         placeholder="Ej: NC-2026-0045"
                         class="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono" />
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Adjuntar Archivo Nota Crédito XML / PDF
                  </label>
                  <div class="border-2 border-dashed border-emerald-300 rounded-lg p-3 text-center bg-white">
                    <span class="text-xs text-emerald-800 font-semibold">NotaCredito_NC45_Firmada.xml (145 KB)</span>
                    <p class="text-[10px] text-slate-400 mt-0.5">Validada contra DIAN con CUDE vigente</p>
                  </div>
                </div>

                <div class="bg-white p-2.5 rounded border border-emerald-200 text-[11px] text-emerald-950">
                  <strong>Efecto en Radicación:</strong> Al radicar la corrección se emitirá un <strong>NUR Nuevo Enlazado</strong> con referencia al expediente original devuelto.
                </div>

                <button type="button" 
                        (click)="despacharRespuestaCaminoA(dev)"
                        class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-sm">
                  Emitir RE9701 y Generar Nuevo NUR
                </button>
              </div>

              <!-- FORMULARIO CAMINO B (RE9601) -->
              <div *ngIf="caminoSeleccionado() === 'CAMINO_B'" class="space-y-3 p-4 bg-purple-50/40 border border-purple-200 rounded-lg">
                <span class="text-xs font-bold text-purple-900 block">Requisitos Camino B (RE9601):</span>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Sustento Técnico-Jurídico de la Controversia
                  </label>
                  <textarea [(ngModel)]="argumentoControversia" 
                            rows="3" 
                            placeholder="Exponga las razones técnicas y normativas por las cuales el expediente no incurre en la causal formulada por la EPS..."
                            class="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"></textarea>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">
                    Soporte Probatorio Adjunto (PDF hasta 50MB)
                  </label>
                  <div class="border-2 border-dashed border-purple-300 rounded-lg p-3 text-center bg-white">
                    <span class="text-xs text-purple-800 font-semibold">Evidencia_Contingencia_SoporteRadicado.pdf (2.1 MB)</span>
                    <p class="text-[10px] text-slate-400 mt-0.5">Certificado de radicación en término previo</p>
                  </div>
                </div>

                <div class="bg-white p-2.5 rounded border border-purple-200 text-[11px] text-purple-950">
                  <strong>Efecto en Radicación:</strong> El expediente conserva el <strong>Mismo NUR original</strong> y pasa a la mesa de conciliación y auditoría médica de la aseguradora.
                </div>

                <button type="button" 
                        (click)="despacharRespuestaCaminoB(dev)"
                        class="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition shadow-sm">
                  Emitir RE9601 en Mismo NUR
                </button>
              </div>

            </div>

            <!-- CASO YA RESPONDIDO: DETALLE CAMINO A -->
            <div *ngIf="dev.estado === 'ACEPTADA_RE9701'" class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
              <div class="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <span>✓</span>
                <span>Devolución Aceptada mediante RE9701</span>
              </div>
              <p class="text-xs text-emerald-950">
                Se aceptó la causal de devolución aplicando la Nota Crédito <strong>{{ dev.respuestaDetalle?.notaCredito }}</strong>.
              </p>
              <div class="bg-white p-3 rounded border border-emerald-200 space-y-1">
                <span class="text-[10px] uppercase font-bold text-slate-400">Nuevo Radicado de Re-Radicación:</span>
                <p class="text-sm font-mono font-black text-emerald-700">{{ dev.respuestaDetalle?.nuevoNur }}</p>
                <p class="text-[10px] text-slate-500">Expediente enlazado al NUR original {{ dev.nur }}</p>
              </div>
            </div>

            <!-- CASO YA RESPONDIDO: DETALLE CAMINO B -->
            <div *ngIf="dev.estado === 'CONTROVERTIDA_RE9601'" class="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
              <div class="flex items-center gap-2 text-purple-900 font-bold text-xs">
                <span>⚖</span>
                <span>Controversia RE9601 Emitida en Término</span>
              </div>
              <p class="text-xs text-purple-950">
                La IPS controvirtió formalmente la devolución dentro de los 5 días hábiles reglamentarios.
              </p>
              <div class="bg-white p-3 rounded border border-purple-200 space-y-1 text-xs">
                <p><strong>NUR Activo:</strong> <span class="font-mono font-bold">{{ dev.nur }}</span> (Mismo NUR)</p>
                <p><strong>Argumento:</strong> "{{ dev.respuestaDetalle?.argumentoControversia }}"</p>
                <p><strong>Soporte:</strong> {{ dev.respuestaDetalle?.soporteAdjunto }}</p>
              </div>
            </div>

          </div>

          <div *ngIf="!devSeleccionada()" class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
            <p class="text-xs font-semibold">Seleccione una devolución del panel izquierdo</p>
            <p class="text-[11px] text-slate-400 mt-0.5">Podrá elegir entre Camino A (RE9701) o Camino B (RE9601)</p>
          </div>
        </div>

      </div>

    </div>
  `
})
export class DevolucionesComponent {
  caminoSeleccionado = signal<'CAMINO_A' | 'CAMINO_B'>('CAMINO_A');
  numeroNotaCredito = 'NC-2026-8812';
  argumentoControversia = 'Se controvierte la causal DE1601 demostrando que en la fecha de atención el paciente figuraba activo en el régimen contributivo según copia física del carné y certificación BDUA.';

  devoluciones = signal<DevolucionNotificadaIps[]>([
    {
      id: 'DEV-IPS-01',
      nur: 'NUR-2026-8849203',
      factura: 'FEV-11029',
      eps: 'EPS Sanitas S.A.S.',
      paciente: 'Beatriz Eugenia Valenzuela (CC 43.567.890)',
      valor: 410000,
      causalDevolucion: 'DE1601',
      descripcionCausal: 'Usuario corresponde a otro responsable del pago',
      fechaNotificacion: '10-nov-2026',
      diasRestantesRespuesta: 4,
      estado: 'PENDIENTE_RESPUESTA'
    },
    {
      id: 'DEV-IPS-02',
      nur: 'NUR-2026-8849198',
      factura: 'FEV-77402',
      eps: 'Nueva EPS S.A.',
      paciente: 'Andrés Camilo Henao (CC 98.765.432)',
      valor: 1850000,
      causalDevolucion: 'DE5601',
      descripcionCausal: 'Radicación extemporánea de soportes',
      fechaNotificacion: '08-nov-2026',
      diasRestantesRespuesta: 2,
      estado: 'CONTROVERTIDA_RE9601',
      respuestaDetalle: {
        camino: 'RE9601',
        fechaRespuesta: '10-nov-2026',
        argumentoControversia: 'Radicación previa en contingencia dentro de los 22 días hábiles según radicado anexo #CONT-8812.',
        soporteAdjunto: 'ActaContingencia_FirmaSello.pdf'
      }
    },
    {
      id: 'DEV-IPS-03',
      nur: 'NUR-2026-8849150',
      factura: 'FEV-66104',
      eps: 'Salud Total EPS',
      paciente: 'Mauricio Restrepo (CC 70.123.456)',
      valor: 890000,
      causalDevolucion: 'DE5001',
      descripcionCausal: 'Factura no cumple requisitos legales',
      fechaNotificacion: '05-nov-2026',
      diasRestantesRespuesta: 0,
      estado: 'ACEPTADA_RE9701',
      respuestaDetalle: {
        camino: 'RE9701',
        fechaRespuesta: '07-nov-2026',
        notaCredito: 'NC-2026-5501',
        nuevoNur: 'NUR-2026-9920150'
      }
    }
  ]);

  devSeleccionada = signal<DevolucionNotificadaIps | null>(null);

  conteos = computed(() => {
    const list = this.devoluciones();
    return {
      pendientes: list.filter(d => d.estado === 'PENDIENTE_RESPUESTA').length,
      aceptadas: list.filter(d => d.estado === 'ACEPTADA_RE9701').length,
      controvertidas: list.filter(d => d.estado === 'CONTROVERTIDA_RE9601').length
    };
  });

  constructor() {
    const primeraPendiente = this.devoluciones().find(d => d.estado === 'PENDIENTE_RESPUESTA');
    if (primeraPendiente) {
      this.devSeleccionada.set(primeraPendiente);
    }
  }

  seleccionarDevolucion(dev: DevolucionNotificadaIps) {
    this.devSeleccionada.set(dev);
  }

  despacharRespuestaCaminoA(dev: DevolucionNotificadaIps) {
    const nuevoNurGenerado = 'NUR-2026-' + Math.floor(1000000 + Math.random() * 9000000);
    const respuestaDetalle = {
      camino: 'RE9701' as const,
      fechaRespuesta: '10-nov-2026',
      notaCredito: this.numeroNotaCredito,
      nuevoNur: nuevoNurGenerado
    };

    this.devoluciones.update(list => 
      list.map(d => d.id === dev.id ? { ...d, estado: 'ACEPTADA_RE9701', respuestaDetalle } : d)
    );
    this.devSeleccionada.set({ ...dev, estado: 'ACEPTADA_RE9701', respuestaDetalle });
  }

  despacharRespuestaCaminoB(dev: DevolucionNotificadaIps) {
    const respuestaDetalle = {
      camino: 'RE9601' as const,
      fechaRespuesta: '10-nov-2026',
      argumentoControversia: this.argumentoControversia,
      soporteAdjunto: 'Evidencia_Contingencia_SoporteRadicado.pdf'
    };

    this.devoluciones.update(list => 
      list.map(d => d.id === dev.id ? { ...d, estado: 'CONTROVERTIDA_RE9601', respuestaDetalle } : d)
    );
    this.devSeleccionada.set({ ...dev, estado: 'CONTROVERTIDA_RE9601', respuestaDetalle });
  }
}

