import { Component, OnInit, Signal, signal, computed, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuditoriaService } from '../../../services/auditoria/auditoria.service';

// ==============================================================================
// MODELOS E INTERFACES DE DOMINIO - FASE T (EXTENSIÓN NORMATIVA RES. 0948 & 2284)
// ==============================================================================

export interface Auditor {
  id: string;
  nombre: string;
  rol: string;
  registroMedico: string;
  especialidad: string;
  email: string;
}

export interface Prestador {
  nit: string;
  nombre: string;
  codigoHabilitation: string;
  sede: string;
}

export interface Paciente {
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  edad: number;
  sexo: string;
  planAfiliacion: string;
}

export interface Diagnostico {
  codigoCie10: string;
  descripcion: string;
}

export interface SemaforoInfo {
  diasHabilesRestantes: number;
  nivelRiesgo: 'VERDE' | 'AMARILLO' | 'ROJO';
  colorHex: string;
  mensajeNormativo: string;
}

export interface ResumenFinanciero {
  valorFacturadoCop: number;
  valorTarifaPactadaCop: number;
  valorGlosaSugeridaCop: number;
  valorAprobadoSugeridoCop: number;
}

export interface CausalGlosa {
  codigoManualUnico: string;
  codigoRes3047: string;
  familia: 'CL' | 'TA' | 'FA' | 'SO' | 'AU' | 'CO' | 'DE' | 'AC' | 'RECHAZO_RADICACION' | 'DEVOLUCIONES' | 'ACEPTACION_TACITA';
  descripcion: string;
}

export interface ItemFacturado {
  linea: number;
  codigoCups: string;
  descripcionCups: string;
  cantidad: number;
  valorFacturadoCop: number;
  valorTarifaPactadaCop: number;
  valorGlosaSugeridaCop: number;
  estadoItem: 'CONFORME' | 'GLOSADO_SUGERIDO' | 'GLOSADO_AJUSTADO';
  observacionIa: string;
}

export interface SoporteDocumental {
  id: string;
  tipoDocumento: 'FEV_XML' | 'EPICRISIS_PDF' | 'HOJA_QUIRURGICA_PDF' | 'CONTRATO_PDF' | 'CERTIFICADO_TITULO_VALOR' | 'OTRO_PDF';
  nombreArchivo: string;
  urlMock: string;
  totalPaginas: number;
}

export interface CoordenadasBB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoundingBox {
  id: string;
  documentoId: string;
  pagina: number;
  coordenadas: CoordenadasBB;
  textoExtraidoOcr: string;
  etiquetaCampo: string;
  colorBorde: string;
  mensajeHallazgo: string;
}

export interface ExplicacionIaRag {
  resumenEjecutivo: string;
  sustentoNormativo: string;
  fuentesCite: string[];
}

export interface MotivoRechazoSinNur {
  causal: string;
  norma: string;
  detalle: string;
  constanciaPdfMock: string;
  fechaRechazo: string;
}

export interface Devolucion5Dias {
  causalDe: string;
  fechaLimiteDevolucion: string;
  diasHabilesRestantesDevolucion: number;
  precluida: boolean;
  causalDescripcion: string;
  respuestaIps?: {
    codigoRespuesta: 'RE9701' | 'RE9601' | 'RE2202';
    detalle: string;
    fechaRespuesta: string;
  };
}

export interface AceptacionTacitaLey1438 {
  fechaRadicacion: string;
  diasHabilesTranscurridos: number;
  fechaPerencion20Dias: string;
  tituloValorNumero: string;
  estadoDespachoPago: 'LISTO_PARA_PAGO' | 'DESPACHADO_A_CORE_EPS';
}

export interface CitaSoporteGlosa {
  etiqueta: string;
  documentoId: string;
  pagina: number;
  boundingBoxId?: string;
  extractoCita: string;
}

export interface DecisionGlosa {
  tipo: 'ACEPTADA_IA' | 'AJUSTADA_AUDITOR' | 'MANTENIDA_TOTAL' | 'ESCALADA_ESPECIALISTA';
  etiqueta: string;
  valorFinalGlosaCop: number;
  argumentoFinal: string;
  auditor: string;
  timestamp: string;
}

export interface GlosaFactura {
  id: string;
  lineaItem: number;
  codigoCups: string;
  descripcionItem: string;
  tituloCorto: string;
  causal: CausalGlosa;
  valorFacturadoItemCop: number;
  valorTarifaPactadaItemCop: number;
  valorGlosaInicialCop: number;
  valorGlosaSugeridaIaCop: number;
  valorGlosaDefinitivaCop: number;
  veredictoIa: 'LEVANTAR_PARCIAL' | 'RATIFICAR_TOTAL' | 'LEVANTAR_TOTAL' | 'APROBAR_ITEM';
  confianzaIaPorcentaje: number;
  causaDetalle: string;
  solucionSugeridaIa: string;
  sustentoNormativo: string;
  fuentesCite: string[];
  borradorRespuestaIa: string;
  citasSoporte: CitaSoporteGlosa[];
  documentosRelacionadosIds: string[];
  estadoGlosa: 'PENDIENTE' | 'RESUELTA' | 'ESCALADA';
  decisionAplicada?: DecisionGlosa;
}

export interface CasoAuditoria {
  id: string;
  nur: string | null;
  loteId: string;
  fevNumero: string;
  cuv: string | null;
  cufe: string;
  prestador: Prestador;
  paciente: Paciente;
  diagnosticoPrincipal: Diagnostico;
  fechas: {
    fechaIngreso: string;
    fechaEgreso: string;
    fechaRadicacion: string;
    fechaVencimientoLegal: string | null;
  };
  semaforo: SemaforoInfo;
  resumenFinanciero: ResumenFinanciero;
  estadoAuditoria:
    | 'PENDIENTE'
    | 'GLOSADA_NOTIFICADA'
    | 'APROBADA_NOTIFICADA'
    | 'SOBREESCRITO_FORENSE'
    | 'RECHAZO_SIN_NUR'
    | 'DEVOLUCION_FORMULADA'
    | 'DEVOLUCION_CONTROVERTIDA'
    | 'DEVOLUCION_PRECLUIDA'
    | 'FACTURA_ACEPTADA_TACITA';
  tipoResultadoPredictivo: 'APROBADO_DIRECTO' | 'GLOSA_PARCIAL' | 'RECHAZO_NORMATIVO';
  confianzaIaPorcentaje: number;
  causalGlosa: CausalGlosa | null;
  itemsFacturados: ItemFacturado[];
  glosasFactura: GlosaFactura[];
  soportesDocumentales: SoporteDocumental[];
  boundingBoxes: BoundingBox[];
  explicacionIaRag: ExplicacionIaRag;
  registroDecisionHitL?: {
    auditor: string;
    registroMedico: string;
    timestamp: string;
    tipoAccion: 'RATIFICACION_1CLIC' | 'SOBREESCRITURA_FORENSE' | 'DEVOLUCION_5_DIAS' | 'EXPEDICION_TITULO_VALOR';
    glosaFinalCop: number;
    justificacionMedica?: string;
  };
  motivoRechazoSinNur?: MotivoRechazoSinNur;
  devolucion5Dias?: Devolucion5Dias;
  aceptacionTacitaLey1438?: AceptacionTacitaLey1438;
}

// ==============================================================================
// COMPONENTE ANGULAR 19+ STANDALONE: WORKBENCH TRI-PANE SPLIT-VIEW AUDIT-AI
// ==============================================================================

