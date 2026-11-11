import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface ExpedienteDevolucion {
  id: string;
  nur: string;
  factura: string;
  paciente: string;
  documento: string;
  ips: string;
  servicio: string;
  esUrgencia: boolean;
  valor: number;
  diasHabilesRadicado: number; // 1 to 5 within term, > 5 precluido
  estado: 'HABIL' | 'PRECLUIDO' | 'FORMULADA' | 'CONTROVERSIA_IPS' | 'CONCILIACION' | 'ORDINARIA';
  causalSugerida?: string;
  respuestaIps?: {
    tipo: 'RE9601'; // Controversia
    fecha: string;
    sustento: string;
    radicacionContingenciaSoporte: string;
  };
}

export interface CausalInfo {
  codigo2284: string;
  codigo3047: string;
  titulo: string;
  descripcion: string;
  aplicaUrgencias: boolean;
}

const CAUSALES_CATALOGO: CausalInfo[] = [
  {
    codigo2284: 'DE1601',
    codigo3047: '101',
    titulo: 'Usuario corresponde a otro responsable del pago',
    descripcion: 'El usuario no figura afiliado en BDUA a la EPS o pertenece a otro pagador según la base de datos oficial entregada a la IPS.',
    aplicaUrgencias: true
  },
  {
    codigo2284: 'DE4401',
    codigo3047: '201',
    titulo: 'Servicios prestados sin autorización previa requerida',
    descripcion: 'El servicio electivo o ambulatorio carece de autorización médica expedida por el pagador antes de la prestación.',
    aplicaUrgencias: false // Bloqueado por Ley Estatutaria 1751/2015 en urgencias
  },
  {
    codigo2284: 'DE4402',
    codigo3047: '203',
    titulo: 'Servicios no incluidos en el acuerdo de voluntades',
    descripcion: 'Procedimientos o medicamentos no pactados contractualmente en el portafolio contratado con la IPS.',
    aplicaUrgencias: true
  },
  {
    codigo2284: 'DE5001',
    codigo3047: '301',
    titulo: 'Factura no cumple requisitos legales o tributarios',
    descripcion: 'Inconsistencias en formato XML DIAN, firma digital de factura o ausencia de campos mínimos de salud.',
    aplicaUrgencias: true
  },
  {
    codigo2284: 'DE5601',
    codigo3047: '401',
    titulo: 'Radicación extemporánea de soportes (> 22 días hábiles)',
    descripcion: 'Presentación de la cuenta médica y sus soportes clínicos fuera del término legal establecido en la Resolución 2284 de 2023.',
    aplicaUrgencias: true
  }
];