@Component({
  selector: 'app-split-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  host: { class: 'block h-full min-h-0 flex-1 overflow-hidden' },
  template: `
    <!-- CONTENEDOR PRINCIPAL WORKBENCH TRI-PANE (100VH SIN SCROLL GLOBAL) -->
    <div class="h-full min-h-0 w-full flex flex-col bg-slate-100 text-slate-800 font-sans overflow-hidden select-none relative">

      <!-- =================================================================== -->
      <!-- BARRA SUPERIOR STICKY: CONTEXTO FACTURA, PROGRESO Y CONTROLES (64PX) -->
      <!-- =================================================================== -->
      <header class="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20 shadow-sm">
        
        <!-- Izquierda: Volver a Bandeja + Metadatos de la Factura -->
        <div class="flex items-center space-x-3">
          <a routerLink="/bandeja" class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition" title="Volver a la bandeja de excepciones (HITL)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span class="hidden sm:inline">Bandeja</span>
          </a>

          <div class="h-6 w-px bg-slate-200"></div>

          <div>
            <div class="flex items-center space-x-2">
              <span class="font-mono font-bold text-sm text-[var(--color-brand)]">{{ casoActivo().fevNumero }}</span>
              <span *ngIf="casoActivo().nur" class="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">{{ casoActivo().nur }}</span>
              <span *ngIf="!casoActivo().nur" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 font-bold">SIN NUR</span>
              <span class="text-xs font-bold text-slate-900 truncate max-w-[200px] xl:max-w-[260px]" [title]="casoActivo().prestador.nombre">{{ casoActivo().prestador.nombre }}</span>
              <span class="text-[10px] text-slate-400 font-mono hidden md:inline">NIT: {{ casoActivo().prestador.nit }}</span>
            </div>
            <div class="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
              <span>Total: <strong class="text-slate-800">\${{ casoActivo().resumenFinanciero.valorFacturadoCop | number:'1.0-0' }}</strong></span>
              <span>•</span>
              <span>Glosado Ini: <strong class="text-red-600">\${{ conciliacionFactura().glosaInicialTotal | number:'1.0-0' }}</strong></span>
              <span>•</span>
              <span class="hidden lg:inline">Rad: {{ casoActivo().fechas.fechaRadicacion | date:'dd/MM/yyyy' }}</span>
              <span>•</span>
              <span [class]="casoActivo().semaforo.nivelRiesgo === 'ROJO' ? 'text-red-600 font-bold' : casoActivo().semaforo.nivelRiesgo === 'AMARILLO' ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'">
                {{ casoActivo().semaforo.diasHabilesRestantes }} d. hábiles
              </span>
            </div>
          </div>
        </div>

        <!-- Centro: Medidor de Progreso de Auditoría de Glosas -->
        <div class="hidden md:flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <div class="text-right">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Progreso Auditoría</p>
            <p class="text-xs font-bold text-slate-800 font-mono">
              {{ progresoGlosas().resueltas }}/{{ progresoGlosas().total }} Glosas ({{ progresoGlosas().porcentaje }}%)
            </p>
          </div>
          <!-- Barra de progreso -->
          <div class="w-28 xl:w-36 h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300" [style.width.%]="progresoGlosas().porcentaje"></div>
          </div>
          <!-- CTA de Finalización -->
          <button 
            (click)="finalizarAuditoriaFactura()"
            [disabled]="!progresoGlosas().completado"
            [class]="progresoGlosas().completado
              ? 'px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95'
              : 'px-3 py-1.5 rounded-lg bg-slate-200 text-slate-400 font-semibold text-xs cursor-not-allowed flex items-center gap-1.5'"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span>{{ progresoGlosas().completado ? 'Finalizar Factura' : (progresoGlosas().pendientes + ' pend.') }}</span>
          </button>
        </div>

        <!-- Derecha: Selector de Casos Demo + Toggle Auto-Avance -->
        <div class="flex items-center space-x-2">
          <!-- Toggle Auto-Avance -->
          <button 
            (click)="toggleAutoAvance()"
            [class]="autoAvance()
              ? 'px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold flex items-center gap-1 transition'
              : 'px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-medium flex items-center gap-1 transition'"
            title="Avanzar automáticamente a la siguiente glosa pendiente tras resolver una (250ms)"
          >
            <span class="w-2 h-2 rounded-full" [class]="autoAvance() ? 'bg-indigo-600 animate-pulse' : 'bg-slate-400'"></span>
            <span class="hidden sm:inline">Auto-avanzar</span>
            <span class="font-mono text-[10px]">{{ autoAvance() ? 'ON' : 'OFF' }}</span>
          </button>

          <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <!-- Selector de Escenario Demo -->
          <div class="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-mono">
            <button 
              *ngFor="let esc of ['ESC-01', 'ESC-02', 'ESC-03', 'ESC-04', 'ESC-05', 'ESC-06']"
              (click)="seleccionarCaso(esc)"
              [class]="casoActivoId() === esc
                ? 'px-2 py-1 rounded font-bold bg-white text-[var(--color-brand)] shadow-sm'
                : 'px-2 py-1 text-slate-500 hover:text-slate-800'"
              [title]="'Cargar caso ' + esc"
            >
              {{ esc }}
            </button>
          </div>
        </div>
      </header>

      <!-- =================================================================== -->
      <!-- CUERPO PRINCIPAL DEL WORKBENCH: TRI-PANE SPLIT-VIEW -->
      <!-- =================================================================== -->
      <main class="flex-1 min-h-0 flex overflow-hidden relative">

        <!-- =================================================================== -->
        <!-- PANEL 1: MASTER RAIL (COLA DE NAVEGACIÓN DE GLOSAS - 24% ANCHO) -->
        <!-- =================================================================== -->
        <aside class="w-[24%] min-w-[270px] max-w-[330px] bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden min-h-0 shrink-0">
          
          <!-- Encabezado del Master Rail y Filtro de Segmento -->
          <div class="p-3 bg-white border-b border-slate-200 space-y-2 shrink-0">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                <span>Glosas de la Factura</span>
              </h2>
              <span class="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                {{ glosasDeFactura().length }}
              </span>
            </div>

            <!-- Segmented Control de Filtro -->
            <div class="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold text-center">
              <button 
                (click)="filtroEstadoGlosa.set('TODAS')" 
                [class]="filtroEstadoGlosa() === 'TODAS' ? 'bg-white text-slate-900 shadow-sm rounded py-1 font-bold' : 'text-slate-500 hover:text-slate-900 py-1'"
              >
                Todas ({{ progresoGlosas().total }})
              </button>
              <button 
                (click)="filtroEstadoGlosa.set('PENDIENTES')" 
                [class]="filtroEstadoGlosa() === 'PENDIENTES' ? 'bg-white text-amber-900 shadow-sm rounded py-1 font-bold' : 'text-slate-500 hover:text-slate-900 py-1'"
              >
                Pend ({{ progresoGlosas().pendientes }})
              </button>
              <button 
                (click)="filtroEstadoGlosa.set('RESUELTAS')" 
                [class]="filtroEstadoGlosa() === 'RESUELTAS' ? 'bg-white text-emerald-900 shadow-sm rounded py-1 font-bold' : 'text-slate-500 hover:text-slate-900 py-1'"
              >
                Res ({{ progresoGlosas().resueltas }})
              </button>
            </div>
          </div>

          <!-- Lista Scrollable de Tarjetas de Glosa -->
          <div class="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2">
            
            <div 
              *ngFor="let glosa of glosasFiltradas()"
              (click)="seleccionarGlosa(glosa.id)"
              [class]="glosa.id === glosaActivaId()
                ? 'p-3 rounded-xl border-2 border-indigo-600 bg-indigo-50/70 shadow-sm cursor-pointer transition-all'
                : 'p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 cursor-pointer transition-all'"
            >
              <!-- Fila Superior: Código, Ítem y Estado -->
              <div class="flex items-center justify-between text-[11px] mb-1">
                <div class="flex items-center space-x-1.5">
                  <span class="font-mono font-bold text-xs" [class]="glosa.id === glosaActivaId() ? 'text-indigo-900' : 'text-slate-800'">
                    #{{ glosa.id }}
                  </span>
                  
                  <!-- Badge de Estado -->
                  <span *ngIf="glosa.estadoGlosa === 'PENDIENTE'" class="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Pendiente</span>
                  </span>
                  <span *ngIf="glosa.estadoGlosa === 'RESUELTA'" class="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>✓ Resuelta</span>
                  </span>
                  <span *ngIf="glosa.estadoGlosa === 'ESCALADA'" class="inline-flex items-center gap-1 text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    <span>⚑ Escalada</span>
                  </span>
                </div>

                <span class="font-mono text-[10px] text-slate-500">Ít. {{ glosa.lineaItem }} · {{ glosa.codigoCups }}</span>
              </div>

              <!-- Título de la Causa -->
              <h3 class="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
                {{ glosa.tituloCorto }}
              </h3>

              <!-- Fila Inferior: Montos y Confianza IA -->
              <div class="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                <div>
                  <span class="text-[9px] text-slate-400 uppercase font-sans font-semibold block">Glosado</span>
                  <span class="font-mono font-bold text-red-600">\${{ glosa.valorGlosaInicialCop | number:'1.0-0' }}</span>
                </div>
                <div class="text-right">
                  <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono"
                        [ngClass]="glosa.veredictoIa === 'RATIFICAR_TOTAL' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
                    IA: {{ glosa.confianzaIaPorcentaje }}%
                  </span>
                </div>
              </div>

              <!-- Traza de Decisión si ya fue resuelta -->
              <div *ngIf="glosa.decisionAplicada" class="mt-2 pt-1 border-t border-dashed border-emerald-200 text-[10px] text-emerald-800 font-mono flex justify-between items-center bg-emerald-50/80 -mx-1 px-1.5 py-0.5 rounded">
                <span class="truncate max-w-[130px]">{{ glosa.decisionAplicada.etiqueta }}</span>
                <span class="font-bold">\${{ glosa.decisionAplicada.valorFinalGlosaCop | number:'1.0-0' }}</span>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="glosasFiltradas().length === 0" class="p-8 text-center text-slate-400 text-xs space-y-1">
              <p class="font-semibold">Sin glosas en este filtro</p>
              <p class="text-[11px]">Seleccione "Todas" para ver la lista completa.</p>
            </div>
          </div>
        </aside>

        <!-- =================================================================== -->
        <!-- PANEL 2: RESOLUTION CANVAS (MESA DE RESOLUCIÓN - 40% ANCHO) -->
        <!-- =================================================================== -->
        <section 
          class="bg-white border-r border-slate-200 flex flex-col overflow-hidden min-h-0 transition-all duration-200"
          [style.width.%]="anchoPanelResolucion()"
        >
          
          <!-- BANNER REGULATORIO ESPECIAL (ESC-04, ESC-05, ESC-06) -->
          <div *ngIf="casoActivo().estadoAuditoria === 'RECHAZO_SIN_NUR' || casoActivo().estadoAuditoria === 'DEVOLUCION_FORMULADA' || casoActivo().estadoAuditoria === 'FACTURA_ACEPTADA_TACITA'" class="p-3 bg-amber-50/80 border-b border-amber-200 text-xs">
            
            <!-- CASO 1: RECHAZO SIN NUR (ESC-04 / RES. 0948 ART 3.1) -->
            <div *ngIf="casoActivo().estadoAuditoria === 'RECHAZO_SIN_NUR'" class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-red-800 flex items-center gap-1.5">
                  ⛔ Rechazo Inmediato en Ventanilla (Res. 0948 de 2026 Art. 3.1)
                </span>
                <span class="px-2 py-0.5 rounded bg-red-100 text-red-900 font-mono text-[10px] font-bold">Sin Términos Legales</span>
              </div>
              <p class="text-[11px] text-red-900 leading-relaxed">
                Resolución 0948 de 2026: Prohibición expresa de radicar paquetes sin CUV previo y validado ante el Mecanismo Único de MinSalud.
              </p>
              <button (click)="descargarConstanciaRechazo()" class="py-1.5 px-3 rounded bg-red-700 hover:bg-red-600 text-white text-xs font-bold shadow flex items-center gap-1.5">
                <span>📄 Descargar Constancia de Rechazo Inmediato (PDF)</span>
              </button>
            </div>

            <!-- CASO 2: CICLO DEVOLUCIÓN 5-5-5 (ESC-05 / RES. 2284 ART 6) -->
            <div *ngIf="casoActivo().estadoAuditoria === 'DEVOLUCION_FORMULADA'" class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-orange-800 flex items-center gap-1.5">
                  ⏱ Ciclo de Devolución 5-5-5 en Curso (Res. 2284 Art. 6)
                </span>
                <span class="px-2 py-0.5 rounded bg-orange-100 text-orange-900 font-mono text-[10px] font-bold">2 Días Restantes</span>
              </div>
              <p class="text-[11px] text-orange-950 leading-relaxed">
                Resolución 2284 de 2023: Ciclo taxativo de devoluciones 5-5-5 y preclusión formal de términos al día 6 hábil.
              </p>
              <div class="flex flex-wrap gap-1.5">
                <button (click)="simularRespuestaIps('RE9701')" class="py-1 px-2.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold">IPS RE9701 (Aceptar)</button>
                <button (click)="simularRespuestaIps('RE9601')" class="py-1 px-2.5 rounded bg-indigo-700 hover:bg-indigo-600 text-white text-[11px] font-bold">IPS RE9601 (Controvertir)</button>
                <button (click)="simularPreclusionDevolucion()" class="py-1 px-2.5 rounded bg-red-800 hover:bg-red-700 text-white text-[11px] font-bold">Simular Día 6 (Precluir)</button>
              </div>
            </div>

            <!-- CASO 3: ACEPTACIÓN TÁCITA LEY 1438 (ESC-06) -->
            <div *ngIf="casoActivo().estadoAuditoria === 'FACTURA_ACEPTADA_TACITA'" class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-amber-900 flex items-center gap-1.5">
                  ★ Título Valor por Aceptación Tácita (20 Días Perimidos)
                </span>
                <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">22 Días Radicada</span>
              </div>
              <p class="text-[11px] text-amber-950 leading-relaxed">
                Ley 1438 de 2011 Art. 57 y Decreto 441 de 2022 Art. 2.5.3.4.4.4: Título Valor por Aceptación Tácita tras 20 días hábiles sin formulación de glosa.
              </p>
              <button (click)="despacharPagoAceptacionTacita()" class="py-1.5 px-3 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow">
                Despachar a Pago Core EPS
              </button>
            </div>
          </div>

          <!-- CUERPO SCROLLABLE DEL PANEL CENTRAL -->
          <div class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">

            <!-- SI TODAS LAS GLOSAS ESTÁN RESUELTAS: TARJETA DE RESUMEN Y CONCILIACIÓN FINAL -->
            <div *ngIf="progresoGlosas().completado" class="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500/70 rounded-2xl p-5 space-y-4 shadow-sm animate-fade-in">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">✓</div>
                  <div>
                    <h3 class="text-sm font-bold text-emerald-950">Conciliación Final de la Factura Completa</h3>
                    <p class="text-[11px] text-emerald-800">100% de las glosas auditadas conforme a la Resolución 2284 de 2023.</p>
                  </div>
                </div>
                <span class="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-200 text-emerald-900">AUDITADA</span>
              </div>

              <!-- Grilla de 4 KPIs de Conciliación -->
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-1 font-mono text-center">
                <div class="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                  <span class="text-[10px] text-slate-400 uppercase font-sans font-semibold block">Facturado</span>
                  <span class="text-xs font-bold text-slate-800">\${{ conciliacionFactura().facturadoTotal | number:'1.0-0' }}</span>
                </div>
                <div class="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                  <span class="text-[10px] text-slate-400 uppercase font-sans font-semibold block">Glosa Inicial</span>
                  <span class="text-xs font-bold text-red-600">\${{ conciliacionFactura().glosaInicialTotal | number:'1.0-0' }}</span>
                </div>
                <div class="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                  <span class="text-[10px] text-slate-400 uppercase font-sans font-semibold block">Glosa Definitiva</span>
                  <span class="text-xs font-bold text-amber-700">\${{ conciliacionFactura().glosaDefinitivaTotal | number:'1.0-0' }}</span>
                </div>
                <div class="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                  <span class="text-[10px] text-slate-400 uppercase font-sans font-semibold block">Neto a Pagar</span>
                  <span class="text-xs font-bold text-emerald-700">\${{ conciliacionFactura().aprobadoFinalTotal | number:'1.0-0' }}</span>
                </div>
              </div>

              <!-- Botón Primario de Cierre de Factura -->
              <button 
                (click)="finalizarAuditoriaFactura()"
                class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                <span>Confirmar Auditoría y Pasar a Siguiente Factura (⏎)</span>
              </button>
            </div>

            <!-- GLOSA ACTIVA EN RESOLUCIÓN -->
            <ng-container *ngIf="glosaActiva() as glosa">
              
              <!-- Cabecera de la Glosa Activa -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                      #{{ glosa.id }}
                    </span>
                    <h2 class="text-sm font-bold text-slate-900">
                      Ítem {{ glosa.lineaItem }}: {{ glosa.descripcionItem }}
                    </h2>
                  </div>
                  <p class="text-[11px] text-slate-500 font-mono mt-0.5">
                    CUPS: <strong>{{ glosa.codigoCups }}</strong> · Valor Cobrado: \${{ glosa.valorFacturadoItemCop | number:'1.0-0' }}
                  </p>
                </div>

                <div class="text-right">
                  <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Glosa Inicial</span>
                  <span class="text-sm font-bold font-mono text-red-600">\${{ glosa.valorGlosaInicialCop | number:'1.0-0' }}</span>
                </div>
              </div>

              <!-- BLOQUE 1: CAUSA DE LA GLOSA (DIAGNÓSTICO) -->
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>1. Causa de la Glosa</span>
                  </span>
                  <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    Causal: <strong class="text-red-700">{{ glosa.causal.codigoManualUnico }}</strong> (Res. 3047: {{ glosa.causal.codigoRes3047 }})
                  </span>
                </div>

                <p class="text-xs text-slate-800 leading-relaxed font-medium">
                  {{ glosa.causaDetalle }}
                </p>

                <!-- Grilla Comparativa de Valores de la Glosa -->
                <div class="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                  <div class="bg-white p-2 rounded-lg border border-slate-200 text-center">
                    <span class="text-[9px] text-slate-400 block font-sans font-semibold uppercase">Facturado</span>
                    <span class="font-bold text-slate-800">\${{ glosa.valorFacturadoItemCop | number:'1.0-0' }}</span>
                  </div>
                  <div class="bg-white p-2 rounded-lg border border-slate-200 text-center">
                    <span class="text-[9px] text-slate-400 block font-sans font-semibold uppercase">Tarifa Pactada</span>
                    <span class="font-bold text-[var(--color-brand)]">\${{ glosa.valorTarifaPactadaItemCop | number:'1.0-0' }}</span>
                  </div>
                  <div class="bg-white p-2 rounded-lg border border-slate-200 text-center">
                    <span class="text-[9px] text-slate-400 block font-sans font-semibold uppercase">Glosa Sugerida IA</span>
                    <span class="font-bold text-red-600">\${{ glosa.valorGlosaSugeridaIaCop | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>

              <!-- BLOQUE 2: SOLUCIÓN SUGERIDA POR IA (COPILOT CARD) -->
              <div class="bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border border-indigo-200 rounded-xl p-3.5 space-y-3 shadow-sm">
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1.5"
                          [ngClass]="glosa.veredictoIa === 'RATIFICAR_TOTAL' ? 'bg-red-600' : 'bg-emerald-600'">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      <span>{{ glosa.veredictoIa === 'RATIFICAR_TOTAL' ? 'Ratificar Glosa Total' : glosa.veredictoIa === 'LEVANTAR_PARCIAL' ? 'Levantar Glosa Parcialmente' : 'Levantar Glosa Total' }}</span>
                    </span>

                    <span class="text-xs font-mono font-semibold text-indigo-700 bg-white/80 px-2 py-0.5 rounded border border-indigo-200">
                      {{ glosa.confianzaIaPorcentaje }}% confianza RAG
                    </span>
                  </div>
                </div>

                <!-- Explicación de la IA -->
                <p class="text-xs text-slate-800 leading-relaxed">
                  {{ glosa.solucionSugeridaIa }}
                </p>

                <!-- CITAS CLICABLES A LOS SOPORTES DOCUMENTALES (DEEP-LINK A PÁGINA) -->
                <div *ngIf="glosa.citasSoporte.length > 0" class="pt-2 border-t border-indigo-100/80">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-900 block mb-1.5 flex items-center gap-1">
                    <svg class="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                    <span>Evidencia Extraída de Soportes (Clic para saltar a pág.):</span>
                  </span>
                  <div class="flex flex-wrap gap-1.5">
                    <button 
                      *ngFor="let cita of glosa.citasSoporte"
                      (click)="enfocarCita(cita)"
                      class="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-600 hover:text-white border border-indigo-300 text-indigo-800 text-xs font-medium flex items-center gap-1.5 shadow-sm transition active:scale-95 group"
                      title="Saltar inmediatamente al documento y resaltar el extracto probatorio"
                    >
                      <span>📄 {{ cita.etiqueta }}</span>
                      <span class="text-[10px] opacity-75 group-hover:text-white font-mono">→</span>
                    </button>
                  </div>
                </div>

                <!-- Sustento Legal y Fuentes -->
                <div class="pt-2 border-t border-indigo-100/80 text-[11px] text-slate-600">
                  <span class="font-bold text-slate-800">Sustento Normativo:</span>
                  <p class="mt-0.5 text-slate-700 font-mono">{{ glosa.sustentoNormativo }}</p>
                  <div class="flex flex-wrap gap-1 mt-1.5">
                    <span *ngFor="let f of glosa.fuentesCite" class="px-2 py-0.5 rounded bg-white text-indigo-900 text-[10px] font-mono border border-indigo-200">
                      📜 {{ f }}
                    </span>
                  </div>
                </div>

                <!-- Borrador Oficial para Notificación -->
                <div class="pt-2 border-t border-indigo-100/80">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Borrador Oficial para Notificación IPS:</span>
                  <div class="bg-white p-2.5 rounded-lg border border-indigo-200 text-xs text-slate-700 font-mono leading-relaxed">
                    "{{ glosa.borradorRespuestaIa }}"
                  </div>
                </div>
              </div>

              <!-- TRAZA DE DECISIÓN REGISTRADA (SI YA SE AUDITÓ) -->
              <div *ngIf="glosa.decisionAplicada" class="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-emerald-800 flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>Decisión Registrada: {{ glosa.decisionAplicada.etiqueta }}</span>
                  </span>
                  <span class="font-mono text-[10px] text-slate-500">{{ glosa.decisionAplicada.timestamp | date:'HH:mm:ss' }}</span>
                </div>
                <div class="text-[11px] text-emerald-950 font-mono">
                  <span>Glosa Definitiva: <strong>\${{ glosa.decisionAplicada.valorFinalGlosaCop | number:'1.0-0' }} COP</strong> · Auditor: {{ glosa.decisionAplicada.auditor }}</span>
                  <p class="text-slate-600 font-sans mt-1 italic">"{{ glosa.decisionAplicada.argumentoFinal }}"</p>
                </div>
              </div>

            </ng-container>
          </div>

          <!-- =================================================================== -->
          <!-- BLOQUE 3: ACCIONES EJECUTABLES (STICKY ACTION DOCK INFERIOR) -->
          <!-- =================================================================== -->
          <div class="p-4 bg-white border-t border-slate-200 shrink-0 sticky bottom-0 z-10 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
            <ng-container *ngIf="glosaActiva() as glosa">
              
              <!-- MODO ACCIONES RÁPIDAS (1 CLIC / AJUSTAR / MANTENER / ESCALAR) -->
              <div *ngIf="!modoEdicionInline()" class="space-y-2">
                <!-- Botón Primario: Aplicar Sugerencia IA -->
                <button 
                  (click)="aplicarSugerenciaIa(glosa)"
                  class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-98"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  <span>✓ Aplicar Sugerencia IA y Siguiente (⏎)</span>
                </button>

                <!-- Acciones Secundarias en Grid -->
                <div class="grid grid-cols-3 gap-2">
                  <button 
                    (click)="activarEdicionInline(glosa)"
                    class="py-2 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition"
                    title="Ajustar monto o texto de justificación clínica (E)"
                  >
                    <span>✎ Ajustar (E)</span>
                  </button>

                  <button 
                    (click)="mantenerGlosaTotal(glosa)"
                    class="py-2 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center justify-center gap-1 transition"
                    title="Mantener y ratificar glosa al 100% sin levantar"
                  >
                    <span>✕ Mantener 100%</span>
                  </button>

                  <button 
                    (click)="escalarGlosa(glosa)"
                    class="py-2 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center justify-center gap-1 transition"
                    title="Escalar a médico especialista auditor"
                  >
                    <span>⚑ Escalar</span>
                  </button>
                </div>
              </div>

              <!-- MODO EDICIÓN INLINE CON BLINDAJE FORENSE ≥ 50 CARACTERES -->
              <div *ngIf="modoEdicionInline()" class="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-300 animate-slide-up">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-800 uppercase tracking-wide">Ajuste Manual Forense de Glosa</span>
                  <button (click)="cancelarEdicionInline()" class="text-slate-500 hover:text-slate-800 text-xs font-semibold">✕ Cancelar</button>
                </div>

                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">Monto Definitivo de Glosa (COP):</label>
                  <input 
                    type="number" 
                    [(ngModel)]="montoAjustadoInput" 
                    class="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div class="flex justify-between items-center mb-1">
                    <label class="block text-[11px] font-semibold text-slate-600">Motivación Clínica Obligatoria:</label>
                    <span class="text-[10px] font-mono font-bold" [class]="justificacionAjusteInput().length >= 50 ? 'text-emerald-600' : 'text-amber-600 animate-pulse'">
                      {{ justificacionAjusteInput().length }}/50 car. mín.
                    </span>
                  </div>
                  <textarea 
                    [(ngModel)]="justificacionAjusteInput" 
                    rows="3" 
                    placeholder="Explique el fundamento médico o contractual para apartarse de la recomendación de la IA (mínimo 50 caracteres)..."
                    class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                  ></textarea>
                </div>

                <button 
                  (click)="guardarEdicionInline(glosa)"
                  [disabled]="justificacionAjusteInput().length < 50"
                  [class]="justificacionAjusteInput().length >= 50
                    ? 'w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition'
                    : 'w-full py-2.5 rounded-lg bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed'"
                >
                  Confirmar Decisión Ajustada
                </button>
              </div>

            </ng-container>
          </div>
        </section>

        <!-- =================================================================== -->
        <!-- PANEL 3: EVIDENCE DOCK (VISOR DE ARCHIVOS Y EVIDENCIA OCR - 36%) -->
        <!-- =================================================================== -->
        <section 
          class="bg-slate-100 flex flex-col overflow-hidden min-h-0 transition-all duration-200"
          [style.width.%]="anchoPanelEvidencia()"
        >
          <!-- Barra de Pestañas y Controles del Visor -->
          <div class="h-11 bg-white border-b border-slate-200 px-3 flex items-center justify-between shrink-0">
            
            <!-- Pestañas de Documentos Agrupadas -->
            <div class="flex items-center space-x-1 overflow-x-auto min-w-0 max-w-[min(100%,36rem)] pr-2">
              <span class="text-[10px] font-bold uppercase text-slate-400 mr-1 hidden xl:inline">Soportes:</span>
              
              <button 
                *ngFor="let doc of casoActivo().soportesDocumentales"
                (click)="seleccionarDocumento(doc.id)"
                [class]="doc.id === documentoActivoId()
                  ? 'px-2.5 py-1.5 rounded-t-lg bg-slate-100 text-[var(--color-brand)] border-t-2 border-[var(--color-brand)] text-xs font-bold flex items-center gap-1.5 shrink-0'
                  : 'px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium flex items-center gap-1.5 shrink-0'"
                [title]="doc.nombreArchivo"
              >
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V7.5L14.5 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                <span class="truncate max-w-[90px]">{{ doc.nombreArchivo }}</span>
                <span *ngIf="esSoporteRelevante(doc.id)" class="w-1.5 h-1.5 rounded-full bg-indigo-600" title="Relevante para glosa activa"></span>
              </button>
            </div>

            <!-- Controles: Paginador + Toggle OCR + Zoom + Expandir -->
            <div class="flex items-center space-x-1.5 shrink-0">
              
              <!-- Paginador Documental -->
              <div class="flex items-center bg-slate-100 rounded px-1.5 py-0.5 text-xs text-slate-700 font-mono border border-slate-200">
                <button (click)="cambiarPagina(-1)" [disabled]="paginaActivaVisor() <= 1" class="px-1 disabled:opacity-30 hover:text-indigo-600 font-bold">‹</button>
                <span class="px-1 text-[11px]">{{ paginaActivaVisor() }}/{{ documentoActivo()?.totalPaginas || 1 }}</span>
                <button (click)="cambiarPagina(1)" [disabled]="paginaActivaVisor() >= (documentoActivo()?.totalPaginas || 1)" class="px-1 disabled:opacity-30 hover:text-indigo-600 font-bold">›</button>
              </div>

              <!-- Toggle Bounding Box OCR -->
              <button 
                (click)="toggleBoundingBoxes()"
                [class]="mostrarBoundingBoxes() 
                  ? 'px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 border border-red-800 font-semibold flex items-center gap-1'
                  : 'px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-300'"
                title="Mostrar/ocultar cajas delimitadoras de OCR"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-red-500" *ngIf="mostrarBoundingBoxes()"></span>
                <span>OCR</span>
              </button>

              <!-- Zoom -->
              <div class="flex items-center bg-slate-100 rounded px-1 py-0.5 text-xs text-slate-700 font-mono border border-slate-200">
                <button (click)="cambiarZoom(-10)" class="px-1 hover:text-[var(--color-brand)] font-bold">-</button>
                <span class="px-1 text-[10px] text-[var(--color-brand)]">{{ zoomNivel() }}%</span>
                <button (click)="cambiarZoom(10)" class="px-1 hover:text-[var(--color-brand)] font-bold">+</button>
              </div>

              <!-- Botón Expandir / Colapsar Visor -->
              <button 
                (click)="toggleExpandirVisor()"
                class="p-1 rounded bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs"
                [title]="visorExpandido() ? 'Restaurar ancho normal (])' : 'Expandir visor documental ([)'"
              >
                <svg *ngIf="!visorExpandido()" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                <svg *ngIf="visorExpandido()" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <!-- ÁREA DE RENDERIZADO DEL SOPORTE DIGITAL CON ZOOM Y BOUNDING BOXES -->
          <div class="flex-1 bg-slate-200 overflow-auto p-4 flex justify-center relative select-text" id="viewer-container">
            
            <div 
              class="bg-white text-slate-900 rounded-lg shadow-2xl relative transition-transform origin-top duration-150 border border-slate-300"
              [style.width.px]="600"
              [style.minHeight.px]="800"
              [style.transform]="'scale(' + (zoomNivel() / 100) + ')'"
            >
              <!-- Membrete Oficial del Prestador -->
              <div class="p-5 border-b border-slate-200 bg-slate-50/80 flex justify-between items-start">
                <div>
                  <h3 class="font-bold text-slate-900 text-xs uppercase tracking-wide">{{ casoActivo().prestador.nombre }}</h3>
                  <p class="text-[10px] text-slate-600 font-mono">NIT: {{ casoActivo().prestador.nit }} · Cód. Habilitación: {{ casoActivo().prestador.codigoHabilitation }}</p>
                  <p class="text-[10px] text-slate-600 font-mono">{{ casoActivo().prestador.sede }}</p>
                </div>
                <div class="text-right">
                  <span class="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[9px] font-mono font-bold uppercase">{{ documentoActivo()?.tipoDocumento }}</span>
                  <p class="text-[10px] text-slate-500 mt-1 font-mono">Página {{ paginaActivaVisor() }} de {{ documentoActivo()?.totalPaginas || 1 }}</p>
                </div>
              </div>

              <!-- Datos de Identificación del Paciente -->
              <div class="px-5 py-2.5 bg-slate-100/60 border-b border-slate-200 flex justify-between text-[11px] font-mono">
                <div><strong>Paciente:</strong> {{ casoActivo().paciente.nombreCompleto }}</div>
                <div><strong>Doc:</strong> {{ casoActivo().paciente.tipoDocumento }} {{ casoActivo().paciente.numeroDocumento }}</div>
                <div><strong>Edad:</strong> {{ casoActivo().paciente.edad }} años</div>
              </div>

              <!-- BANNER DE CITA RESALTADA ACTIVA (SALTO DESDE IA) -->
              <div *ngIf="citaResaltadaTexto()" class="m-4 p-2.5 rounded-lg bg-amber-100/90 border border-amber-300 text-amber-950 text-xs font-sans shadow-sm flex items-start justify-between gap-2">
                <div>
                  <span class="font-bold text-[10px] uppercase text-amber-800 flex items-center gap-1">
                    <span>🎯</span>
                    <span>Evidencia Citada por la IA:</span>
                  </span>
                  <p class="font-mono text-[11px] mt-0.5 font-semibold">"{{ citaResaltadaTexto() }}"</p>
                </div>
                <button (click)="citaResaltadaTexto.set('')" class="text-amber-700 hover:text-amber-900 text-xs font-bold">✕</button>
              </div>

              <!-- Contenido Clínico Digitalizado (Simulación según página y documento) -->
              <div class="p-6 space-y-4 text-xs font-serif leading-relaxed text-slate-800">
                
                <div class="bg-amber-50/50 p-2.5 rounded border border-amber-200 text-[11px] font-sans">
                  <span class="font-bold text-amber-900">Diagnóstico Principal:</span>
                  <span class="font-mono font-bold text-amber-900 ml-1">[{{ casoActivo().diagnosticoPrincipal.codigoCie10 }}]</span>
                  <span class="text-amber-800 ml-1">{{ casoActivo().diagnosticoPrincipal.descripcion }}</span>
                </div>

                <!-- Detalle Específico del Folio según el Caso y la Página -->
                <div class="space-y-3 font-mono text-[11px]">
                  
                  <!-- ESC-02 PÁGINA 3 (HOJA QUIRÚRGICA) -->
                  <div *ngIf="casoActivo().id === 'ESC-02' && documentoActivoId() === 'DOC-HOSP-HQ' && paginaActivaVisor() === 3" class="space-y-2">
                    <p class="font-bold text-slate-900">FOLIO QUIRÚRGICO Y ORDEN DE LIQUIDACIÓN DE URGENCIAS:</p>
                    <p>Paciente ingresa por dolor abdominal agudo en fosa ilíaca derecha. Valoración inicial por medicina de urgencias.</p>
                    <div class="bg-red-50 p-3 border border-red-300 rounded text-red-950 font-bold">
                      ORDEN #9941: CUPS 890201 Consulta Medicina General Urgencias. Valor liquidado en orden: \$85.000 COP.
                    </div>
                    <p class="text-slate-600">Nota de auditoría: Acuerdo de voluntades CTR-2026-SOS-SANVICENTE establece tarifa base de \$65.000 COP.</p>
                  </div>

                  <!-- ESC-02 PÁGINA 2 (LABORATORIO) -->
                  <div *ngIf="casoActivo().id === 'ESC-02' && documentoActivoId() === 'DOC-HOSP-LAB' && paginaActivaVisor() === 2" class="space-y-2">
                    <p class="font-bold text-slate-900">INFORME DE LABORATORIO CLÍNICO AUTOMATIZADO:</p>
                    <div class="bg-amber-50 p-3 border border-amber-300 rounded text-amber-950 font-bold">
                      Hemograma IV validado por bacteriólogo a las 15:20 hrs. Valores dentro de rango estándar.
                    </div>
                    <p>Leucocitos: 11.200 /mm³ | Neutrófilos: 74% | Plaquetas: 240.000 /mm³ | Hb: 14.2 g/dL.</p>
                  </div>

                  <!-- ESC-02 PÁGINA 4 (EPICRISIS / OXIGENOTERAPIA) -->
                  <div *ngIf="casoActivo().id === 'ESC-02' && documentoActivoId() === 'DOC-HOSP-EPI' && paginaActivaVisor() === 4" class="space-y-2">
                    <p class="font-bold text-slate-900">EVOLUCIÓN CLÍNICA Y REGISTRO DE ENFERMERÍA:</p>
                    <div class="bg-blue-50 p-3 border border-blue-300 rounded text-blue-950 font-bold">
                      ...se administra O2 continuo por cánula nasal durante 4 hrs (14:30 - 18:30). Paciente satura 96% al aire ambiente...
                    </div>
                    <p>18:35 - Se retira soporte de oxígeno tras estabilidad gasométrica y franca mejoría ventilatoria.</p>
                  </div>

                  <!-- ESC-03 PÁGINA 1 (EPICRISIS SOAT / FURIPS FALTANTE) -->
                  <div *ngIf="casoActivo().id === 'ESC-03' && paginaActivaVisor() === 1" class="space-y-2">
                    <p class="font-bold text-slate-900">INFORME DE ATENCIÓN DE URGENCIA POR ACCIDENTE DE TRÁNSITO:</p>
                    <div class="bg-amber-50 p-3 border border-amber-300 rounded text-amber-950 font-bold">
                      Ingreso por Urgencias derivado de Accidente de Tránsito (Atención SOAT). No consta radicado FURIPS.
                    </div>
                    <p>Vehículo involucrado: Motocicleta placa XYZ-12D. Póliza SOAT #9948210 Aseguradora Solidaria.</p>
                  </div>

                  <!-- ESC-03 PÁGINA 2 (AUTORIZACIÓN UBICADA) -->
                  <div *ngIf="casoActivo().id === 'ESC-03' && paginaActivaVisor() === 2" class="space-y-2">
                    <p class="font-bold text-slate-900">ANEXO DE AUTORIZACIONES Y VALIDACIONES EPS:</p>
                    <div class="bg-emerald-50 p-3 border border-emerald-300 rounded text-emerald-950 font-bold">
                      Autorización telefónica EPS: AUT-2026-99201 para valoración por traumatología y ortopedia.
                    </div>
                    <p>Fecha de emisión: 18-OCT-2026 20:15 hrs. Vigencia: 48 horas intrahospitalarias.</p>
                  </div>

                  <!-- CONTENIDO POR DEFECTO PARA OTROS CASOS O PÁGINAS -->
                  <div *ngIf="!((casoActivo().id === 'ESC-02' && (paginaActivaVisor() === 3 || paginaActivaVisor() === 2 || paginaActivaVisor() === 4)) || casoActivo().id === 'ESC-03')" class="space-y-2">
                    <p class="font-bold text-slate-900">RESUMEN DEL SOPORTE DIGITAL RADICADO:</p>
                    <p>{{ casoActivo().explicacionIaRag.resumenEjecutivo }}</p>
                    <p class="text-slate-600">Soporte verificado mediante OCR e indexado en el motor RAG de auditoría médica.</p>
                  </div>
                </div>

                <!-- Pie de Firma del Médico Tratante -->
                <div class="pt-8 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500 font-sans">
                  <div>
                    <p class="font-bold text-slate-700">Dr. Roberto Gómez Henao</p>
                    <p>Médico Cirujano · RM-10928-ANT</p>
                  </div>
                  <div>Página {{ paginaActivaVisor() }} de {{ documentoActivo()?.totalPaginas || 1 }}</div>
                </div>
              </div>

              <!-- LAYER DE BOUNDING BOXES OCR INTERACTIVOS (F03) -->
              <ng-container *ngIf="mostrarBoundingBoxes()">
                <div 
                  *ngFor="let bb of boundingBoxesDocumentoActivo()"
                  class="absolute border-2 rounded transition-all duration-200 cursor-pointer shadow-lg group z-10"
                  [style.left.%]="bb.coordenadas.x"
                  [style.top.%]="bb.coordenadas.y"
                  [style.width.%]="bb.coordenadas.width"
                  [style.height.%]="bb.coordenadas.height"
                  [style.borderColor]="bb.colorBorde"
                  [style.backgroundColor]="bb.colorBorde + '15'"
                >
                  <!-- Badge del Bounding Box -->
                  <div 
                    class="absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-sans font-bold text-white shadow flex items-center gap-1 shrink-0 whitespace-nowrap"
                    [style.backgroundColor]="bb.colorBorde"
                  >
                    <span>{{ bb.etiquetaCampo }}</span>
                  </div>

                  <!-- Tooltip de Evidencia OCR -->
                  <div class="hidden group-hover:block absolute top-full left-0 mt-1 w-72 bg-slate-900 text-slate-100 p-2.5 rounded-lg shadow-2xl border border-slate-700 text-[11px] font-sans z-30 leading-tight">
                    <p class="font-bold text-amber-400 mb-1">{{ bb.mensajeHallazgo }}</p>
                    <p class="text-slate-300 font-mono text-[10px] bg-slate-950 p-1 rounded border border-slate-800">"{{ bb.textoExtraidoOcr }}"</p>
                  </div>
                </div>
              </ng-container>

            </div>
          </div>
        </section>

      </main>

      <!-- =================================================================== -->
      <!-- TOAST FLOTANTE DE UNDO OPTIMISTA (5 SEGUNDOS) -->
      <!-- =================================================================== -->
      <div 
        *ngIf="toastUndo()" 
        class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center space-x-4 border border-slate-700 animate-slide-up text-xs font-sans"
      >
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
        <span>Glosa <strong>#{{ toastUndo()?.codigoGlosa }}</strong> resuelta exitosamente</span>
        <div class="h-4 w-px bg-slate-700"></div>
        <button 
          (click)="deshacerUltimaAccion()" 
          class="font-bold text-amber-400 hover:text-amber-300 underline text-xs"
        >
          Deshacer (Z)
        </button>
      </div>

    </div>
  `
})
export class SplitScreenComponent implements OnInit {

  // Auditor en sesión
  readonly auditorActual: Auditor = {
    id: 'USR-AUD-001',
    nombre: 'Dr. Juan Martínez',
    rol: 'AUDITOR_MEDICO',
    registroMedico: 'RM-45210',
    especialidad: 'Auditoría en Salud y Garantía de Calidad',
    email: 'jmartinez@auditai.ibs.co'
  };

  // Signals de estado
  casos = signal<CasoAuditoria[]>([]);
  casoActivoId = signal<string>('ESC-02');
  glosaActivaId = signal<string>('GL-01');
  filtroEstadoGlosa = signal<'TODAS' | 'PENDIENTES' | 'RESUELTAS'>('TODAS');
  documentoActivoId = signal<string>('DOC-HOSP-HQ');
  paginaActivaVisor = signal<number>(3);
  citaResaltadaTexto = signal<string>('');
  zoomNivel = signal<number>(100);
  mostrarBoundingBoxes = signal<boolean>(true);
  autoAvance = signal<boolean>(true);
  visorExpandido = signal<boolean>(false);
  visorColapsado = signal<boolean>(false);

  // Modo edición inline
  modoEdicionInline = signal<boolean>(false);
  montoAjustadoInput = signal<number>(0);
  justificacionAjusteInput = signal<string>('');