@Component({
  selector: 'app-devoluciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-6 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto h-full space-y-6">
      
      <!-- ENCABEZADO Y CONTEXTO NORMATIVO -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-xl font-bold text-slate-900">Módulo EPS: Formulación de Devoluciones</h1>
              <span class="bg-emerald-900 text-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-700">
                SCR-14 · FASE T
              </span>
              <span class="bg-indigo-900 text-indigo-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-700">
                US-24 · CAUSALES TAXATIVAS
              </span>
              <span class="bg-rose-900 text-rose-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-rose-700">
                RELOJ 5 DÍAS HÁBILES
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Evaluación determinista de causales taxativas de devolución (Res. 2284/2023). Al transcurrir el 5° día hábil opera la <strong>preclusión estricta</strong> y la cuenta se tramita obligatoriamente por auditoría médica ordinaria.
            </p>
          </div>

          <!-- Selector de Modo Normativo -->
          <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            <span class="text-[11px] font-semibold text-slate-600 pl-2">Manual:</span>
            <button type="button" 
                    (click)="modoNormativa.set('RES_2284')"
                    class="px-2.5 py-1 text-xs rounded-md font-bold transition shadow-xs"
                    [ngClass]="modoNormativa() === 'RES_2284' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'">
              Res. 2284 / 2023 (Vigente DE)
            </button>
            <button type="button" 
                    (click)="modoNormativa.set('RES_3047')"
                    class="px-2.5 py-1 text-xs rounded-md font-bold transition shadow-xs"
                    [ngClass]="modoNormativa() === 'RES_3047' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'">
              Res. 3047 / 2008 (Histórico 3 dígitos)
            </button>
          </div>
        </div>

        <!-- KPI RESUMEN DE LA BANDEJA -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p class="text-[10px] uppercase font-bold text-slate-500">Hábiles p/ Devolución</p>
            <p class="text-2xl font-black text-emerald-700">{{ conteos().habiles }}</p>
            <span class="text-[10px] text-emerald-600 font-medium">≤ 5 días desde radicación</span>
          </div>

          <div class="bg-rose-50 border border-rose-200 rounded-lg p-3">
            <p class="text-[10px] uppercase font-bold text-rose-700">Preclusión Estricta</p>
            <p class="text-2xl font-black text-rose-700">{{ conteos().precluidos }}</p>
            <span class="text-[10px] text-rose-600 font-medium">&gt; 5 días · Devolución bloqueada</span>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-[10px] uppercase font-bold text-blue-700">Devoluciones Notificadas</p>
            <p class="text-2xl font-black text-blue-700">{{ conteos().formuladas }}</p>
            <span class="text-[10px] text-blue-600 font-medium">3 Vías: Web + Email + SIIFA</span>
          </div>

          <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p class="text-[10px] uppercase font-bold text-amber-800">Controversias IPS (RE9601)</p>
            <p class="text-2xl font-black text-amber-700">{{ conteos().controversias }}</p>
            <span class="text-[10px] text-amber-700 font-medium">Mismo NUR · Pendiente EPS</span>
          </div>
        </div>
      </div>

      <!-- BANDEJA PRINCIPAL DE EXPEDIENTES -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- LISTA DE CUENTAS (7 COLUMNAS) -->
        <div class="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div class="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Expedientes Radicados en Ventanilla
            </h2>
            <span class="text-xs text-slate-500 font-medium">
              Seleccione un caso para formular devolución o revisar controversia
            </span>
          </div>

          <div class="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[580px]">
            <div *ngFor="let exp of expedientes()" 
                 (click)="seleccionarExpediente(exp)"
                 class="p-4 hover:bg-slate-50 cursor-pointer transition-colors border-l-4"
                 [ngClass]="{
                   'border-l-emerald-500 bg-emerald-50/30': expSeleccionado()?.id === exp.id,
                   'border-l-transparent': expSeleccionado()?.id !== exp.id,
                   'opacity-75': exp.estado === 'PRECLUIDO'
                 }">
              
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold text-slate-900">{{ exp.factura }}</span>
                    <span class="text-[11px] font-mono text-slate-500">· {{ exp.nur }}</span>
                    <span *ngIf="exp.esUrgencia" class="bg-red-100 text-red-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-red-300">
                      URGENCIA
                    </span>
                  </div>
                  <p class="text-xs font-semibold text-slate-800 mt-1">{{ exp.paciente }} <span class="text-slate-400 font-normal">({{ exp.documento }})</span></p>
                  <p class="text-[11px] text-slate-500">{{ exp.ips }}</p>
                  <p class="text-[11px] text-slate-600 mt-0.5"><strong class="text-slate-700">Servicio:</strong> {{ exp.servicio }}</p>
                </div>

                <!-- Reloj / Estado -->
                <div class="text-right flex flex-col items-end gap-1">
                  <span class="text-xs font-black text-slate-900">$ {{ exp.valor | number:'1.0-0' }} COP</span>

                  <!-- Badge de Reloj -->
                  <div *ngIf="exp.estado === 'HABIL'" 
                       class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold"
                       [ngClass]="exp.diasHabilesRadicado <= 3 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'">
                    <span>⏱ Día {{ exp.diasHabilesRadicado }} / 5</span>
                    <span>· Restan {{ 5 - exp.diasHabilesRadicado }}d hábiles</span>
                  </div>

                  <div *ngIf="exp.estado === 'PRECLUIDO'" 
                       class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    <span>⛔ PRECLUIDO (Día {{ exp.diasHabilesRadicado }})</span>
                  </div>

                  <div *ngIf="exp.estado === 'FORMULADA'" 
                       class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                    <span>✓ DEVOLUCIÓN NOTIFICADA</span>
                  </div>

                  <div *ngIf="exp.estado === 'CONTROVERSIA_IPS'" 
                       class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <span>⚖ CONTROVERSIA RE9601</span>
                  </div>

                  <div *ngIf="exp.estado === 'CONCILIACION'" 
                       class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                    <span>MESA DE CONCILIACIÓN</span>
                  </div>

                  <div *ngIf="exp.estado === 'ORDINARIA'" 
                       class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    <span>AUDITORÍA ORDINARIA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PANEL DE ACCIÓN Y FORMULACIÓN (5 COLUMNAS) -->
        <div class="lg:col-span-5 flex flex-col gap-4">
          
          <!-- TARJETA DEL CASO SELECCIONADO -->
          <div *ngIf="expSeleccionado() as exp" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div class="border-b border-slate-100 pb-3">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detalle del Caso Seleccionado</span>
              <div class="flex justify-between items-baseline mt-1">
                <h3 class="text-base font-bold text-slate-900">{{ exp.factura }}</h3>
                <span class="font-mono text-xs text-slate-500">{{ exp.nur }}</span>
              </div>
              <p class="text-xs text-slate-600 mt-1">{{ exp.paciente }} · {{ exp.ips }}</p>
            </div>

            <!-- SITUACIÓN 1: PRECLUSIÓN ESTRICTA (BLOQUEO) -->
            <div *ngIf="exp.estado === 'PRECLUIDO'" 
                 class="bg-rose-50 border border-rose-300 rounded-lg p-4 space-y-2">
              <div class="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wide">
                <svg class="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                Preclusión del Término Legal (Art. 12 Res. 2284 / T-24)
              </div>
              <p class="text-xs text-rose-900 leading-relaxed">
                Este expediente fue radicado hace <strong>{{ exp.diasHabilesRadicado }} días hábiles</strong>. El plazo máximo perentorio para formular devoluciones es de 5 días hábiles siguientes a la radicación.
              </p>
              <div class="bg-white/80 p-2.5 rounded border border-rose-200 text-[11px] text-rose-950">
                <strong>Efecto Jurídico:</strong> Precluyó el derecho de devolución. La cuenta no puede ser devuelta y debe continuar obligatoriamente el flujo de auditoría médica ordinaria y formulación de glosas.
              </div>
              <button type="button" 
                      disabled
                      class="w-full mt-2 py-2 px-3 bg-slate-200 text-slate-400 rounded-lg font-bold text-xs cursor-not-allowed">
                Devolución Bloqueada por Preclusión
              </button>
            </div>

            <!-- SITUACIÓN 2: HÁBIL PARA FORMULAR DEVOLUCIÓN -->
            <div *ngIf="exp.estado === 'HABIL'" class="space-y-4">
              <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-950 flex items-center justify-between">
                <div>
                  <span class="font-bold text-emerald-800">Término Legal Vigente:</span>
                  <p class="text-[11px] text-emerald-700">Día hábil {{ exp.diasHabilesRadicado }} de 5 (Restan {{ 5 - exp.diasHabilesRadicado }} días hábiles para preclusión).</p>
                </div>
                <span class="text-xs font-mono font-bold text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-300">
                  DÍA {{ exp.diasHabilesRadicado }}/5
                </span>
              </div>

              <!-- Selector de Causal Taxativa -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Causal Taxativa de Devolución
                  <span class="text-emerald-700 font-mono text-[11px]">
                    ({{ modoNormativa() === 'RES_2284' ? 'Manual Único Res. 2284' : 'Equivalente Res. 3047' }})
                  </span>
                </label>
                <select [(ngModel)]="causalSeleccionada" 
                        class="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option *ngFor="let c of catalogoCausales()" [value]="c.codigo2284">
                    [{{ modoNormativa() === 'RES_2284' ? c.codigo2284 : 'Causal ' + c.codigo3047 }}] {{ c.titulo }}
                  </option>
                </select>
                <p class="text-[11px] text-slate-500 mt-1 italic">
                  {{ causalActual()?.descripcion }}
                </p>
              </div>

              <!-- ALERTA NORMATIVA DE URGENCIAS PARA DE44 -->
              <div *ngIf="exp.esUrgencia && causalSeleccionada === 'DE4401'" 
                   class="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs text-amber-950 space-y-1">
                <span class="font-bold text-amber-900">⚠️ Excepción de Urgencias (Ley 1751/2015, Art. 14):</span>
                <p class="text-[11px] text-amber-800">
                  La atención inicial de urgencias no requiere autorización previa de la EPS. La causal <strong>DE4401</strong> no es jurídicamente aplicable a este servicio.
                </p>
              </div>

              <!-- JUSTIFICACIÓN Y OBSERVACIONES -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Sustento y Justificación del Auditor EPS
                </label>
                <textarea [(ngModel)]="justificacionTexto" 
                          rows="3" 
                          placeholder="Indique los hallazgos técnicos que sustentan la causal de devolución taxativa..."
                          class="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
              </div>

              <!-- BOTÓN DE FORMULAR DEVOLUCIÓN EN 3 VÍAS -->
              <button type="button" 
                      (click)="formularDevolucionTresVias(exp)"
                      [disabled]="exp.esUrgencia && causalSeleccionada === 'DE4401'"
                      class="w-full py-2.5 px-4 rounded-lg font-bold text-xs text-white shadow-sm transition flex items-center justify-center gap-2"
                      [ngClass]="(exp.esUrgencia && causalSeleccionada === 'DE4401') ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Formular Devolución y Despachar en 3 Vías</span>
              </button>
            </div>

            <!-- SITUACIÓN 3: YA NOTIFICADA EN 3 VÍAS -->
            <div *ngIf="exp.estado === 'FORMULADA'" class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div class="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <span>✓</span>
                <span>Devolución Formulada y Notificada a la IPS</span>
              </div>
              <p class="text-xs text-blue-800">
                La IPS fue notificada el <strong>10-nov-2026</strong>. Dispone de <strong>5 días hábiles</strong> para pronunciarse a través de uno de los 2 caminos reglamentarios:
              </p>
              <ul class="text-[11px] text-blue-950 space-y-1 list-disc list-inside">
                <li><strong>Camino A (RE9701):</strong> Aceptar devolución, emitir Nota Crédito y re-radicar con Nuevo NUR.</li>
                <li><strong>Camino B (RE9601):</strong> Controvertir con argumentos en el Mismo NUR original.</li>
              </ul>
              <div class="bg-white p-2.5 rounded border border-blue-200 text-[10px] text-slate-600 font-mono">
                Notificación 3 Vías: Portal Web IPS (OK) · Canal Email (OK) · Radicado SIIFA #DEV-2026-99214 (&lt;48h)
              </div>
            </div>

            <!-- SITUACIÓN 4: CONTROVERSIA RECIBIDA DE LA IPS (RE9601) -->
            <div *ngIf="exp.estado === 'CONTROVERSIA_IPS'" class="space-y-4">
              <div class="bg-amber-50 border border-amber-300 rounded-lg p-3.5 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    ⚖ Respuesta IPS: Controversia RE9601
                  </span>
                  <span class="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    MISMO NUR
                  </span>
                </div>
                <p class="text-xs text-amber-950 leading-relaxed">
                  <strong>Argumento IPS:</strong> "{{ exp.respuestaIps?.sustento }}"
                </p>
                <div class="bg-white/80 p-2 rounded text-[11px] text-slate-600 border border-amber-200">
                  <strong>Soporte Adjunto:</strong> {{ exp.respuestaIps?.radicacionContingenciaSoporte }}
                </div>
              </div>

              <!-- Pronunciamiento EPS sobre la controversia -->
              <div class="space-y-2">
                <span class="text-xs font-bold text-slate-700">Pronunciamiento EPS sobre Controversia:</span>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" 
                          (click)="pronunciarseSobreControversia(exp, 'CONCILIACION')"
                          class="p-2.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition flex flex-col items-center text-center">
                    <span>Ratificar Devolución</span>
                    <span class="text-[9px] font-normal text-purple-700 mt-0.5">Remitir a Mesa de Conciliación</span>
                  </button>

                  <button type="button" 
                          (click)="pronunciarseSobreControversia(exp, 'ORDINARIA')"
                          class="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition flex flex-col items-center text-center">
                    <span>Aceptar Explicación IPS</span>
                    <span class="text-[9px] font-normal text-emerald-700 mt-0.5">Reanudar Auditoría Ordinaria</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          <!-- ESTADO VACÍO -->
          <div *ngIf="!expSeleccionado()" class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
            <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="text-xs font-semibold">Seleccione un expediente del panel izquierdo</p>
            <p class="text-[11px] text-slate-400 mt-0.5">Podrá evaluar el término de 5 días hábiles, preclusión o controversia</p>
          </div>
        </div>

      </div>

      <!-- MODAL CONFIRMACIÓN DESPACHO 3 VÍAS -->
      <div *ngIf="modalTresVias()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
          <div class="flex items-center gap-3 text-emerald-700 border-b border-slate-100 pb-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">Devolución Formulada con Éxito</h3>
              <p class="text-xs text-slate-500">Expediente {{ expedienteFormulado()?.factura }} · {{ expedienteFormulado()?.nur }}</p>
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-xs text-slate-700">
              Se ha completado el protocolo de notificación en tres vías bajo la Resolución 2284 de 2023:
            </p>

            <div class="space-y-2 text-xs">
              <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <span class="text-emerald-600 font-bold">1.</span>
                <div>
                  <strong>Portal Web IPS:</strong> Se publicó en el buzón transaccional de la IPS. Corre reloj de 5 días hábiles para respuesta (RE9701 vs RE9601).
                </div>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <span class="text-emerald-600 font-bold">2.</span>
                <div>
                  <strong>Canal Electrónico:</strong> Envío de paquete formal XML/PDF con acuse criptográfico a <span class="font-mono text-[11px] text-indigo-700">facturacion&#64;poblado-ips.com</span>.
                </div>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <span class="text-emerald-600 font-bold">3.</span>
                <div>
                  <strong>Interoperabilidad SIIFA:</strong> Radicado MinSalud transmitido con éxito (&lt; 48 horas reglamentarias).
                </div>
              </div>
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <button type="button" 
                    (click)="cerrarModal()" 
                    class="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition shadow-sm">
              Entendido y Cerrar
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class DevolucionesComponent {
  modoNormativa = signal<'RES_2284' | 'RES_3047'>('RES_2284');
  causalSeleccionada = 'DE1601';
  justificacionTexto = 'Usuario no registra afiliación activa en BDUA con la EPS en la fecha de prestación.';
  modalTresVias = signal<boolean>(false);
  expedienteFormulado = signal<ExpedienteDevolucion | null>(null);

  // Expedientes de prueba representativos
  expedientes = signal<ExpedienteDevolucion[]>([
    {
      id: 'CASO-DEV-01',
      nur: 'NUR-2026-8849203',
      factura: 'FEV-11029',
      paciente: 'Beatriz Eugenia Valenzuela',
      documento: 'CC 43.567.890',
      ips: 'Centro Médico El Poblado IPS',
      servicio: 'Consulta Especialista + Hemograma IV',
      esUrgencia: false,
      valor: 410000,
      diasHabilesRadicado: 2, // Hábil (2/5)
      estado: 'HABIL',
      causalSugerida: 'DE1601'
    },
    {
      id: 'CASO-DEV-02',
      nur: 'NUR-2026-8849201',
      factura: 'FEV-99823',
      paciente: 'Carmen Elisa Ramírez Gómez',
      documento: 'CC 1.037.654.321',
      ips: 'Clínica Las Américas S.A.',
      servicio: 'Apicectomía con obturación retrógrada',
      esUrgencia: false,
      valor: 2450000,
      diasHabilesRadicado: 7, // Precluido (> 5)
      estado: 'PRECLUIDO'
    },
    {
      id: 'CASO-DEV-03',
      nur: 'NUR-2026-8849202',
      factura: 'FEV-A118492568',
      paciente: 'Jorge Iván Mejía Zuluaga',
      documento: 'CC 71.982.341',
      ips: 'Hospital Universitario San Vicente Fundación',
      servicio: 'Atención Inicial de Urgencias (CUPS 890201)',
      esUrgencia: true, // Excepción urgencias DE4401
      valor: 235000,
      diasHabilesRadicado: 3,
      estado: 'HABIL',
      causalSugerida: 'DE4401'
    },
    {
      id: 'CASO-DEV-04',
      nur: 'NUR-2026-8849198',
      factura: 'FEV-77402',
      paciente: 'Andrés Camilo Henao',
      documento: 'CC 98.765.432',
      ips: 'E.S.E. Hospital San Rafael',
      servicio: 'Hospitalización y Procedimientos Quirúrgicos',
      esUrgencia: false,
      valor: 1850000,
      diasHabilesRadicado: 5,
      estado: 'CONTROVERSIA_IPS',
      respuestaIps: {
        tipo: 'RE9601',
        fecha: '10-nov-2026',
        sustento: 'Se controvierte causal DE5601 demostrando radicación previa en contingencia dentro de los 22 días hábiles según radicado anexo #CONT-8812.',
        radicacionContingenciaSoporte: 'ActaContingencia_FirmaSello.pdf (1.4 MB)'
      }
    }
  ]);

  expSeleccionado = signal<ExpedienteDevolucion | null>(null);

  catalogoCausales = computed(() => CAUSALES_CATALOGO);

  causalActual = computed(() => {
    return CAUSALES_CATALOGO.find(c => c.codigo2284 === this.causalSeleccionada);
  });

  conteos = computed(() => {
    const list = this.expedientes();
    return {
      habiles: list.filter(e => e.estado === 'HABIL').length,
      precluidos: list.filter(e => e.estado === 'PRECLUIDO').length,
      formuladas: list.filter(e => e.estado === 'FORMULADA').length,
      controversias: list.filter(e => e.estado === 'CONTROVERSIA_IPS').length
    };
  });

  constructor() {
    // Seleccionar por defecto el primer caso hábil
    const primerHabil = this.expedientes().find(e => e.estado === 'HABIL');
    if (primerHabil) {
      this.expSeleccionado.set(primerHabil);
    }
  }

  seleccionarExpediente(exp: ExpedienteDevolucion) {
    this.expSeleccionado.set(exp);
    if (exp.causalSugerida) {
      this.causalSeleccionada = exp.causalSugerida;
    }
  }

  formularDevolucionTresVias(exp: ExpedienteDevolucion) {
    if (exp.esUrgencia && this.causalSeleccionada === 'DE4401') {
      return;
    }

    this.expedientes.update(list => 
      list.map(item => item.id === exp.id ? { ...item, estado: 'FORMULADA' } : item)
    );
    this.expSeleccionado.set({ ...exp, estado: 'FORMULADA' });
    this.expedienteFormulado.set(exp);
    this.modalTresVias.set(true);
  }

  pronunciarseSobreControversia(exp: ExpedienteDevolucion, decision: 'CONCILIACION' | 'ORDINARIA') {
    this.expedientes.update(list => 
      list.map(item => item.id === exp.id ? { ...item, estado: decision } : item)
    );
    this.expSeleccionado.set({ ...exp, estado: decision });
  }

  cerrarModal() {
    this.modalTresVias.set(false);
  }
}