  // Toast flotante Undo
  toastUndo = signal<{ visible: boolean; glosaId: string; codigoGlosa: string; glosaPrev: GlosaFactura } | null>(null);
  private undoTimeout: any = null;

  private route = inject(ActivatedRoute);
  auditoriaService = inject(AuditoriaService);

  // Computeds reactivos
  casoActivo = computed(() => {
    const list = this.casos();
    const id = this.casoActivoId();
    return list.find(c => c.id === id) || list[0] || ({} as CasoAuditoria);
  });

  glosasDeFactura = computed(() => {
    return this.casoActivo().glosasFactura || [];
  });

  glosasFiltradas = computed(() => {
    const todas = this.glosasDeFactura();
    const f = this.filtroEstadoGlosa();
    if (f === 'PENDIENTES') return todas.filter(g => g.estadoGlosa === 'PENDIENTE');
    if (f === 'RESUELTAS') return todas.filter(g => g.estadoGlosa === 'RESUELTA' || g.estadoGlosa === 'ESCALADA');
    return todas;
  });

  glosaActiva = computed(() => {
    const list = this.glosasDeFactura();
    const id = this.glosaActivaId();
    return list.find(g => g.id === id) || list[0] || null;
  });

  progresoGlosas = computed(() => {
    const todas = this.glosasDeFactura();
    const total = todas.length;
    if (total === 0) return { total: 0, resueltas: 0, pendientes: 0, porcentaje: 100, completado: true };
    const resueltas = todas.filter(g => g.estadoGlosa === 'RESUELTA' || g.estadoGlosa === 'ESCALADA').length;
    const pendientes = total - resueltas;
    const porcentaje = Math.round((resueltas / total) * 100);
    return { total, resueltas, pendientes, porcentaje, completado: resueltas === total };
  });

  conciliacionFactura = computed(() => {
    const caso = this.casoActivo();
    const glosas = this.glosasDeFactura();
    const facturadoTotal = caso.resumenFinanciero?.valorFacturadoCop || 0;
    const glosaInicialTotal = glosas.reduce((acc, g) => acc + g.valorGlosaInicialCop, 0);
    const glosaDefinitivaTotal = glosas.reduce((acc, g) => acc + (g.decisionAplicada ? g.decisionAplicada.valorFinalGlosaCop : g.valorGlosaDefinitivaCop), 0);
    const aprobadoFinalTotal = Math.max(facturadoTotal - glosaDefinitivaTotal, 0);
    return { facturadoTotal, glosaInicialTotal, glosaDefinitivaTotal, aprobadoFinalTotal };
  });

  documentoActivo = computed(() => {
    const caso = this.casoActivo();
    if (!caso.soportesDocumentales || caso.soportesDocumentales.length === 0) return null;
    return caso.soportesDocumentales.find(d => d.id === this.documentoActivoId()) || caso.soportesDocumentales[0];
  });

  boundingBoxesDocumentoActivo = computed(() => {
    const caso = this.casoActivo();
    const docId = this.documentoActivoId();
    const pag = this.paginaActivaVisor();
    if (!caso.boundingBoxes) return [];
    return caso.boundingBoxes.filter(b => b.documentoId === docId && b.pagina === pag);
  });

  anchoPanelResolucion = computed(() => {
    if (this.visorExpandido()) return 28;
    if (this.visorColapsado()) return 60;
    return 40;
  });

  anchoPanelEvidencia = computed(() => {
    if (this.visorExpandido()) return 48;
    if (this.visorColapsado()) return 16;
    return 36;
  });

  ngOnInit(): void {
    this.cargarCasosSemillaMock();
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      this.aplicarParamId(param);
    }
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.aplicarParamId(id);
      }
    });
  }

  private aplicarParamId(param: string): void {
    if (param.includes('8849201') || param === 'ESC-01') this.seleccionarCaso('ESC-01');
    else if (param.includes('8849202') || param === 'ESC-02') this.seleccionarCaso('ESC-02');
    else if (param.includes('8849203') || param === 'ESC-03') this.seleccionarCaso('ESC-03');
    else if (param === 'ESC-04') this.seleccionarCaso('ESC-04');
    else if (param === 'ESC-05') this.seleccionarCaso('ESC-05');
    else if (param === 'ESC-06') this.seleccionarCaso('ESC-06');
  }

  seleccionarCaso(id: string): void {
    this.casoActivoId.set(id);
    this.auditoriaService.setScenario(id);
    const caso = this.casos().find(c => c.id === id);
    if (!caso) return;

    // Smart Landing: enfocar primera glosa pendiente
    const primeraPendiente = caso.glosasFactura?.find(g => g.estadoGlosa === 'PENDIENTE');
    const glosaInicial = primeraPendiente || caso.glosasFactura?.[0];
    if (glosaInicial) {
      this.seleccionarGlosa(glosaInicial.id);
    } else if (caso.soportesDocumentales?.length) {
      this.documentoActivoId.set(caso.soportesDocumentales[0].id);
      this.paginaActivaVisor.set(1);
    }
    this.modoEdicionInline.set(false);
  }

  seleccionarGlosa(glosaId: string): void {
    this.glosaActivaId.set(glosaId);
    this.modoEdicionInline.set(false);
    const glosa = this.glosasDeFactura().find(g => g.id === glosaId);
    if (glosa) {
      if (glosa.citasSoporte?.length) {
        this.enfocarCita(glosa.citasSoporte[0]);
      } else if (glosa.documentosRelacionadosIds?.length) {
        this.documentoActivoId.set(glosa.documentosRelacionadosIds[0]);
        this.paginaActivaVisor.set(1);
        this.citaResaltadaTexto.set('');
      }
    }
  }

  enfocarCita(cita: CitaSoporteGlosa): void {
    this.documentoActivoId.set(cita.documentoId);
    this.paginaActivaVisor.set(cita.pagina);
    this.citaResaltadaTexto.set(cita.extractoCita);
    this.mostrarBoundingBoxes.set(true);
  }

  esSoporteRelevante(docId: string): boolean {
    const glosa = this.glosaActiva();
    if (!glosa) return false;
    return glosa.documentosRelacionadosIds?.includes(docId) || false;
  }

  seleccionarDocumento(docId: string): void {
    this.documentoActivoId.set(docId);
    this.paginaActivaVisor.set(1);
    this.citaResaltadaTexto.set('');
  }

  cambiarPagina(delta: number): void {
    const doc = this.documentoActivo();
    const max = doc?.totalPaginas || 1;
    const nueva = Math.min(Math.max(this.paginaActivaVisor() + delta, 1), max);
    this.paginaActivaVisor.set(nueva);
  }

  cambiarZoom(delta: number): void {
    const nuevo = Math.min(Math.max(this.zoomNivel() + delta, 60), 160);
    this.zoomNivel.set(nuevo);
  }

  toggleBoundingBoxes(): void {
    this.mostrarBoundingBoxes.set(!this.mostrarBoundingBoxes());
  }

  toggleAutoAvance(): void {
    this.autoAvance.set(!this.autoAvance());
  }

  toggleExpandirVisor(): void {
    if (this.visorExpandido()) {
      this.visorExpandido.set(false);
    } else {
      this.visorExpandido.set(true);
      this.visorColapsado.set(false);
    }
  }

  // ACCIÓN 1: APLICAR SUGERENCIA IA (1 CLIC / ENTER)
  aplicarSugerenciaIa(glosa: GlosaFactura): void {
    const copiaPrevia = JSON.parse(JSON.stringify(glosa));
    const auditor = this.auditorActual;

    const list = this.casos().map(c => {
      if (c.id === this.casoActivoId()) {
        const nuevasGlosas = c.glosasFactura.map(g => {
          if (g.id === glosa.id) {
            return {
              ...g,
              estadoGlosa: 'RESUELTA' as const,
              valorGlosaDefinitivaCop: g.valorGlosaSugeridaIaCop,
              decisionAplicada: {
                tipo: 'ACEPTADA_IA' as const,
                etiqueta: 'Sugerencia IA Aplicada',
                valorFinalGlosaCop: g.valorGlosaSugeridaIaCop,
                argumentoFinal: g.borradorRespuestaIa,
                auditor: auditor.nombre,
                timestamp: new Date().toISOString()
              }
            };
          }
          return g;
        });
        return { ...c, glosasFactura: nuevasGlosas };
      }
      return c;
    });

    this.casos.set(list);
    this.dispararToastUndo(glosa.id, glosa.id, copiaPrevia);

    if (this.autoAvance()) {
      setTimeout(() => this.avanzarSiguienteGlosaPendiente(), 250);
    }
  }

  // ACCIÓN 2: MANTENER GLOSA AL 100%
  mantenerGlosaTotal(glosa: GlosaFactura): void {
    const copiaPrevia = JSON.parse(JSON.stringify(glosa));
    const auditor = this.auditorActual;

    const list = this.casos().map(c => {
      if (c.id === this.casoActivoId()) {
        const nuevasGlosas = c.glosasFactura.map(g => {
          if (g.id === glosa.id) {
            return {
              ...g,
              estadoGlosa: 'RESUELTA' as const,
              valorGlosaDefinitivaCop: g.valorGlosaInicialCop,
              decisionAplicada: {
                tipo: 'MANTENIDA_TOTAL' as const,
                etiqueta: 'Glosa Ratificada al 100%',
                valorFinalGlosaCop: g.valorGlosaInicialCop,
                argumentoFinal: `Se ratifica el 100% de la glosa inicial (${g.causal.codigoManualUnico}) tras revisión documental completa.`,
                auditor: auditor.nombre,
                timestamp: new Date().toISOString()
              }
            };
          }
          return g;
        });
        return { ...c, glosasFactura: nuevasGlosas };
      }
      return c;
    });

    this.casos.set(list);
    this.dispararToastUndo(glosa.id, glosa.id, copiaPrevia);

    if (this.autoAvance()) {
      setTimeout(() => this.avanzarSiguienteGlosaPendiente(), 250);
    }
  }

  // ACCIÓN 3: ESCALAR GLOSA
  escalarGlosa(glosa: GlosaFactura): void {
    const copiaPrevia = JSON.parse(JSON.stringify(glosa));
    const auditor = this.auditorActual;

    const list = this.casos().map(c => {
      if (c.id === this.casoActivoId()) {
        const nuevasGlosas = c.glosasFactura.map(g => {
          if (g.id === glosa.id) {
            return {
              ...g,
              estadoGlosa: 'ESCALADA' as const,
              decisionAplicada: {
                tipo: 'ESCALADA_ESPECIALISTA' as const,
                etiqueta: 'Escalada a Médico Especialista',
                valorFinalGlosaCop: g.valorGlosaInicialCop,
                argumentoFinal: 'Escalada a segundo nivel de auditoría médica para conciliación de pertinencia clínica.',
                auditor: auditor.nombre,
                timestamp: new Date().toISOString()
              }
            };
          }
          return g;
        });
        return { ...c, glosasFactura: nuevasGlosas };
      }
      return c;
    });

    this.casos.set(list);
    this.dispararToastUndo(glosa.id, glosa.id, copiaPrevia);
  }

  // ACCIÓN 4: EDICIÓN INLINE CON BLINDAJE FORENSE
  activarEdicionInline(glosa: GlosaFactura): void {
    this.montoAjustadoInput.set(glosa.valorGlosaDefinitivaCop || glosa.valorGlosaSugeridaIaCop);
    this.justificacionAjusteInput.set('');
    this.modoEdicionInline.set(true);
  }

  cancelarEdicionInline(): void {
    this.modoEdicionInline.set(false);
  }

  guardarEdicionInline(glosa: GlosaFactura): void {
    if (this.justificacionAjusteInput().length < 50) return;
    const copiaPrevia = JSON.parse(JSON.stringify(glosa));
    const auditor = this.auditorActual;
    const monto = this.montoAjustadoInput();
    const justificacion = this.justificacionAjusteInput();

    const list = this.casos().map(c => {
      if (c.id === this.casoActivoId()) {
        const nuevasGlosas = c.glosasFactura.map(g => {
          if (g.id === glosa.id) {
            return {
              ...g,
              estadoGlosa: 'RESUELTA' as const,
              valorGlosaDefinitivaCop: monto,
              decisionAplicada: {
                tipo: 'AJUSTADA_AUDITOR' as const,
                etiqueta: 'Ajuste Manual Forense',
                valorFinalGlosaCop: monto,
                argumentoFinal: justificacion,
                auditor: auditor.nombre,
                timestamp: new Date().toISOString()
              }
            };
          }
          return g;
        });
        return { ...c, glosasFactura: nuevasGlosas };
      }
      return c;
    });

    this.casos.set(list);
    this.modoEdicionInline.set(false);
    this.dispararToastUndo(glosa.id, glosa.id, copiaPrevia);

    if (this.autoAvance()) {
      setTimeout(() => this.avanzarSiguienteGlosaPendiente(), 250);
    }
  }

  // DESHACER OPTIMISTA (Z)
  private dispararToastUndo(glosaId: string, codigoGlosa: string, glosaPrev: GlosaFactura): void {
    if (this.undoTimeout) clearTimeout(this.undoTimeout);
    this.toastUndo.set({ visible: true, glosaId, codigoGlosa, glosaPrev });
    this.undoTimeout = setTimeout(() => {
      this.toastUndo.set(null);
    }, 5000);
  }

  deshacerUltimaAccion(): void {
    const t = this.toastUndo();
    if (!t) return;
    const list = this.casos().map(c => {
      if (c.id === this.casoActivoId()) {
        const restauradas = c.glosasFactura.map(g => {
          if (g.id === t.glosaId) {
            return { ...t.glosaPrev };
          }
          return g;
        });
        return { ...c, glosasFactura: restauradas };
      }
      return c;
    });

    this.casos.set(list);
    this.toastUndo.set(null);
    this.seleccionarGlosa(t.glosaId);
  }

  avanzarSiguienteGlosaPendiente(): void {
    const pendientes = this.glosasDeFactura().filter(g => g.estadoGlosa === 'PENDIENTE');
    if (pendientes.length > 0) {
      this.seleccionarGlosa(pendientes[0].id);
    }
  }

  finalizarAuditoriaFactura(): void {
    const conc = this.conciliacionFactura();
    alert(`Auditoría de Factura ${this.casoActivo().fevNumero} Finalizada Exitosamente.\\n\\n• Total Facturado: \$$conc.facturadoTotal.toLocaleString('es-CO')} COP\\n• Total Glosa Definitiva: \$$conc.glosaDefinitivaTotal.toLocaleString('es-CO')} COP\\n• Valor Neto Aprobado: \$$conc.aprobadoFinalTotal.toLocaleString('es-CO')} COP\\n\\nExpediente despachado formalmente a Tesorería y notificado a la IPS.`);
  }

  // Métodos normativos de respaldo
  descargarConstanciaRechazo(): void {
    alert('Descargando Constancia Oficial de Rechazo Inmediato por Falta de CUV (Res. 0948/2026 Art. 3.1) en formato PDF.');
  }

  simularPreclusionDevolucion(): void {
    const list = this.casos().map(c => {
      if (c.id === 'ESC-05') {
        return {
          ...c,
          estadoAuditoria: 'DEVOLUCION_PRECLUIDA' as const,
          semaforo: {
            ...c.semaforo,
            diasHabilesRestantes: 0,
            mensajeNormativo: 'PRECLUSIÓN DE DEVOLUCIÓN: Superados 5 días hábiles. Debe auditarse por glosas.'
          }
        };
      }
      return c;
    });
    this.casos.set(list);
  }

  simularRespuestaIps(tipo: 'RE9701' | 'RE9601'): void {
    const list = this.casos().map(c => {
      if (c.id === 'ESC-05') {
        return {
          ...c,
          estadoAuditoria: tipo === 'RE9701' ? ('APROBADA_NOTIFICADA' as const) : ('DEVOLUCION_CONTROVERTIDA' as const),
          semaforo: {
            ...c.semaforo,
            mensajeNormativo: tipo === 'RE9701' ? 'IPS Aceptó devolución (RE9701): Se expedirá Nota Crédito y nuevo NUR.' : 'IPS Controvirtió devolución (RE9601): Continúa sobre el mismo NUR.'
          }
        };
      }
      return c;
    });
    this.casos.set(list);
  }

  despacharPagoAceptacionTacita(): void {
    const list = this.casos().map(c => {
      if (c.id === 'ESC-06') {
        return {
          ...c,
          aceptacionTacitaLey1438: {
            ...c.aceptacionTacitaLey1438!,
            estadoDespachoPago: 'DESPACHADO_A_CORE_EPS' as const
          }
        };
      }
      return c;
    });
    this.casos.set(list);
    alert('Factura despachada formalmente al Core de Tesorería para giro directo por aceptación tácita perentoria.');
  }

  // Atajos de Teclado
  @HostListener('window:keydown', ['$event'])
  manejarAtajosTeclado(event: KeyboardEvent): void {
    // Si el usuario está escribiendo en un input o textarea, no capturar teclas globales
    const tag = (event.target as HTMLElement)?.tagName?.toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (event.key === 'j' || event.key === 'ArrowDown') {
      event.preventDefault();
      const todas = this.glosasFiltradas();
      const idx = todas.findIndex(g => g.id === this.glosaActivaId());
      if (idx >= 0 && idx < todas.length - 1) {
        this.seleccionarGlosa(todas[idx + 1].id);
      }
    } else if (event.key === 'k' || event.key === 'ArrowUp') {
      event.preventDefault();
      const todas = this.glosasFiltradas();
      const idx = todas.findIndex(g => g.id === this.glosaActivaId());
      if (idx > 0) {
        this.seleccionarGlosa(todas[idx - 1].id);
      }
    } else if ((event.key === 'Enter' || event.key === 'a' || event.key === 'A') && !this.modoEdicionInline()) {
      const glosa = this.glosaActiva();
      if (glosa && glosa.estadoGlosa === 'PENDIENTE') {
        event.preventDefault();
        this.aplicarSugerenciaIa(glosa);
      }
    } else if ((event.key === 'e' || event.key === 'E') && !this.modoEdicionInline()) {
      const glosa = this.glosaActiva();
      if (glosa) {
        event.preventDefault();
        this.activarEdicionInline(glosa);
      }
    } else if (event.key === 'z' || event.key === 'Z') {
      if (this.toastUndo()) {
        event.preventDefault();
        this.deshacerUltimaAccion();
      }
    } else if (event.key === '[' || event.key === ']') {
      event.preventDefault();
      this.toggleExpandirVisor();
    }
  }

  // Carga de Semillas Mock
  cargarCasosSemillaMock(): void {
    const casosSemilla: CasoAuditoria[] = [
      // ----------------------------------------------------------------------
      // ESC-01: Cuenta Conforme (Aprobada Directa)
      // ----------------------------------------------------------------------
      {
        id: 'ESC-01',
        nur: 'NUR-2026-8849201',
        loteId: 'LOTE-2026-10-0012',
        fevNumero: 'FEV-982104',
        cuv: 'CUV-8909001234-20261020-982104',
        cufe: 'd41d8cd98f00b204e9800998ecf8427e01294810294810294812094812049812',
        prestador: {
          nit: '890900123-4',
          nombre: 'Clínica Las Américas S.A.',
          codigoHabilitation: '050010214401',
          sede: 'Sede Principal 80'
        },
        paciente: {
          tipoDocumento: 'CC',
          numeroDocumento: '43.210.987',
          nombreCompleto: 'Gloria Elena Restrepo Hincapié',
          edad: 52,
          sexo: 'F',
          planAfiliacion: 'Contributivo - Cotizante'
        },
        diagnosticoPrincipal: {
          codigoCie10: 'K802',
          descripcion: 'Cálculo de la vesícula biliar sin colecistitis'
        },
        fechas: {
          fechaIngreso: '2026-10-15T07:30:00-05:00',
          fechaEgreso: '2026-10-16T18:00:00-05:00',
          fechaRadicacion: '2026-10-20T08:15:22-05:00',
          fechaVencimientoLegal: '2026-11-10T23:59:59-05:00'
        },
        semaforo: {
          diasHabilesRestantes: 7,
          nivelRiesgo: 'VERDE',
          colorHex: '#22C55E',
          mensajeNormativo: 'Plazo amplio de auditoría (Resolución 2284 de 2023)'
        },
        resumenFinanciero: {
          valorFacturadoCop: 2450000.0,
          valorTarifaPactadaCop: 2450000.0,
          valorGlosaSugeridaCop: 0.0,
          valorAprobadoSugeridoCop: 2450000.0
        },
        estadoAuditoria: 'APROBADA_NOTIFICADA',
        tipoResultadoPredictivo: 'APROBADO_DIRECTO',
        confianzaIaPorcentaje: 99.2,
        causalGlosa: null,
        itemsFacturados: [
          {
            linea: 1,
            codigoCups: '471110',
            descripcionCups: 'Colecistectomía laparoscópica vía abdominal',
            cantidad: 1,
            valorFacturadoCop: 1850000.0,
            valorTarifaPactadaCop: 1850000.0,
            valorGlosaSugeridaCop: 0.0,
            estadoItem: 'CONFORME',
            observacionIa: 'Coincidencia exacta con Anexo Contractual SOAT 2026 + 5%.'
          }
        ],
        glosasFactura: [
          {
            id: 'GL-01',
            lineaItem: 1,
            codigoCups: '471110',
            descripcionItem: 'Colecistectomía laparoscópica vía abdominal',
            tituloCorto: 'Validación Quirúrgica Conforme',
            causal: {
              codigoManualUnico: 'SIN_GLOSA',
              codigoRes3047: '000',
              familia: 'CL',
              descripcion: 'Procedimiento quirúrgico plenamente justificado en historia clínica'
            },
            valorFacturadoItemCop: 1850000.0,
            valorTarifaPactadaItemCop: 1850000.0,
            valorGlosaInicialCop: 0.0,
            valorGlosaSugeridaIaCop: 0.0,
            valorGlosaDefinitivaCop: 0.0,
            veredictoIa: 'APROBAR_ITEM',
            confianzaIaPorcentaje: 99.2,
            causaDetalle: 'Validación integral exitosa: tiempos quirúrgicos, técnica laparoscópica y tarifas pactadas coinciden al 100%.',
            solucionSugeridaIa: 'Aprobar directamente para pago sin objeciones (Straight-Through Processing).',
            sustentoNormativo: 'Resolución 2284 de 2023 - Procedimientos conforme a tarifas contratadas.',
            fuentesCite: ['Resolución 2284 de 2023', 'Acuerdo de Voluntades CTR-2026-SOS-CLINICA-AMERICAS'],
            borradorRespuestaIa: 'Cuenta conforme. Aprobada para pago.',
            citasSoporte: [
              {
                etiqueta: 'Epicrisis Quirúrgica (pág. 1)',
                documentoId: 'DOC-8849201-EPI',
                pagina: 1,
                extractoCita: 'Colecistectomía laparoscópica electiva sin complicaciones.'
              }
            ],
            documentosRelacionadosIds: ['DOC-8849201-EPI', 'DOC-8849201-FEV'],
            estadoGlosa: 'RESUELTA',
            decisionAplicada: {
              tipo: 'ACEPTADA_IA',
              etiqueta: 'Aprobación Directa',
              valorFinalGlosaCop: 0,
              argumentoFinal: 'Cuenta médica con conformidad integral del 100%.',
              auditor: 'Dr. Juan Martínez',
              timestamp: '2026-10-20T09:30:00-05:00'
            }
          }
        ],
        soportesDocumentales: [
          { id: 'DOC-8849201-FEV', tipoDocumento: 'FEV_XML', nombreArchivo: 'FEV_982104.xml', urlMock: 'assets/soportes/FEV_982104.xml', totalPaginas: 1 },
          { id: 'DOC-8849201-EPI', tipoDocumento: 'EPICRISIS_PDF', nombreArchivo: 'Epicrisis.pdf', urlMock: 'assets/soportes/Epicrisis.pdf', totalPaginas: 2 }
        ],
        boundingBoxes: [],
        explicacionIaRag: {
          resumenEjecutivo: 'Cuenta médica con conformidad integral del 100%.',
          sustentoNormativo: 'Resolución 2284 de 2023 Anexo 3.',
          fuentesCite: ['Resolución 2284 de 2023']
        }
      },

      // ----------------------------------------------------------------------
      // ESC-02: Hospital San Vicente Fundación (MÚLTIPLES GLOSAS: 3 GLOSAS)
      // ----------------------------------------------------------------------
      {
        id: 'ESC-02',
        nur: 'NUR-2026-8849202',
        loteId: 'LOTE-2026-10-0014',
        fevNumero: 'A118492568',
        cuv: 'CUV-8909002863-20261025-104921',
        cufe: 'a17f8e3290bc3312981f18210984129481294012948120498102948120948120',
        prestador: {
          nit: '890900286-3',
          nombre: 'Hospital Universitario San Vicente Fundación',
          codigoHabilitation: '050010045201',
          sede: 'Sede Medellín Central'
        },
        paciente: {
          tipoDocumento: 'CC',
          numeroDocumento: '71.345.892',
          nombreCompleto: 'Jorge Iván Mejía Córdoba',
          edad: 38,
          sexo: 'M',
          planAfiliacion: 'Contributivo - Cotizante'
        },
        diagnosticoPrincipal: {
          codigoCie10: 'K358',
          descripcion: 'Apendicitis aguda, otra y la no especificada'
        },
        fechas: {
          fechaIngreso: '2026-10-21T14:10:00-05:00',
          fechaEgreso: '2026-10-22T11:30:00-05:00',
          fechaRadicacion: '2026-10-25T16:45:10-05:00',
          fechaVencimientoLegal: '2026-11-03T23:59:59-05:00'
        },
        semaforo: {
          diasHabilesRestantes: 3,
          nivelRiesgo: 'ROJO',
          colorHex: '#EF4444',
          mensajeNormativo: '¡ALERTA MÁXIMA DE VENCIMIENTO! Faltan 3 días hábiles para riesgo de glosa tácita'
        },
        resumenFinanciero: {
          valorFacturadoCop: 580000.0,
          valorTarifaPactadaCop: 545000.0,
          valorGlosaSugeridaCop: 260000.0,
          valorAprobadoSugeridoCop: 320000.0
        },
        estadoAuditoria: 'PENDIENTE',
        tipoResultadoPredictivo: 'GLOSA_PARCIAL',
        confianzaIaPorcentaje: 94.8,
        causalGlosa: {
          codigoManualUnico: 'TA0201',
          codigoRes3047: '312',
          familia: 'TA',
          descripcion: 'Tarifa superior a la pactada en el acuerdo de voluntades'
        },
        itemsFacturados: [
          {
            linea: 1,
            codigoCups: '890201',
            descripcionCups: 'Consulta de medicina general / urgencias',
            cantidad: 1,
            valorFacturadoCop: 85000.0,
            valorTarifaPactadaCop: 65000.0,
            valorGlosaSugeridaCop: 20000.0,
            estadoItem: 'GLOSADO_SUGERIDO',
            observacionIa: 'Excedente tarifario no pactado.'
          },
          {
            linea: 2,
            codigoCups: '902210',
            descripcionCups: 'Hemograma IV automatizado',
            cantidad: 1,
            valorFacturadoCop: 45000.0,
            valorTarifaPactadaCop: 30000.0,
            valorGlosaSugeridaCop: 15000.0,
            estadoItem: 'GLOSADO_SUGERIDO',
            observacionIa: 'Tarifa de laboratorio excedida.'
          },
          {
            linea: 3,
            codigoCups: '939400',
            descripcionCups: 'Oxigenoterapia continua en urgencias (8 horas)',
            cantidad: 1,
            valorFacturadoCop: 450000.0,
            valorTarifaPactadaCop: 450000.0,
            valorGlosaSugeridaCop: 225000.0,
            estadoItem: 'GLOSADO_SUGERIDO',
            observacionIa: 'Soporte clínico cubre 4 horas efectivas.'
          }
        ],
        glosasFactura: [
          {
            id: 'GL-01',
            lineaItem: 1,
            codigoCups: '890201',
            descripcionItem: 'Consulta de Medicina General / Urgencias',
            tituloCorto: 'Tarifa Urgencias superior a la pactada',
            causal: {
              codigoManualUnico: 'TA0201',
              codigoRes3047: '312',
              familia: 'TA',
              descripcion: 'Tarifa superior a la pactada en el acuerdo de voluntades'
            },
            valorFacturadoItemCop: 85000.0,
            valorTarifaPactadaItemCop: 65000.0,
            valorGlosaInicialCop: 20000.0,
            valorGlosaSugeridaIaCop: 20000.0,
            valorGlosaDefinitivaCop: 20000.0,
            veredictoIa: 'RATIFICAR_TOTAL',
            confianzaIaPorcentaje: 95.0,
            causaDetalle: 'El valor liquidado en factura ($85.000 COP) excede en $20.000 COP la tarifa pactada en Contrato CTR-2026-SOS-SANVICENTE Anexo 1 ($65.000 COP).',
            solucionSugeridaIa: 'Ratificar la glosa por $20.000 COP. La tarifa del anexo contractual vigente no admite sobrecosto en consulta médica de primer nivel.',
            sustentoNormativo: 'Resolución 2284 de 2023 Anexo 3 Causal TA0201 (Causal 312 Res. 3047).',
            fuentesCite: ['Manual Único de Glosas Res. 2284/2023', 'Contrato CTR-2026-SOS-SANVICENTE'],
            borradorRespuestaIa: 'Se ratifica glosa por valor de $20.000 COP en la línea 1 (CUPS 890201) por exceder la tarifa pactada de $65.000 COP.',
            citasSoporte: [
              {
                etiqueta: 'Hoja Quirúrgica (pág. 3)',
                documentoId: 'DOC-HOSP-HQ',
                pagina: 3,
                boundingBoxId: 'BB-ESC02-01',
                extractoCita: 'CUPS 890201 Consulta Medicina General Urgencias. Valor liquidado en orden: $85.000 COP.'
              }
            ],
            documentosRelacionadosIds: ['DOC-HOSP-HQ', 'DOC-HOSP-FEV'],
            estadoGlosa: 'PENDIENTE'
          },
          {
            id: 'GL-02',
            lineaItem: 2,
            codigoCups: '902210',
            descripcionItem: 'Hemograma IV Automatizado',
            tituloCorto: 'Tarifa de laboratorio clínico excede tarifario base',
            causal: {
              codigoManualUnico: 'TA0201',
              codigoRes3047: '312',
              familia: 'TA',
              descripcion: 'Tarifa superior a la pactada en el acuerdo de voluntades'
            },
            valorFacturadoItemCop: 45000.0,
            valorTarifaPactadaItemCop: 30000.0,
            valorGlosaInicialCop: 15000.0,
            valorGlosaSugeridaIaCop: 15000.0,
            valorGlosaDefinitivaCop: 15000.0,
            veredictoIa: 'RATIFICAR_TOTAL',
            confianzaIaPorcentaje: 93.5,
            causaDetalle: 'Se liquidó Hemograma IV a $45.000 COP cuando la tarifa pactada en el manual institucional es de $30.000 COP.',
            solucionSugeridaIa: 'Ratificar glosa de $15.000 COP. En la página 2 del reporte paraclínico se valida la ejecución técnica pero aplica tarifa contratada de $30.000 COP.',
            sustentoNormativo: 'Resolución 2284 de 2023 - Manual de tarifas de laboratorio.',
            fuentesCite: ['Resolución 2284 de 2023', 'Anexo Tarifario Laboratorio 2026'],
            borradorRespuestaIa: 'Glosa ratificada por $15.000 COP conforme al anexo tarifario de laboratorio pactado.',
            citasSoporte: [
              {
                etiqueta: 'Reporte Laboratorio (pág. 2)',
                documentoId: 'DOC-HOSP-LAB',
                pagina: 2,
                boundingBoxId: 'BB-ESC02-02',
                extractoCita: 'Hemograma IV validado por bacteriólogo a las 15:20 hrs. Valores dentro de rango estándar.'
              }
            ],
            documentosRelacionadosIds: ['DOC-HOSP-LAB', 'DOC-HOSP-FEV'],
            estadoGlosa: 'PENDIENTE'
          },
          {
            id: 'GL-03',
            lineaItem: 3,
            codigoCups: '939400',
            descripcionItem: 'Oxigenoterapia continua en urgencias (8 horas)',
            tituloCorto: 'Oxigenoterapia: 8 horas cobradas vs 4 horas en notas',
            causal: {
              codigoManualUnico: 'CL0102',
              codigoRes3047: '401',
              familia: 'CL',
              descripcion: 'Cantidad de servicios facturados no justificada en la historia clínica'
            },
            valorFacturadoItemCop: 450000.0,
            valorTarifaPactadaItemCop: 450000.0,
            valorGlosaInicialCop: 450000.0,
            valorGlosaSugeridaIaCop: 225000.0,
            valorGlosaDefinitivaCop: 225000.0,
            veredictoIa: 'LEVANTAR_PARCIAL',
            confianzaIaPorcentaje: 94.2,
            causaDetalle: 'Cobro de Oxigenoterapia continua por 8 horas ($450.000 COP), pero las notas de enfermería y evolución solo registran suministro efectivo durante 4 horas.',
            solucionSugeridaIa: 'Según nota médica de las 14:30 (Epicrisis pág. 4), se administró O2 de 14:30 a 18:30 (4 horas). Se sugiere conciliar ajuste a $225.000 COP y ratificar el saldo de $225.000 COP.',
            sustentoNormativo: 'Resolución 2284 de 2023 - Causal CL0102: "Cantidad de servicios facturados no justificada en la historia clínica".',
            fuentesCite: ['Resolución 2284 de 2023', 'Guía de Práctica Clínica Oxigenoterapia MinSalud'],
            borradorRespuestaIa: 'Se concilia reconocimiento de 4 horas sustentadas en notas médicas ($225.000 COP) y se ratifica glosa por las 4 horas no soportadas ($225.000 COP).',
            citasSoporte: [
              {
                etiqueta: 'Epicrisis / Notas Enfermería (pág. 4)',
                documentoId: 'DOC-HOSP-EPI',
                pagina: 4,
                boundingBoxId: 'BB-ESC02-03',
                extractoCita: '...se administra O2 continuo por cánula nasal durante 4 hrs (14:30 - 18:30). Paciente satura 96% al aire ambiente...'
              }
            ],
            documentosRelacionadosIds: ['DOC-HOSP-EPI', 'DOC-HOSP-HQ'],
            estadoGlosa: 'PENDIENTE'
          }
        ],
        soportesDocumentales: [
          { id: 'DOC-HOSP-HQ', tipoDocumento: 'HOJA_QUIRURGICA_PDF', nombreArchivo: 'Hoja_qx.pdf', urlMock: 'assets/soportes/HojaQuirurgica.pdf', totalPaginas: 4 },
          { id: 'DOC-HOSP-LAB', tipoDocumento: 'OTRO_PDF', nombreArchivo: 'Laboratorio.pdf', urlMock: 'assets/soportes/Laboratorio.pdf', totalPaginas: 2 },
          { id: 'DOC-HOSP-EPI', tipoDocumento: 'EPICRISIS_PDF', nombreArchivo: 'Epicrisis.pdf', urlMock: 'assets/soportes/Epicrisis.pdf', totalPaginas: 4 },
          { id: 'DOC-HOSP-FEV', tipoDocumento: 'FEV_XML', nombreArchivo: 'FEV.xml', urlMock: 'assets/soportes/FEV.xml', totalPaginas: 1 }
        ],
        boundingBoxes: [
          {
            id: 'BB-ESC02-01',
            documentoId: 'DOC-HOSP-HQ',
            pagina: 3,
            coordenadas: { x: 10.0, y: 40.0, width: 80.0, height: 14.0 },
            textoExtraidoOcr: 'CUPS 890201 Consulta Medicina General Urgencias. Valor liquidado en orden: $85.000 COP.',
            etiquetaCampo: 'Liquidación Tarifaria Excedida',
            colorBorde: '#EF4444',
            mensajeHallazgo: 'Diferencia no pactada de $20.000 COP sobre la tarifa de contrato.'
          },
          {
            id: 'BB-ESC02-02',
            documentoId: 'DOC-HOSP-LAB',
            pagina: 2,
            coordenadas: { x: 10.0, y: 35.0, width: 80.0, height: 12.0 },
            textoExtraidoOcr: 'Hemograma IV validado por bacteriólogo a las 15:20 hrs. Valores dentro de rango estándar.',
            etiquetaCampo: 'Tarifa Laboratorio Excedida',
            colorBorde: '#F59E0B',
            mensajeHallazgo: 'Validación técnica presente. Aplica tarifa contratada de $30.000 COP.'
          },
          {
            id: 'BB-ESC02-03',
            documentoId: 'DOC-HOSP-EPI',
            pagina: 4,
            coordenadas: { x: 10.0, y: 48.0, width: 80.0, height: 16.0 },
            textoExtraidoOcr: '...se administra O2 continuo por cánula nasal durante 4 hrs (14:30 - 18:30). Paciente satura 96% al aire ambiente...',
            etiquetaCampo: 'Tiempo O2 Incompleto',
            colorBorde: '#3B82F6',
            mensajeHallazgo: 'Soporte documenta 4 horas de suministro vs 8 horas liquidadas.'
          }
        ],
        explicacionIaRag: {
          resumenEjecutivo: 'Cuenta médica con 3 hallazgos: 2 excesos de tarifa en urgencias y laboratorio, y soporte clínico de oxigenoterapia por la mitad del tiempo liquidado.',
          sustentoNormativo: 'Resolución 2284 de 2023 Anexo 3 - Causales TA0201 y CL0102.',
          fuentesCite: ['Resolución 2284 de 2023', 'Contrato CTR-2026-SOS-SANVICENTE']
        }
      },

      // ----------------------------------------------------------------------
      // ESC-03: Centro Médico El Poblado (MÚLTIPLES GLOSAS: 2 GLOSAS)
      // ----------------------------------------------------------------------
      {
        id: 'ESC-03',
        nur: 'NUR-2026-8849203',
        loteId: 'LOTE-2026-10-0019',
        fevNumero: 'FEV-459102',
        cuv: 'CUV-9003456789-20261022-459102',
        cufe: 'b881293810293812093812093812093812093812093812093812093812093812',
        prestador: {
          nit: '900345678-9',
          nombre: 'Centro Médico El Poblado IPS S.A.S.',
          codigoHabilitation: '050010998101',
          sede: 'Sede El Poblado'
        },
        paciente: {
          tipoDocumento: 'CC',
          numeroDocumento: '1.017.234.567',
          nombreCompleto: 'María Camila Torres Zapata',
          edad: 27,
          sexo: 'F',
          planAfiliacion: 'Contributivo - Beneficiario'
        },
        diagnosticoPrincipal: {
          codigoCie10: 'V892',
          descripcion: 'Persona lesionada en accidente de tránsito no especificado'
        },
        fechas: {
          fechaIngreso: '2026-10-18T19:20:00-05:00',
          fechaEgreso: '2026-10-19T04:10:00-05:00',
          fechaRadicacion: '2026-10-22T10:11:05-05:00',
          fechaVencimientoLegal: '2026-11-12T23:59:59-05:00'
        },
        semaforo: {
          diasHabilesRestantes: 8,
          nivelRiesgo: 'AMARILLO',
          colorHex: '#F59E0B',
          mensajeNormativo: 'Atención: Plazo intermedio de auditoría (8 días hábiles restantes)'
        },
        resumenFinanciero: {
          valorFacturadoCop: 410000.0,
          valorTarifaPactadaCop: 130000.0,
          valorGlosaSugeridaCop: 280000.0,
          valorAprobadoSugeridoCop: 130000.0
        },
        estadoAuditoria: 'PENDIENTE',
        tipoResultadoPredictivo: 'RECHAZO_NORMATIVO',
        confianzaIaPorcentaje: 98.5,
        causalGlosa: {
          codigoManualUnico: 'DE1601',
          codigoRes3047: '204',
          familia: 'SO',
          descripcion: 'Ausencia del Formulario Único de Reclamación (FURIPS) en accidentes de tránsito'
        },
        itemsFacturados: [
          {
            linea: 1,
            codigoCups: '902210',
            descripcionCups: 'Hemograma IV y Perfil de Trauma Completo',
            cantidad: 1,
            valorFacturadoCop: 280000.0,
            valorTarifaPactadaCop: 0.0,
            valorGlosaSugeridaCop: 280000.0,
            estadoItem: 'GLOSADO_SUGERIDO',
            observacionIa: 'Facturado bajo póliza SOAT/ECAT sin adjuntar FURIPS.'
          },
          {
            linea: 2,
            codigoCups: '890701',
            descripcionCups: 'Consulta de control por especialista quirúrgico',
            cantidad: 1,
            valorFacturadoCop: 130000.0,
            valorTarifaPactadaCop: 130000.0,
            valorGlosaSugeridaCop: 0.0,
            estadoItem: 'CONFORME',
            observacionIa: 'Autorización AUT-2026-99201 ubicada en pág. 2 de epicrisis.'
          }
        ],
        glosasFactura: [
          {
            id: 'GL-01',
            lineaItem: 1,
            codigoCups: '902210',
            descripcionItem: 'Hemograma IV y Perfil de Trauma Completo',
            tituloCorto: 'Ausencia de Formulario Único FURIPS obligatorio',
            causal: {
              codigoManualUnico: 'DE1601',
              codigoRes3047: '204',
              familia: 'SO',
              descripcion: 'Ausencia de FURIPS en atención SOAT'
            },
            valorFacturadoItemCop: 280000.0,
            valorTarifaPactadaItemCop: 0.0,
            valorGlosaInicialCop: 280000.0,
            valorGlosaSugeridaIaCop: 280000.0,
            valorGlosaDefinitivaCop: 280000.0,
            veredictoIa: 'RATIFICAR_TOTAL',
            confianzaIaPorcentaje: 98.5,
            causaDetalle: 'Atención clasificada como accidente de tránsito sin incluir el formulario oficial FURIPS exigido por el Decreto 780 de 2016.',
            solucionSugeridaIa: 'Ratificar la glosa en su totalidad ($280.000 COP). Sin FURIPS no procede recobro con cargo a la subcuenta ECAT.',
            sustentoNormativo: 'Decreto 780 de 2016 y Res. 2284 de 2023 Causal DE1601 / Causal 204.',
            fuentesCite: ['Decreto 780 de 2016', 'Resolución 2284 de 2023'],
            borradorRespuestaIa: 'Se ratifica glosa por $280.000 COP por omisión de formulario obligatorio FURIPS en atención de accidente de tránsito.',
            citasSoporte: [
              {
                etiqueta: 'Epicrisis Atención Inicial (pág. 1)',
                documentoId: 'DOC-8849203-EPI',
                pagina: 1,
                boundingBoxId: 'BB-ESC03-01',
                extractoCita: 'Ingreso por Urgencias derivado de Accidente de Tránsito (Atención SOAT). No consta radicado FURIPS.'
              }
            ],
            documentosRelacionadosIds: ['DOC-8849203-EPI'],
            estadoGlosa: 'PENDIENTE'
          },
          {
            id: 'GL-02',
            lineaItem: 2,
            codigoCups: '890701',
            descripcionItem: 'Consulta de Control por Especialista Quirúrgico',
            tituloCorto: 'Interconsulta médica: Autorización validada en expediente',
            causal: {
              codigoManualUnico: 'AU0101',
              codigoRes3047: '501',
              familia: 'AU',
              descripcion: 'Servicio no autorizado previamente por la aseguradora'
            },
            valorFacturadoItemCop: 130000.0,
            valorTarifaPactadaItemCop: 130000.0,
            valorGlosaInicialCop: 130000.0,
            valorGlosaSugeridaIaCop: 0.0,
            valorGlosaDefinitivaCop: 0.0,
            veredictoIa: 'LEVANTAR_TOTAL',
            confianzaIaPorcentaje: 91.0,
            causaDetalle: 'Se objetó inicialmente por presunta falta de autorización previa en el paquete digital.',
            solucionSugeridaIa: 'En la página 2 de la Epicrisis consta la autorización telefónica AUT-2026-99201 emitida por la EPS. Procede levantar la glosa al 100%.',
            sustentoNormativo: 'Resolución 2284 de 2023 Causal AU0101 & Decreto 441 de 2022.',
            fuentesCite: ['Resolución 2284 de 2023', 'Decreto 441 de 2022'],
            borradorRespuestaIa: 'Se levanta la glosa al 100% ($130.000 COP) al verificarse autorización válida AUT-2026-99201 en el expediente clínico.',
            citasSoporte: [
              {
                etiqueta: 'Epicrisis / Autorización (pág. 2)',
                documentoId: 'DOC-8849203-EPI',
                pagina: 2,
                boundingBoxId: 'BB-ESC03-02',
                extractoCita: 'Autorización telefónica EPS: AUT-2026-99201 para valoración por traumatología y ortopedia.'
              }
            ],
            documentosRelacionadosIds: ['DOC-8849203-EPI'],
            estadoGlosa: 'PENDIENTE'
          }
        ],
        soportesDocumentales: [
          { id: 'DOC-8849203-EPI', tipoDocumento: 'EPICRISIS_PDF', nombreArchivo: 'Epicrisis_SOAT.pdf', urlMock: 'assets/soportes/Epicrisis_SOAT.pdf', totalPaginas: 2 }
        ],
        boundingBoxes: [
          {
            id: 'BB-ESC03-01',
            documentoId: 'DOC-8849203-EPI',
            pagina: 1,
            coordenadas: { x: 8.0, y: 46.0, width: 84.0, height: 16.0 },
            textoExtraidoOcr: 'Ingreso por Urgencias derivado de Accidente de Tránsito (Atención SOAT). No consta radicado FURIPS.',
            etiquetaCampo: 'Soporte FURIPS Faltante',
            colorBorde: '#EF4444',
            mensajeHallazgo: 'Formulario FURIPS obligatorio exigido por el Decreto 780 de 2016.'
          },
          {
            id: 'BB-ESC03-02',
            documentoId: 'DOC-8849203-EPI',
            pagina: 2,
            coordenadas: { x: 8.0, y: 55.0, width: 84.0, height: 14.0 },
            textoExtraidoOcr: 'Autorización telefónica EPS: AUT-2026-99201 para valoración por traumatología y ortopedia.',
            etiquetaCampo: 'Autorización Ubicada',
            colorBorde: '#10B981',
            mensajeHallazgo: 'Autorización intrahospitalaria de urgencias confirmada en folio.'
          }
        ],
        explicacionIaRag: {
          resumenEjecutivo: 'Identificada falta de FURIPS en evento de tránsito ($280.000 COP) y confirmada autorización médica para la interconsulta ($130.000 COP).',
          sustentoNormativo: 'Decreto 780 de 2016 & Res. 2284/2023 Anexo 3.',
          fuentesCite: ['Decreto 780 de 2016', 'Resolución 2284 de 2023']
        }
      },

      // ----------------------------------------------------------------------
      // ESC-04: CUV Ausente (Rechazo Inmediato Res. 0948/2026 Art. 3.1)
      // ----------------------------------------------------------------------
      {
        id: 'ESC-04',
        nur: null,
        loteId: 'LOTE-2026-10-0089',
        fevNumero: 'FEV-771920',
        cuv: null,
        cufe: 'f8d1c33298fa1c149afbf4c8996fb92427ae41e4649b934ca495991b7852a112',
        prestador: {
          nit: '890399120-4',
          nombre: 'Clínica Versalles S.A.',
          codigoHabilitation: '760010189001',
          sede: 'Sede Norte - Cali'
        },
        paciente: {
          tipoDocumento: 'CC',
          numeroDocumento: '31.890.112',
          nombreCompleto: 'Martha Cecilia Gómez Pardo',
          edad: 44,
          sexo: 'F',
          planAfiliacion: 'Contributivo - Beneficiaria'
        },
        diagnosticoPrincipal: {
          codigoCie10: 'N201',
          descripcion: 'Cálculo del uréter'
        },
        fechas: {
          fechaIngreso: '2026-10-18T10:00:00-05:00',
          fechaEgreso: '2026-10-18T20:30:00-05:00',
          fechaRadicacion: '2026-10-31T09:00:00-05:00',
          fechaVencimientoLegal: null
        },
        semaforo: {
          diasHabilesRestantes: 0,
          nivelRiesgo: 'ROJO',
          colorHex: '#EF4444',
          mensajeNormativo: 'RECHAZO SIN NUR: Paquete sin CUV expedido por MinSalud (Res. 0948 de 2026 art. 3.1).'
        },
        resumenFinanciero: {
          valorFacturadoCop: 3850000.0,
          valorTarifaPactadaCop: 0.0,
          valorGlosaSugeridaCop: 3850000.0,
          valorAprobadoSugeridoCop: 0.0
        },
        estadoAuditoria: 'RECHAZO_SIN_NUR',
        tipoResultadoPredictivo: 'RECHAZO_NORMATIVO',
        confianzaIaPorcentaje: 100.0,
        causalGlosa: {
          codigoManualUnico: 'DE0000',
          codigoRes3047: '000',
          familia: 'RECHAZO_RADICACION',
          descripcion: 'Rechazo de radicación por falta de CUV obligatorio'
        },
        itemsFacturados: [],
        glosasFactura: [
          {
            id: 'GL-01',
            lineaItem: 1,
            codigoCups: 'DE0000',
            descripcionItem: 'Expediente electrónico sin CUV MinSalud',
            tituloCorto: 'Rechazo de radicación en ventanilla por falta de CUV',
            causal: {
              codigoManualUnico: 'DE0000',
              codigoRes3047: '000',
              familia: 'RECHAZO_RADICACION',
              descripcion: 'CUV ausente ante Mecanismo Único de MinSalud'
            },
            valorFacturadoItemCop: 3850000.0,
            valorTarifaPactadaItemCop: 0.0,
            valorGlosaInicialCop: 3850000.0,
            valorGlosaSugeridaIaCop: 3850000.0,
            valorGlosaDefinitivaCop: 3850000.0,
            veredictoIa: 'RATIFICAR_TOTAL',
            confianzaIaPorcentaje: 100.0,
            causaDetalle: 'Resolución 0948 de 2026: Prohibición expresa de radicar paquetes sin CUV previo y validado.',
            solucionSugeridaIa: 'Generar constancia de rechazo inmediato. No se generan radicados ni corren términos para la EPS.',
            sustentoNormativo: 'Resolución 0948 de 2026 Art. 3.1.',
            fuentesCite: ['Resolución 0948 de 2026'],
            borradorRespuestaIa: 'Expediente no radicado por falta de CUV válido ante MinSalud.',
            citasSoporte: [],
            documentosRelacionadosIds: ['DOC-8849204-XML'],
            estadoGlosa: 'PENDIENTE'
          }
        ],
        soportesDocumentales: [
          { id: 'DOC-8849204-XML', tipoDocumento: 'FEV_XML', nombreArchivo: 'FEV-771920.xml', urlMock: 'assets/soportes/FEV-771920.xml', totalPaginas: 1 }
        ],
        boundingBoxes: [],
        explicacionIaRag: {
          resumenEjecutivo: 'Resolución 0948 de 2026: Prohibición expresa de radicar paquetes sin CUV previo y validado ante MinSalud.',
          sustentoNormativo: 'Resolución 0948 de 2026 Art. 3.1.',
          fuentesCite: ['Resolución 0948 de 2026 Art. 3.1']
        },
        motivoRechazoSinNur: {
          causal: 'FALTA_CUV_MINSALUD',
          norma: 'Res. 0948/2026 Art. 3.1',
          detalle: 'No coincide el CUV con los registros del validador MinSalud. No se genera radicado ni corren términos.',
          constanciaPdfMock: 'CONSTANCIA_RECHAZO_FEV771920.pdf',
          fechaRechazo: '2026-10-31T09:05:00-05:00'
        }
      },

      // ----------------------------------------------------------------------
      // ESC-05: Devolución 5-5-5 (Res. 2284 Art. 6)
      // ----------------------------------------------------------------------
      {
        id: 'ESC-05',
        nur: 'NUR-2026-9932140',
        loteId: 'LOTE-2026-10-0044',
        fevNumero: 'FEV-441209',
        cuv: 'CUV-9001234567-20261026-441209',
        cufe: 'b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef12',
        prestador: {
          nit: '900123456-7',
          nombre: 'Centro Médico Farallones S.A.S.',
          codigoHabilitation: '760010998801',
          sede: 'Sede Sur - Cali'
        },
        paciente: {
          tipoDocumento: 'CC',
          numeroDocumento: '16.789.432',
          nombreCompleto: 'Carlos Andrés Bermúdez Soto',
          edad: 38,
          sexo: 'M',
          planAfiliacion: 'Contributivo - Cotizante'
        },
        diagnosticoPrincipal: {
          codigoCie10: 'M545',
          descripcion: 'Lumbago no especificado'
        },
        fechas: {
          fechaIngreso: '2026-10-25T08:00:00-05:00',
          fechaEgreso: '2026-10-25T11:30:00-05:00',
          fechaRadicacion: '2026-10-27T14:20:00-05:00',
          fechaVencimientoLegal: '2026-11-04T23:59:59-05:00'
        },
        semaforo: {
          diasHabilesRestantes: 2,
          nivelRiesgo: 'ROJO',
          colorHex: '#EF4444',
          mensajeNormativo: 'Resolución 2284 de 2023: Ciclo taxativo de devoluciones 5-5-5 y preclusión formal de términos'
        },
        resumenFinanciero: {
          valorFacturadoCop: 850000.0,
          valorTarifaPactadaCop: 0.0,
          valorGlosaSugeridaCop: 850000.0,
          valorAprobadoSugeridoCop: 0.0
        },
        estadoAuditoria: 'DEVOLUCION_FORMULADA',
        tipoResultadoPredictivo: 'RECHAZO_NORMATIVO',
        confianzaIaPorcentaje: 98.5,
        causalGlosa: {
          codigoManualUnico: 'DE4401',
          codigoRes3047: '104',
          familia: 'DEVOLUCIONES',
          descripcion: 'El prestador no hace parte de la red de la EPS o contrato no vigente'
        },
        itemsFacturados: [
          {
            linea: 1,
            codigoCups: '890201',
            descripcionCups: 'Consulta Médica Especializada Fisiatría',
            cantidad: 1,
            valorFacturadoCop: 150000.0,
            valorTarifaPactadaCop: 0.0,
            valorGlosaSugeridaCop: 150000.0,
            estadoItem: 'GLOSADO_SUGERIDO',
            observacionIa: 'Contrato expirado.'
          }
        ],
        glosasFactura: [
          {
            id: 'GL-01',
            lineaItem: 1,
            codigoCups: '890201',
            descripcionItem: 'Consulta y Terapias Fisiatría',
            tituloCorto: 'Causal Taxativa DE4401 - Contrato Vencido',
            causal: {
              codigoManualUnico: 'DE4401',
              codigoRes3047: '104',
              familia: 'DEVOLUCIONES',
              descripcion: 'Contrato no vigente con la EPS'
            },
            valorFacturadoItemCop: 850000.0,
            valorTarifaPactadaItemCop: 0.0,
            valorGlosaInicialCop: 850000.0,
            valorGlosaSugeridaIaCop: 850000.0,
            valorGlosaDefinitivaCop: 850000.0,
            veredictoIa: 'RATIFICAR_TOTAL',
            confianzaIaPorcentaje: 98.5,
            causaDetalle: 'Resolución 2284 de 2023: Ciclo taxativo de devoluciones 5-5-5 y preclusión formal de términos.',
            solucionSugeridaIa: 'Formular devolución antes de preclusión en día 5 hábil.',
            sustentoNormativo: 'Resolución 2284 de 2023 Art. 6.',
            fuentesCite: ['Resolución 2284 de 2023 Art. 6'],
            borradorRespuestaIa: 'Devolución formulada bajo causal DE4401 por terminación de contrato.',
            citasSoporte: [],
            documentosRelacionadosIds: ['DOC-9932140-CTR'],
            estadoGlosa: 'PENDIENTE'
          }
        ],
        soportesDocumentales: [
          { id: 'DOC-9932140-CTR', tipoDocumento: 'CONTRATO_PDF', nombreArchivo: 'Contrato_Farallones.pdf', urlMock: 'assets/soportes/Contrato_Farallones.pdf', totalPaginas: 3 }
        ],
        boundingBoxes: [],
        explicacionIaRag: {
          resumenEjecutivo: 'Resolución 2284 de 2023: Ciclo taxativo de devoluciones 5-5-5 y preclusión formal de términos.',
          sustentoNormativo: 'Resolución 2284 de 2023 Art. 6.',
          fuentesCite: ['Resolución 2284 de 2023 Art. 6']
        },
        devolucion5Dias: {
          causalDe: 'DE4401',
          fechaLimiteDevolucion: '2026-11-04T23:59:59-05:00',
          diasHabilesRestantesDevolucion: 2,
          precluida: false,
          causalDescripcion: 'Contrato no vigente con la EPS'
        }
      },

      // ----------------------------------------------------------------------
      // ESC-06: Aceptación Tácita Ley 1438 (20 Días Perimidos)
      // ----------------------------------------------------------------------
      {
        id: 'ESC-06',
        nur: 'NUR-2026-6612098',
        loteId: 'LOTE-2026-09-0031',
        fevNumero: 'FEV-110298',
        cuv: 'CUV-8903990012-20260925-110298',
        cufe: 'aa11bb22cc33dd44ee55ff6600112233445566778899aabbccddeeff00112233',
        prestador: {
          nit: '890399001-2',
          nombre: 'Hospital Universitario del Valle Evaristo García',
          codigoHabilitation: '760010001201',
          sede: 'Sede Principal - Cali'
        },
        paciente: {
          tipoDocumento: 'CC',
          numeroDocumento: '66.920.451',
          nombreCompleto: 'Rosa Elena Valencia Caicedo',
          edad: 61,
          sexo: 'F',
          planAfiliacion: 'Contributivo - Cotizante'
        },
        diagnosticoPrincipal: {
          codigoCie10: 'I10X',
          descripcion: 'Hipertensión esencial (primaria)'
        },
        fechas: {
          fechaIngreso: '2026-09-20T08:00:00-05:00',
          fechaEgreso: '2026-09-20T17:00:00-05:00',
          fechaRadicacion: '2026-09-28T10:15:00-05:00',
          fechaVencimientoLegal: '2026-10-27T23:59:59-05:00'
        },
        semaforo: {
          diasHabilesRestantes: 0,
          nivelRiesgo: 'VERDE',
          colorHex: '#EAB308',
          mensajeNormativo: 'Ley 1438 de 2011 Art. 57 y Decreto 441 de 2022 Art. 2.5.3.4.4.4: Título Valor por Aceptación Tácita tras 20 días hábiles'
        },
        resumenFinanciero: {
          valorFacturadoCop: 2150000.0,
          valorTarifaPactadaCop: 2150000.0,
          valorGlosaSugeridaCop: 0.0,
          valorAprobadoSugeridoCop: 2150000.0
        },
        estadoAuditoria: 'FACTURA_ACEPTADA_TACITA',
        tipoResultadoPredictivo: 'APROBADO_DIRECTO',
        confianzaIaPorcentaje: 100.0,
        causalGlosa: {
          codigoManualUnico: 'AC0000',
          codigoRes3047: '000',
          familia: 'ACEPTACION_TACITA',
          descripcion: 'Factura aceptada tácitamente por preclusión de términos'
        },
        itemsFacturados: [
          {
            linea: 1,
            codigoCups: '890201',
            descripcionCups: 'Consulta Medicina Interna Control Especializado',
            cantidad: 1,
            valorFacturadoCop: 150000.0,
            valorTarifaPactadaCop: 150000.0,
            valorGlosaSugeridaCop: 0.0,
            estadoItem: 'CONFORME',
            observacionIa: 'Aceptación tácita legal.'
          }
        ],
        glosasFactura: [
          {
            id: 'GL-01',
            lineaItem: 1,
            codigoCups: '890201',
            descripcionItem: 'Factura Completa Aceptada Tácitamente',
            tituloCorto: 'Ley 1438 de 2011 Art. 57 - Título Valor por Aceptación Tácita tras 20 días hábiles',
            causal: {
              codigoManualUnico: 'AC0000',
              codigoRes3047: '000',
              familia: 'ACEPTACION_TACITA',
              descripcion: 'Aceptación tácita por perención de términos'
            },
            valorFacturadoItemCop: 2150000.0,
            valorTarifaPactadaItemCop: 2150000.0,
            valorGlosaInicialCop: 0.0,
            valorGlosaSugeridaIaCop: 0.0,
            valorGlosaDefinitivaCop: 0.0,
            veredictoIa: 'APROBAR_ITEM',
            confianzaIaPorcentaje: 100.0,
            causaDetalle: 'Ley 1438 de 2011 Art. 57 y Decreto 441 de 2022 Art. 2.5.3.4.4.4: Título Valor por Aceptación Tácita tras 20 días hábiles sin formulación de glosa.',
            solucionSugeridaIa: 'Despachar orden de pago ejecutiva a tesorería EPS.',
            sustentoNormativo: 'Ley 1438 de 2011 Art. 57 y Decreto 441 de 2022.',
            fuentesCite: ['Ley 1438 de 2011 Art. 57'],
            borradorRespuestaIa: 'Título Valor constituido por ministerio de la ley.',
            citasSoporte: [],
            documentosRelacionadosIds: ['DOC-6612098-TV'],
            estadoGlosa: 'RESUELTA',
            decisionAplicada: {
              tipo: 'ACEPTADA_IA',
              etiqueta: 'Título Valor Ejecutivo',
              valorFinalGlosaCop: 0,
              argumentoFinal: 'Aceptación tácita legal por perención de 20 días hábiles.',
              auditor: 'Dr. Juan Martínez',
              timestamp: '2026-10-28T08:00:00-05:00'
            }
          }
        ],
        soportesDocumentales: [
          { id: 'DOC-6612098-TV', tipoDocumento: 'CERTIFICADO_TITULO_VALOR', nombreArchivo: 'Certificado_Titulo_Valor.pdf', urlMock: 'assets/soportes/TituloValor.pdf', totalPaginas: 1 }
        ],
        boundingBoxes: [],
        explicacionIaRag: {
          resumenEjecutivo: 'Ley 1438 de 2011 Art. 57 y Decreto 441 de 2022 Art. 2.5.3.4.4.4: Título Valor por Aceptación Tácita tras 20 días hábiles.',
          sustentoNormativo: 'Ley 1438 de 2011 Art. 57.',
          fuentesCite: ['Ley 1438 de 2011 Art. 57']
        },
        aceptacionTacitaLey1438: {
          fechaRadicacion: '2026-09-28T10:15:00-05:00',
          diasHabilesTranscurridos: 22,
          fechaPerencion20Dias: '2026-10-27T23:59:59-05:00',
          tituloValorNumero: 'TV-SOS-2026-009941',
          estadoDespachoPago: 'LISTO_PARA_PAGO'
        }
      }
    ];

    this.casos.set(casosSemilla);
    this.seleccionarCaso('ESC-02');
  }
}
