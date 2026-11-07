import { Component, OnInit, Signal, signal, computed, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
// COMPONENTE ANGULAR 19+ STANDALONE: SPLIT SCREEN AUDIT-AI
// ==============================================================================

@Component({
  selector: 'app-split-screen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'block h-full min-h-0 flex-1 overflow-hidden' },
  template: `
    <!-- CONTENEDOR PRINCIPAL DEL SPLIT SCREEN DE AUDITORÍA -->
    <div class="h-full min-h-0 w-full flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden select-none">

      <section class="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 z-10">
        <!-- Datos de Identificación FEV / NUR / CUV -->
        <div class="flex items-center flex-wrap gap-2 text-xs font-mono">
          <div class="bg-slate-50 px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1.5">
            <span class="text-slate-500">Factura:</span>
            <span class="text-[var(--color-brand)] font-bold text-sm">{{ casoActivo().fevNumero }}</span>
          </div>

          <div class="bg-slate-50 px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1.5">
            <span class="text-slate-500">NUR:</span>
            <span *ngIf="casoActivo().nur" class="text-slate-800" [title]="casoActivo().nur || ''">{{ casoActivo().nur }}</span>
            <span *ngIf="!casoActivo().nur" class="text-red-700 font-bold bg-red-50 px-1 rounded border border-red-200">SIN NUR (NO RADICADO)</span>
          </div>

          <div class="bg-slate-50 px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1.5 max-w-xs truncate">
            <span class="text-slate-500">CUV:</span>
            <span *ngIf="casoActivo().cuv" class="text-emerald-700 truncate" [title]="casoActivo().cuv || ''">{{ casoActivo().cuv }}</span>
            <span *ngIf="!casoActivo().cuv" class="text-red-700 font-bold">AUSENTE / INVÁLIDO</span>
          </div>
          <span class="demo-us-label text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono font-bold">US-11</span>
        </div>

        <!-- Semáforo Dinámico de Términos Legales (Res. 2284 & Ley 1438) -->
        <div class="flex items-center gap-3">
          <div [class]="obtenerEstiloSemaforoBadge(casoActivo().semaforo.nivelRiesgo)" class="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-md">
            <span class="w-2.5 h-2.5 rounded-full animate-ping" [style.backgroundColor]="casoActivo().semaforo.colorHex"></span>
            <span *ngIf="casoActivo().estadoAuditoria === 'RECHAZO_SIN_NUR'">Rechazo Inmediato Res. 0948 (Sin Términos)</span>
            <span *ngIf="casoActivo().estadoAuditoria === 'FACTURA_ACEPTADA_TACITA'">Aceptada Tácita (20 Días Perimidos)</span>
            <span *ngIf="casoActivo().estadoAuditoria === 'DEVOLUCION_FORMULADA'">Ciclo 5 Días Devolución: {{ casoActivo().semaforo.diasHabilesRestantes }} días restantes</span>
            <span *ngIf="casoActivo().estadoAuditoria !== 'RECHAZO_SIN_NUR' && casoActivo().estadoAuditoria !== 'FACTURA_ACEPTADA_TACITA' && casoActivo().estadoAuditoria !== 'DEVOLUCION_FORMULADA'">
              Vence en {{ casoActivo().semaforo.diasHabilesRestantes }} días hábiles
            </span>
            <span class="opacity-80">|</span>
            <span class="text-[11px] uppercase font-mono">{{ casoActivo().semaforo.nivelRiesgo }}</span>
          </div>

          <!-- Badge Predictivo IA y Causal (apagado en pertinencia CL si el toggle está off) -->
          <div *ngIf="!ocultarSugerenciaPertinencia()" class="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg flex items-center gap-2 text-xs">
            <span class="text-[var(--color-brand)] font-semibold">Predicción IA:</span>
            <span class="text-slate-800 font-bold uppercase">{{ casoActivo().tipoResultadoPredictivo }}</span>
            <span class="text-slate-500 font-mono text-[11px]">({{ casoActivo().confianzaIaPorcentaje }}% conf.)</span>
          </div>
          <div *ngIf="ocultarSugerenciaPertinencia()" class="bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg flex items-center gap-2 text-xs">
            <span class="text-amber-800 font-semibold">Pertinencia clínica:</span>
            <span class="text-amber-900">sin sugerencia IA — revisión humana obligatoria</span>
          </div>
          <label class="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
            <input type="checkbox" class="rounded border-slate-400"
                   [checked]="sugerirPertinenciaIa()"
                   (change)="onSugerirPertinenciaIa($event)">
            Sugerir pertinencia con IA
          </label>
        </div>
      </section>

      <!-- CUERPO PRINCIPAL DIVIDIDO EN DOS PANELES (50% / 50%) -->
      <main class="flex-1 min-h-0 flex overflow-hidden relative">
        
        <!-- =================================================================== -->
        <!-- PANEL IZQUIERDO: VISOR DOCUMENTAL & BOUNDING BOX OCR (50%) -->
        <!-- =================================================================== -->
        <section class="w-1/2 bg-slate-100 border-r border-slate-200 flex flex-col overflow-hidden min-h-0">
          
          <!-- Pestañas de Documentos Soportes -->
          <div class="h-10 bg-white border-b border-slate-200 px-3 flex items-center justify-between shrink-0">
            <div class="flex items-center space-x-1 overflow-x-auto min-w-0 max-w-[min(100%,52rem)] pr-2">
              <button 
                *ngFor="let doc of casoActivo().soportesDocumentales"
                (click)="seleccionarDocumento(doc.id)"
                [class]="doc.id === documentoActivoId() 
                  ? 'px-3 py-1.5 rounded-t-lg bg-slate-50 text-[var(--color-brand)] border-t-2 border-[var(--color-brand)] text-xs font-semibold flex items-center gap-1.5 shrink-0'
                  : 'px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium flex items-center gap-1.5 shrink-0'"
              >
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V7.5L14.5 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                <span class="truncate max-w-[88px]">{{ doc.nombreArchivo }}</span>
              </button>
            </div>

            <!-- Controles del Visor OCR (Zoom, Bounding Box Toggle) -->
            <div class="flex items-center space-x-2 shrink-0">
              <button 
                (click)="toggleBoundingBoxes()"
                [class]="mostrarBoundingBoxes() 
                  ? 'px-2 py-0.5 rounded text-[11px] bg-red-950 text-red-300 border border-red-800 font-semibold flex items-center gap-1'
                  : 'px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-300'"
              >
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse" *ngIf="mostrarBoundingBoxes()"></span>
                <span>Bounding Box OCR (F03)</span>
              </button>

              <div class="flex items-center bg-slate-100 rounded px-1.5 py-0.5 text-xs text-slate-700 font-mono border border-slate-200">
                <button (click)="cambiarZoom(-10)" class="px-1 hover:text-[var(--color-brand)] font-bold">-</button>
                <span class="px-1.5 text-[11px] text-[var(--color-brand)]">{{ zoomNivel() }}%</span>
                <button (click)="cambiarZoom(10)" class="px-1 hover:text-[var(--color-brand)] font-bold">+</button>
              </div>
            </div>
          </div>

          <!-- Área de Renderizado de Soporte Digital (Canvas Simulado) -->
          <div class="flex-1 bg-slate-200 overflow-auto p-4 flex justify-center relative select-text" id="viewer-container">
            
            <div 
              class="bg-white text-slate-900 rounded shadow-2xl relative transition-transform origin-top duration-150 border border-slate-300"
              [style.width.px]="620"
              [style.minHeight.px]="820"
              [style.transform]="'scale(' + (zoomNivel() / 100) + ')'"
            >
              <!-- Membrete Simulado de Soporte Clínico -->
              <div class="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
                <div>
                  <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wide">{{ casoActivo().prestador.nombre }}</h3>
                  <p class="text-[11px] text-slate-600 font-mono">NIT: {{ casoActivo().prestador.nit }} · Cod. Habilitación: {{ casoActivo().prestador.codigoHabilitation }}</p>
                  <p class="text-[11px] text-slate-600 font-mono">{{ casoActivo().prestador.sede }}</p>
                </div>
                <div class="text-right">
                  <span class="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-mono font-bold uppercase">{{ documentoActivo()?.tipoDocumento }}</span>
                  <p class="text-[10px] text-slate-500 mt-1 font-mono">Folio: 003-2026</p>
                </div>
              </div>

              <!-- Contenido de Texto Clínico Digitalizado (OCR Base) -->
              <div class="p-6 space-y-4 text-xs font-serif leading-relaxed text-slate-800">
                <div class="border-b border-slate-200 pb-2 flex justify-between">
                  <div><strong>Paciente:</strong> {{ casoActivo().paciente.nombreCompleto }}</div>
                  <div><strong>Doc:</strong> {{ casoActivo().paciente.tipoDocumento }} {{ casoActivo().paciente.numeroDocumento }}</div>
                  <div><strong>Edad:</strong> {{ casoActivo().paciente.edad }} años</div>
                </div>

                <div class="bg-amber-50/50 p-2.5 rounded border border-amber-200 text-[11px] font-sans">
                  <span class="font-bold text-amber-900">Diagnóstico Principal:</span>
                  <span class="font-mono font-bold text-amber-900 ml-1">[{{ casoActivo().diagnosticoPrincipal.codigoCie10 }}]</span>
                  <span class="text-amber-800 ml-1">{{ casoActivo().diagnosticoPrincipal.descripcion }}</span>
                </div>

                <!-- Detalle Clínico según el caso -->
                <div [ngSwitch]="casoActivo().id" class="space-y-3 font-mono text-[11px]">
                  <!-- ESC-01 -->
                  <div *ngSwitchCase="'ESC-01'" class="space-y-2">
                    <p class="font-bold text-slate-900">RESUMEN DE ATENCIÓN QUIRÚRGICA:</p>
                    <p>Paciente ingresa para colecistectomía laparoscópica programada. Sin complicaciones intraoperatorias. Procedimiento concluido satisfactoriamente con tiempos quirúrgicos estándar.</p>
                    <p class="text-slate-600">CUPS 471110 - Colecistectomía laparoscópica. Tarifa pactada en contrato SOAT 2026 + 5%.</p>
                  </div>

                  <!-- ESC-02 -->
                  <div *ngSwitchCase="'ESC-02'" class="space-y-2">
                    <p class="font-bold text-slate-900">RESUMEN ATENCIÓN URGENCIAS Y LIQUIDACIÓN TARIFARIA:</p>
                    <p>Ingreso por urgencias con dolor abdominal agudo en fosa ilíaca derecha. Valoración por medicina general e interconsulta quirúrgica.</p>
                    <p class="bg-red-50 p-2 border border-red-200 rounded text-red-950 font-bold">
                      ORDEN #9941: CUPS 890201 Consulta Medicina General Urgencias. Valor liquidado en factura: $85.000 COP.
                    </p>
                    <p class="text-slate-600">Nota de auditoría: Contrato CTR-2026-SOS-SANVICENTE establece tarifa base de $65.000 COP para consulta de urgencias primer nivel.</p>
                  </div>

                  <!-- ESC-03 -->
                  <div *ngSwitchCase="'ESC-03'" class="space-y-2">
                    <p class="font-bold text-slate-900">INFORME DE ATENCIÓN POR TRAUMA Y PÓLIZA:</p>
                    <p>Paciente ingresa tras accidente de tránsito en calidad de acompañante de motocicleta.</p>
                    <p class="bg-amber-50 p-2 border border-amber-200 rounded text-amber-950 font-bold">
                      Se realizan exámenes de perfil de trauma ($280.000 COP). Atención marcada con afectación SOAT/ECAT. No consta formulario FURIPS diligenciado en el paquete digital radicado.
                    </p>
                  </div>

                  <!-- ESC-04: CUV AUSENTE -->
                  <div *ngSwitchCase="'ESC-04'" class="space-y-2">
                    <div class="bg-red-100 p-3 border-2 border-red-500 rounded text-red-900 font-sans">
                      <p class="font-bold text-sm uppercase">⛔ EXPEDIENTE ELECTRÓNICO RECHAZADO EN VENTANILLA DE ENTRADA</p>
                      <p class="text-xs mt-1">El documento FEV-771920 carece del Código Único de Validación (CUV) obligatorio ante el Mecanismo Único de MinSalud.</p>
                      <p class="text-[11px] font-mono mt-2 bg-white/70 p-1.5 rounded">Res. 0948 de 2026 Art. 3.1: "Las entidades no generarán radicación ni correrán términos sin el CUV previo y validado."</p>
                    </div>
                  </div>

                  <!-- ESC-05: DEVOLUCIÓN 5-5-5 -->
                  <div *ngSwitchCase="'ESC-05'" class="space-y-2">
                    <p class="font-bold text-slate-900">AUDITORÍA CONTRACTUAL Y HABILITACIÓN DE RED:</p>
                    <p>Facturación de consulta y terapias ambulatorias por dolor lumbar.</p>
                    <p class="bg-amber-100 p-2 border border-amber-300 rounded text-amber-950 font-bold">
                      HALLAZGO: Contrato relacionado CTR-2025-099 finalizó su vigencia el 31-DIC-2025. Causal DE4401 taxativa.
                    </p>
                    <p class="text-slate-600">Resolución 2284 Art. 6: Se formula devolución antes de preclusión en día 5 hábil.</p>
                  </div>

                  <!-- ESC-06: ACEPTACIÓN TÁCITA LEY 1438 -->
                  <div *ngSwitchCase="'ESC-06'" class="space-y-2">
                    <div class="bg-emerald-50 p-3 border-2 border-emerald-500 rounded text-emerald-950 font-sans">
                      <p class="font-bold text-sm uppercase">📜 FACTURA ACEPTADA TÁCITAMENTE - TÍTULO VALOR EJECUTIVO</p>
                      <p class="text-xs mt-1">Han transcurrido 22 días hábiles posteriores a la radicación sin notificación de glosa objetada por la EPS.</p>
                      <p class="text-[11px] font-mono mt-2 bg-emerald-100 p-1.5 rounded">Ley 1438/2011 Art. 57 & Dec. 441/2022: Plazo perimido de 20 días hábiles. Título Valor ejecutivo listo para cobro coactivo o giro directo.</p>
                    </div>
                  </div>
                </div>

                <div class="pt-8 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500 font-sans">
                  <div>
                    <p class="font-bold text-slate-700">Dr. Roberto Gómez Henao</p>
                    <p>Médico Cirujano Audit-AI · RM-10928-ANT</p>
                  </div>
                  <div>Página 1 de 1</div>
                </div>
              </div>

              <!-- LAYER DE BOUNDING BOXES (RESALTADO FLOTANTE F03) -->
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
                  <!-- Badge Flotante del Bounding Box -->
                  <div 
                    class="absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-sans font-bold text-white shadow flex items-center gap-1 shrink-0 whitespace-nowrap"
                    [style.backgroundColor]="bb.colorBorde"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <span>{{ bb.etiquetaCampo }}</span>
                  </div>

                  <!-- Tooltip de Evidencia OCR al hacer hover -->
                  <div class="hidden group-hover:block absolute top-full left-0 mt-1 w-72 bg-slate-900 text-slate-100 p-2.5 rounded-lg shadow-2xl border border-slate-700 text-[11px] font-sans z-30 leading-tight">
                    <p class="font-bold text-amber-400 mb-1">{{ bb.mensajeHallazgo }}</p>
                    <p class="text-slate-300 font-mono text-[10px] bg-slate-950 p-1 rounded border border-slate-800">"{{ bb.textoExtraidoOcr }}"</p>
                  </div>
                </div>
              </ng-container>

            </div>
          </div>
        </section>

        <!-- =================================================================== -->
        <!-- PANEL DERECHO: COMPARADOR FINANCIERO E IA / HUMAN-IN-THE-LOOP (50%) -->
        <!-- =================================================================== -->
        <section class="w-1/2 bg-white flex flex-col overflow-hidden min-h-0">
          <div class="flex-1 min-h-0 overflow-y-auto">
          <!-- FICHA DEL PACIENTE Y RESUMEN FINANCIERO -->
          <div class="p-4 bg-white border-b border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{{ casoActivo().paciente.nombreCompleto }}</span>
                  <span class="text-xs font-mono font-normal text-slate-500">({{ casoActivo().paciente.tipoDocumento }} {{ casoActivo().paciente.numeroDocumento }})</span>
                </h2>
                <p class="text-xs text-slate-500 font-sans">
                  <span>{{ casoActivo().paciente.planAfiliacion }}</span>
                  <span class="mx-1.5">•</span>
                  <span>Dx: <strong class="text-slate-800">{{ casoActivo().diagnosticoPrincipal.codigoCie10 }} - {{ casoActivo().diagnosticoPrincipal.descripcion }}</strong></span>
                </p>
              </div>

              <!-- Badge de Estado de Auditoría -->
              <div [ngSwitch]="casoActivo().estadoAuditoria">
                <span *ngSwitchCase="'PENDIENTE'" class="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold font-mono">
                  PENDIENTE DE REVISIÓN
                </span>
                <span *ngSwitchCase="'GLOSADA_NOTIFICADA'" class="px-3 py-1 rounded-full bg-red-950 text-red-300 border border-red-800 text-xs font-bold font-mono">
                  GLOSA NOTIFICADA (RM)
                </span>
                <span *ngSwitchCase="'APROBADA_NOTIFICADA'" class="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold font-mono">
                  APROBADA DIRECTA
                </span>
                <span *ngSwitchCase="'SOBREESCRITO_FORENSE'" class="px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold font-mono">
                  SOBREESCRITO FORENSE
                </span>
                <span *ngSwitchCase="'RECHAZO_SIN_NUR'" class="px-3 py-1 rounded-full bg-red-900 text-white border border-red-600 text-xs font-bold font-mono shadow-lg shadow-red-900/50">
                  RECHAZO SIN NUR (RES. 0948)
                </span>
                <span *ngSwitchCase="'DEVOLUCION_FORMULADA'" class="px-3 py-1 rounded-full bg-orange-950 text-orange-300 border border-orange-800 text-xs font-bold font-mono">
                  DEVOLUCIÓN FORMULADA (5 DÍAS)
                </span>
                <span *ngSwitchCase="'DEVOLUCION_PRECLUIDA'" class="px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 text-xs font-bold font-mono">
                  DEVOLUCIÓN PRECLUIDA (DÍA 6)
                </span>
                <span *ngSwitchCase="'DEVOLUCION_CONTROVERTIDA'" class="px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-bold font-mono">
                  CONTROVERSIA IPS (RE9601)
                </span>
                <span *ngSwitchCase="'FACTURA_ACEPTADA_TACITA'" class="px-3 py-1 rounded-full bg-yellow-950 text-yellow-300 border border-yellow-600 text-xs font-bold font-mono shadow-md">
                  ★ ACEPTACIÓN TÁCITA (LEY 1438)
                </span>
              </div>
            </div>

            <!-- Grilla KPI Financiera 4 Tarjetas -->
            <div class="grid grid-cols-4 gap-2 pt-1">
              <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                <p class="text-[10px] text-slate-500 font-semibold uppercase">Facturado COP</p>
                <p class="text-sm font-bold text-slate-900 font-mono mt-0.5"><span>$</span>{{ casoActivo().resumenFinanciero.valorFacturadoCop | number:'1.0-0' }}</p>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                <p class="text-[10px] text-slate-500 font-semibold uppercase">Tarifa Base Pactada</p>
                <p class="text-sm font-bold text-[var(--color-brand)] font-mono mt-0.5"><span>$</span>{{ casoActivo().resumenFinanciero.valorTarifaPactadaCop | number:'1.0-0' }}</p>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                <p class="text-[10px] text-slate-500 font-semibold uppercase">Glosa Sugerida IA</p>
                <p class="text-sm font-bold text-red-600 font-mono mt-0.5"><span>$</span>{{ casoActivo().resumenFinanciero.valorGlosaSugeridaCop | number:'1.0-0' }}</p>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                <p class="text-[10px] text-slate-500 font-semibold uppercase">Aprobado Sugerido</p>
                <p class="text-sm font-bold text-emerald-700 font-mono mt-0.5"><span>$</span>{{ casoActivo().resumenFinanciero.valorAprobadoSugeridoCop | number:'1.0-0' }}</p>
              </div>
            </div>
          </div>

          <!-- TABLA COMPARATIVA DE ÍTEMS CUPS FACTURADOS VS TARIFARIO -->
          <div class="p-4 border-b border-slate-200 space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Desglose por Línea de Servicio (F04)</span>
              <span class="text-[11px] text-slate-500 font-mono font-normal">{{ casoActivo().itemsFacturados.length }} Ítems evaluados</span>
            </h3>

            <div class="overflow-x-auto rounded-lg border border-slate-200">
              <table class="w-full text-left text-xs font-sans">
                <thead class="bg-slate-50 text-slate-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th class="p-2">Lín</th>
                    <th class="p-2">CUPS</th>
                    <th class="p-2">Descripción</th>
                    <th class="p-2 text-right">Facturado</th>
                    <th class="p-2 text-right">Pactado</th>
                    <th class="p-2 text-right">Glosa Sug.</th>
                    <th class="p-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white font-mono">
                  <tr *ngFor="let item of casoActivo().itemsFacturados" [class]="item.estadoItem === 'GLOSADO_SUGERIDO' ? 'bg-red-50' : ''">
                    <td class="p-2 text-slate-500">{{ item.linea }}</td>
                    <td class="p-2 font-bold text-[var(--color-brand)]">{{ item.codigoCups }}</td>
                    <td class="p-2 text-slate-700 font-sans text-[11px] max-w-[180px] truncate" [title]="item.descripcionCups">{{ item.descripcionCups }}</td>
                    <td class="p-2 text-right text-slate-900"><span>$</span>{{ item.valorFacturadoCop | number:'1.0-0' }}</td>
                    <td class="p-2 text-right text-slate-500"><span>$</span>{{ item.valorTarifaPactadaCop | number:'1.0-0' }}</td>
                    <td class="p-2 text-right font-bold text-red-400"><span>$</span>{{ item.valorGlosaSugeridaCop | number:'1.0-0' }}</td>
                    <td class="p-2 text-center">
                      <span *ngIf="item.estadoItem === 'CONFORME'" class="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">OK</span>
                      <span *ngIf="item.estadoItem === 'GLOSADO_SUGERIDO'" class="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold animate-pulse">GLOSA</span>
                    </td>
                  </tr>
                  <tr *ngIf="casoActivo().itemsFacturados.length === 0">
                    <td colspan="7" class="p-4 text-center text-slate-500 text-xs">Sin líneas procesables en este estado.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- MOTOR COGNITIVO RAG Y HALLAZGO NORMATIVO -->
          <div class="p-4 border-b border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--color-brand)] flex items-center gap-1.5">
                <svg class="w-4 h-4 text-[var(--color-brand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                <span>Explicabilidad Normativa RAG<span class="demo-us-label"> (US-14)</span></span>
              </h3>

              <div *ngIf="casoActivo().causalGlosa" class="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-800">
                Causal: <strong class="text-slate-900">{{ casoActivo().causalGlosa?.codigoManualUnico }}</strong> (Res. 3047: {{ casoActivo().causalGlosa?.codigoRes3047 }})
              </div>
            </div>

            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs font-sans">
              <p class="text-slate-800 leading-relaxed font-medium">{{ casoActivo().explicacionIaRag.resumenEjecutivo }}</p>
              
              <div class="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                <span class="font-bold text-[var(--color-brand)]">Sustento Legal:</span>
                <p class="mt-0.5 text-slate-700 font-mono">{{ casoActivo().explicacionIaRag.sustentoNormativo }}</p>
              </div>

              <div class="flex flex-wrap gap-1.5 pt-1">
                <span *ngFor="let cite of casoActivo().explicacionIaRag.fuentesCite" class="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 text-[10px] font-mono border border-indigo-800/60">
                  📜 {{ cite }}
                </span>
              </div>
            </div>
          </div>
          </div>

          <!-- =================================================================== -->
          <!-- SECCIÓN HITL: CONTROL CONDICIONAL SEGÚN ESTADO NORMATIVO -->
          <!-- =================================================================== -->
          <div class="p-4 bg-white shrink-0 border-t-2 border-[var(--color-brand)] space-y-3 sticky bottom-0 z-30 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
            
            <!-- CASO 1: RECHAZO SIN NUR (ESC-04 / RES. 0948 ART 3.1) -->
            <div *ngIf="casoActivo().estadoAuditoria === 'RECHAZO_SIN_NUR'" class="bg-red-50 p-4 rounded-xl border border-red-200 space-y-3">
              <div class="flex items-center gap-2 text-red-800 font-bold text-xs uppercase">
                <svg class="w-5 h-5 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
                <span>Acción Bloqueada: Paquete no radicado legalmente</span>
              </div>
              <p class="text-xs text-red-800">
                La factura fue devuelta en ventanilla por carecer del Código Único de Validación (CUV). De acuerdo con la Resolución 0948 de 2026, no se genera radicado NUR ni inician los términos de glosa.
              </p>
              <button 
                (click)="descargarConstanciaRechazo()"
                class="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow flex items-center justify-center gap-2 transition"
              >
                <span>📄 Descargar Constancia de Rechazo Inmediato (PDF)</span>
              </button>
            </div>

            <!-- CASO 2: CICLO DEVOLUCIÓN 5-5-5 (ESC-05 / RES. 2284 ART 6) -->
            <div *ngIf="casoActivo().estadoAuditoria === 'DEVOLUCION_FORMULADA'" class="bg-orange-50 p-4 rounded-xl border border-orange-200 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-orange-300 uppercase">Ciclo de Devolución 5-5-5 en Curso:</span>
                <span class="px-2 py-0.5 rounded bg-orange-900 text-orange-200 font-mono text-[11px]">2 días hábiles restantes</span>
              </div>
              <p class="text-xs text-slate-300">
                La EPS formuló devolución bajo la causal taxativa <strong>DE4401</strong> (Contrato expirado). La IPS dispone de 5 días para aceptar o controvertir.
              </p>
              <div class="grid grid-cols-3 gap-2">
                <button 
                  (click)="simularRespuestaIps('RE9701')"
                  class="py-2 px-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold"
                  title="Aceptar causal con Nota Crédito y nuevo NUR"
                >
                  IPS RE9701 (Aceptar)
                </button>
                <button 
                  (click)="simularRespuestaIps('RE9601')"
                  class="py-2 px-2 rounded bg-indigo-700 hover:bg-indigo-600 text-white text-[11px] font-bold"
                  title="Controvertir causal manteniendo mismo NUR"
                >
                  IPS RE9601 (Controvertir)
                </button>
                <button 
                  (click)="simularPreclusionDevolucion()"
                  class="py-2 px-2 rounded bg-red-800 hover:bg-red-700 text-white text-[11px] font-bold"
                  title="Simular paso al Día 6 para precluir devolución"
                >
                  Simular Día 6 (Precluir)
                </button>
              </div>
            </div>

            <!-- CASO 2.1: DEVOLUCIÓN PRECLUIDA -->
            <div *ngIf="casoActivo().estadoAuditoria === 'DEVOLUCION_PRECLUIDA'" class="bg-red-50 p-4 rounded-xl border border-red-200 space-y-2">
              <span class="text-xs font-bold text-red-800 flex items-center gap-1.5">
                ⛔ PRECLUSIÓN LEGAL DE LA DEVOLUCIÓN (DÍA 6 HÁBIL SUPERADO)
              </span>
              <p class="text-xs text-slate-700">
                Vencido el término perentorio de 5 días hábiles (Res. 2284 art. 6), la EPS perdió la facultad de devolver la factura. La cuenta debe ser tramitada mediante auditoría ordinaria con glosas.
              </p>
            </div>

            <!-- CASO 2.2: DEVOLUCIÓN CONTROVERTIDA -->
            <div *ngIf="casoActivo().estadoAuditoria === 'DEVOLUCION_CONTROVERTIDA'" class="p-4 rounded-xl border space-y-2" style="background-color: color-mix(in srgb, var(--color-brand) 8%, white); border-color: color-mix(in srgb, var(--color-brand) 30%, white);">
              <span class="text-xs font-bold text-[var(--color-brand)] flex items-center gap-1.5">
                ⚖ CONTROVERSIA FORMULADA POR LA IPS (RE9601)
              </span>
              <p class="text-xs text-slate-300">
                La IPS controvirtió la causal DE4401 en el término de 5 días hábiles sobre el mismo NUR. Inicia el plazo de 10 días para conciliación o auditoría médica.
              </p>
            </div>

            <!-- CASO 3: FACTURA ACEPTADA TÁCITA (ESC-06 / LEY 1438 ART 57) -->
            <div *ngIf="casoActivo().estadoAuditoria === 'FACTURA_ACEPTADA_TACITA'" class="bg-yellow-950/80 p-4 rounded-xl border border-yellow-600 space-y-3 shadow-xl">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-yellow-300 flex items-center gap-1.5">
                  ★ TÍTULO VALOR EJECUTIVO POR ACEPTACIÓN TÁCITA
                </span>
                <span class="px-2 py-0.5 rounded bg-yellow-900 text-yellow-200 font-mono text-[10px]">22 Días Radicada</span>
              </div>
              <p class="text-xs text-yellow-100">
                Transcurrieron 20 días hábiles sin notificación de glosa. Por ministerio de la Ley 1438 de 2011 art. 57 y Dec. 441/2022 art. 2.5.3.4.4.4, la factura está irrevocablemente aceptada. No proceden glosas posteriores.
              </p>
              <div class="flex items-center justify-between pt-1">
                <span class="text-xs font-mono font-bold text-yellow-300">Total a Pagar: <span>$</span>{{ casoActivo().resumenFinanciero.valorFacturadoCop | number:'1.0-0' }} COP</span>
                <button 
                  (click)="despacharPagoAceptacionTacita()"
                  [disabled]="casoActivo().aceptacionTacitaLey1438?.estadoDespachoPago === 'DESPACHADO_A_CORE_EPS'"
                  [class]="casoActivo().aceptacionTacitaLey1438?.estadoDespachoPago === 'DESPACHADO_A_CORE_EPS'
                    ? 'py-2 px-3 rounded bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed'
                    : 'py-2 px-3 rounded bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs shadow transition'"
                >
                  {{ casoActivo().aceptacionTacitaLey1438?.estadoDespachoPago === 'DESPACHADO_A_CORE_EPS' ? '✓ Despachado a Pago' : 'Despachar a Pago Core EPS' }}
                </button>
              </div>
            </div>

            <!-- CASO 4: CASO PENDIENTE ORDINARIO (ESC-01, ESC-02, ESC-03) -->
            <ng-container *ngIf="casoActivo().estadoAuditoria === 'PENDIENTE'">
              
              <!-- MODO RATIFICACIÓN RÁPIDA (F05 / US-12) -->
              <div *ngIf="!modoSobreescritura()" class="space-y-3">
                <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p class="text-slate-500">Auditor Responsable:</p>
                    <p class="font-bold text-slate-900">{{ auditorActual.nombre }} <span class="text-[var(--color-brand)] font-mono">({{ auditorActual.registroMedico }})</span></p>
                  </div>
                  <div class="text-right">
                    <p class="text-slate-500">Acción Sugerida:</p>
                    <p class="font-bold text-emerald-700">Ratificación en 1 Clic</p>
                  </div>
                </div>

                <p *ngIf="ocultarSugerenciaPertinencia()" class="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  Caso de pertinencia clínica: no hay auto-aceptar ni sugerencia IA. El auditor decide en HITL.
                </p>
                <div class="grid grid-cols-2 gap-3">
                  <button 
                    *ngIf="!ocultarSugerenciaPertinencia()"
                    (click)="ejecutarRatificacion1Clic()"
                    class="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                    <span>Aceptar<span class="demo-us-label"> (US-12)</span></span>
                  </button>

                  <button 
                    (click)="activarModoSobreescritura()"
                    class="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 col-span-1"
                    [class.col-span-2]="ocultarSugerenciaPertinencia()"
                  >
                    <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    <span>Sobrescribir<span class="demo-us-label"> (US-13)</span></span>
                  </button>
                </div>
              </div>

              <!-- MODO SOBREESCRITURA FORENSE MÍNIMO 50 CARACTERES (US-13) -->
              <div *ngIf="modoSobreescritura()" class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Sobreescritura Forense con Justificación Médica<span class="demo-us-label"> (US-13)</span></span>
                  </h4>
                  <button (click)="cancelarSobreescritura()" class="text-slate-400 hover:text-white text-xs">Cancelar</button>
                </div>

                <!-- Input Monto Ajustado -->
                <div>
                  <label class="block text-[11px] font-semibold text-slate-300 mb-1">Monto Final de Glosa a Imponer (COP):</label>
                  <input 
                    type="number" 
                    [(ngModel)]="montoGlosaSobreescrita"
                    class="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-mono font-bold text-[var(--color-brand)] focus:outline-none focus:border-[var(--color-brand)]"
                  />
                </div>

                <!-- Textarea con contador duro de 50 caracteres -->
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <label class="block text-[11px] font-semibold text-slate-300">Justificación Médica / Legal Obligatoria:</label>
                    <span 
                      class="text-[10px] font-mono font-bold"
                      [class]="justificacionTexto().length >= 50 ? 'text-emerald-400' : 'text-amber-400 animate-pulse'"
                    >
                      {{ justificacionTexto().length }} / 50 car. mín.
                    </span>
                  </div>

                  <textarea 
                    [(ngModel)]="justificacionTexto"
                    rows="3"
                    placeholder="Escriba la motivación clínica completa para modificar la glosa sugerida por la IA (mínimo 50 caracteres)..."
                    class="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[var(--color-brand)] placeholder:text-slate-400"
                  ></textarea>
                </div>

                <button 
                  (click)="guardarSobreescrituraForense()"
                  [disabled]="justificacionTexto().length < 50"
                  [class]="justificacionTexto().length >= 50 
                    ? 'w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all'
                    : 'w-full py-2.5 rounded-lg bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed border border-slate-800'"
                >
                  Confirmar Sobreescritura (Guardar Registro Auditor)
                </button>
              </div>

            </ng-container>

            <!-- CASO 5: CASO YA AUDITADO Y NOTIFICADO (CERTIFICADO DIGITAL) -->
            <ng-container *ngIf="casoActivo().estadoAuditoria === 'GLOSADA_NOTIFICADA' || casoActivo().estadoAuditoria === 'APROBADA_NOTIFICADA' || casoActivo().estadoAuditoria === 'SOBREESCRITO_FORENSE'">
              <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-emerald-400 flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>Firma Auditora Registrada</span>
                  </span>
                  <span class="text-[11px] font-mono text-slate-400">{{ casoActivo().registroDecisionHitL?.timestamp }}</span>
                </div>

                <div class="text-xs text-slate-700 font-sans space-y-1 bg-white p-2.5 rounded border border-slate-200 font-mono">
                  <p><strong>Auditor:</strong> {{ casoActivo().registroDecisionHitL?.auditor }} ({{ casoActivo().registroDecisionHitL?.registroMedico }})</p>
                  <p><strong>Tipo Acción:</strong> {{ casoActivo().registroDecisionHitL?.tipoAccion }}</p>
                  <p><strong>Glosa Notificada:</strong> <span>$</span>{{ casoActivo().registroDecisionHitL?.glosaFinalCop | number:'1.0-0' }} COP</p>
                  <p *ngIf="casoActivo().registroDecisionHitL?.justificacionMedica" class="text-purple-300">
                    <strong>Motivación:</strong> "{{ casoActivo().registroDecisionHitL?.justificacionMedica }}"
                  </p>
                </div>
              </div>
            </ng-container>

          </div>
        </section>

      </main>


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

  // Familias de filtro
  readonly familiasFiltro = [
    { id: 'TODAS', label: 'Todas' },
    { id: 'CL', label: 'CL (Clínicas)' },
    { id: 'TA', label: 'TA (Tarifas)' },
    { id: 'SO', label: 'SO (Soportes)' },
    { id: 'DE', label: 'DE (Devolución)' },
    { id: 'AC', label: 'AC (Tácita)' }
  ];

  // Signals de estado general
  casos = signal<CasoAuditoria[]>([]);
  casoActivoId = signal<string>('ESC-02');
  documentoActivoId = signal<string>('DOC-HOSP-FEV');
  zoomNivel = signal<number>(100);
  mostrarBoundingBoxes = signal<boolean>(true);
  sugerirPertinenciaIa = signal<boolean>(false);
  filtroFamilia = signal<string>('TODAS');

  // Signals para Sobreescritura Forense (F06)
  modoSobreescritura = signal<boolean>(false);
  justificacionTexto = signal<string>('');
  montoGlosaSobreescrita = signal<number>(0);

  // Computed signals reactivos
  casosFiltrados = computed(() => {
    const todos = this.casos();
    const filtro = this.filtroFamilia();
    if (filtro === 'TODAS') return todos;
    if (filtro === 'CL') return todos.filter(c => c.causalGlosa?.familia === 'CL' || c.tipoResultadoPredictivo === 'APROBADO_DIRECTO');
    if (filtro === 'TA') return todos.filter(c => c.causalGlosa?.familia === 'TA');
    if (filtro === 'SO') return todos.filter(c => c.causalGlosa?.familia === 'SO');
    if (filtro === 'DE') return todos.filter(c => c.causalGlosa?.familia === 'DE' || c.causalGlosa?.familia === 'DEVOLUCIONES' || c.causalGlosa?.familia === 'RECHAZO_RADICACION');
    if (filtro === 'AC') return todos.filter(c => c.causalGlosa?.familia === 'AC' || c.causalGlosa?.familia === 'ACEPTACION_TACITA');
    return todos;
  });

  ocultarSugerenciaPertinencia = computed(() => {
    if (this.sugerirPertinenciaIa()) return false;
    const caso = this.casos().find(c => c.id === this.casoActivoId());
    if (!caso) return false;
    return caso.causalGlosa?.familia === 'CL' || caso.tipoResultadoPredictivo === 'APROBADO_DIRECTO';
  });

  casoActivo = computed(() => {
    const list = this.casos();
    const id = this.casoActivoId();
    return list.find(c => c.id === id) || list[0] || ({} as CasoAuditoria);
  });

  documentoActivo = computed(() => {
    const caso = this.casoActivo();
    if (!caso.soportesDocumentales || caso.soportesDocumentales.length === 0) return null;
    return caso.soportesDocumentales.find(d => d.id === this.documentoActivoId()) || caso.soportesDocumentales[0];
  });

  boundingBoxesDocumentoActivo = computed(() => {
    const caso = this.casoActivo();
    const docId = this.documentoActivoId();
    if (!caso.boundingBoxes) return [];
    return caso.boundingBoxes.filter(b => b.documentoId === docId);
  });

  private route = inject(ActivatedRoute);
  auditoriaService = inject(AuditoriaService);

  trackByCasoId(index: number, caso: CasoAuditoria): string {
    return caso.id;
  }

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

  setFiltroFamilia(familia: string): void {
    this.filtroFamilia.set(familia);
  }

  cargarCasosSemillaMock(): void {
    const casosSemilla: CasoAuditoria[] = [
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
        estadoAuditoria: 'PENDIENTE',
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
          },
          {
            linea: 2,
            codigoCups: '890201',
            descripcionCups: 'Consulta de medicina especializada quirúrgica',
            cantidad: 1,
            valorFacturadoCop: 120000.0,
            valorTarifaPactadaCop: 120000.0,
            valorGlosaSugeridaCop: 0.0,
            estadoItem: 'CONFORME',
            observacionIa: 'Consulta intrahospitalaria prequirúrgica autorizada.'
          }
        ],
        soportesDocumentales: [
          {
            id: 'DOC-8849201-FEV',
            tipoDocumento: 'FEV_XML',
            nombreArchivo: 'FEV_982104_ClAméricas.xml',
            urlMock: 'assets/soportes/FEV_982104.xml',
            totalPaginas: 1
          },
          {
            id: 'DOC-8849201-EPI',
            tipoDocumento: 'EPICRISIS_PDF',
            nombreArchivo: 'Epicrisis_GloriaRestrepo.pdf',
            urlMock: 'assets/soportes/Epicrisis_GloriaRestrepo.pdf',
            totalPaginas: 2
          }
        ],
        boundingBoxes: [],
        explicacionIaRag: {
          resumenEjecutivo: 'Cuenta médica con conformidad integral del 100%. No se evidencian desviaciones tarifarias ni faltantes de soporte.',
          sustentoNormativo: 'Res. 2284/2023 Anexo 3. Los valores facturados corresponden con precisión al acuerdo CTR-2026-SOS-CLINICA-AMERICAS.',
          fuentesCite: [
            'Manual Único de Devoluciones y Glosas - Res. 2284/2023',
            'Contrato Marco de Servicios Quirúrgicos SOS EPS 2026'
          ]
        }
      },
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
          valorFacturadoCop: 235000.0,
          valorTarifaPactadaCop: 215000.0,
          valorGlosaSugeridaCop: 20000.0,
          valorAprobadoSugeridoCop: 215000.0
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
            observacionIa: 'Valor cobrado ($85.000) excede en $20.000 la tarifa base pactada ($65.000) en Contrato CTR-2026-SOS-SANVICENTE.'
          },
          {
            linea: 2,
            codigoCups: '902210',
            descripcionCups: 'Hemograma IV (hemoglobina, hematocrito)',
            cantidad: 1,
            valorFacturadoCop: 30000.0,
            valorTarifaPactadaCop: 30000.0,
            valorGlosaSugeridaCop: 0.0,
            estadoItem: 'CONFORME',
            observacionIa: 'Tarifa conforme con el manual de laboratorio vigente.'
          }
        ],
        soportesDocumentales: [
          { id: 'DOC-HOSP-FEV', tipoDocumento: 'FEV_XML', nombreArchivo: 'FEV.xml', urlMock: 'assets/soportes/FEV_104921.xml', totalPaginas: 1 },
          { id: 'DOC-HOSP-REC', tipoDocumento: 'OTRO_PDF', nombreArchivo: 'Recibo.pdf', urlMock: 'assets/soportes/Recibo.pdf', totalPaginas: 1 },
          { id: 'DOC-HOSP-FOR', tipoDocumento: 'OTRO_PDF', nombreArchivo: 'Formula.pdf', urlMock: 'assets/soportes/Formula.pdf', totalPaginas: 2 },
          { id: 'DOC-HOSP-EPI', tipoDocumento: 'EPICRISIS_PDF', nombreArchivo: 'Epicrisis.pdf', urlMock: 'assets/soportes/Epicrisis.pdf', totalPaginas: 4 },
          { id: 'DOC-HOSP-HQ', tipoDocumento: 'HOJA_QUIRURGICA_PDF', nombreArchivo: 'Hoja_qx.pdf', urlMock: 'assets/soportes/HojaQuirurgica_JorgeMejia.pdf', totalPaginas: 4 },
          { id: 'DOC-HOSP-LAB', tipoDocumento: 'OTRO_PDF', nombreArchivo: 'Laboratorio.pdf', urlMock: 'assets/soportes/Laboratorio.pdf', totalPaginas: 2 },
          { id: 'DOC-HOSP-IMG', tipoDocumento: 'OTRO_PDF', nombreArchivo: 'Imagen.pdf', urlMock: 'assets/soportes/Imagen.pdf', totalPaginas: 3 },
          { id: 'DOC-HOSP-CON', tipoDocumento: 'OTRO_PDF', nombreArchivo: 'Consentimiento.pdf', urlMock: 'assets/soportes/Consentimiento.pdf', totalPaginas: 2 },
          { id: 'DOC-HOSP-EVO', tipoDocumento: 'OTRO_PDF', nombreArchivo: 'Evolucion.pdf', urlMock: 'assets/soportes/Evolucion.pdf', totalPaginas: 6 },
          { id: 'DOC-HOSP-RIP', tipoDocumento: 'OTRO_PDF', nombreArchivo: 'RIPS.json', urlMock: 'assets/soportes/RIPS.json', totalPaginas: 1 },
          { id: 'DOC-HOSP-AUT', tipoDocumento: 'OTRO_PDF', nombreArchivo: 'Autorizacion.pdf', urlMock: 'assets/soportes/Autorizacion.pdf', totalPaginas: 1 },
          { id: 'DOC-HOSP-2284', tipoDocumento: 'OTRO_PDF', nombreArchivo: 'Anexo_2284.pdf', urlMock: 'assets/soportes/Anexo_2284.pdf', totalPaginas: 2 }
        ],
        boundingBoxes: [
          {
            id: 'BB-ESC02-01',
            documentoId: 'DOC-HOSP-HQ',
            pagina: 3,
            coordenadas: {
              x: 10.0,
              y: 42.0,
              width: 80.0,
              height: 14.0
            },
            textoExtraidoOcr: 'CUPS 890201 Consulta Medicina General Urgencias. Valor liquidado en orden: $85.000 COP.',
            etiquetaCampo: 'Liquidación Tarifaria Excedida',
            colorBorde: '#EF4444',
            mensajeHallazgo: 'Diferencia no pactada de $20.000 COP sobre la tarifa SOAT 2026 Anexo 1.'
          }
        ],
        explicacionIaRag: {
          resumenEjecutivo: 'Se detecta un cobro de $85.000 COP en la línea 1 (CUPS 890201), sobrepasando en $20.000 COP la tarifa pactada ($65.000 COP).',
          sustentoNormativo: 'Res. 2284/2023 Anexo 3 - Causal TA0201 (Causal 312 Res. 3047): "Tarifa superior a la pactada en el acuerdo de voluntades".',
          fuentesCite: [
            'Manual Único de Devoluciones y Glosas - Res. 2284/2023 § Anexo Técnico 3',
            'Matriz de Tarifas Contrato CTR-2026-SOS-SANVICENTE'
          ]
        }
      },
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
            observacionIa: 'Facturado bajo póliza SOAT/ECAT sin adjuntar el formulario obligatorio FURIPS.'
          }
        ],
        soportesDocumentales: [
          {
            id: 'DOC-8849203-EPI',
            tipoDocumento: 'EPICRISIS_PDF',
            nombreArchivo: 'Epicrisis_MariaCamilaTorres.pdf',
            urlMock: 'assets/soportes/Epicrisis_MariaCamilaTorres.pdf',
            totalPaginas: 2
          }
        ],
        boundingBoxes: [
          {
            id: 'BB-ESC03-01',
            documentoId: 'DOC-8849203-EPI',
            pagina: 1,
            coordenadas: {
              x: 8.0,
              y: 50.0,
              width: 84.0,
              height: 16.0
            },
            textoExtraidoOcr: 'Ingreso por Urgencias derivado de Accidente de Tránsito (Atención SOAT). No consta radicado FURIPS.',
            etiquetaCampo: 'Soporte FURIPS Faltante',
            colorBorde: '#F59E0B',
            mensajeHallazgo: 'Formulario FURIPS exigido por el Decreto 780 de 2016.'
          }
        ],
        explicacionIaRag: {
          resumenEjecutivo: 'Se identifica recobro de pruebas de perfil de trauma ($280.000 COP) en evento de tránsito sin incluir anexo obligatorio FURIPS.',
          sustentoNormativo: 'Res. 2284/2023 Anexo 3 - Causal DE1601 / Causal 204: "Soporte faltante / Formulario FURIPS no adjunto".',
          fuentesCite: [
            'Decreto 780 de 2016 - Regulaciones SOAT/ECAT',
            'Resolución 2284 de 2023 - Manual Único de Glosas'
          ]
        }
      },
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
        soportesDocumentales: [
          {
            id: 'DOC-8849204-XML',
            tipoDocumento: 'FEV_XML',
            nombreArchivo: 'FEV-771920_Versalles.xml',
            urlMock: 'assets/soportes/FEV-771920_Versalles.xml',
            totalPaginas: 1
          }
        ],
        boundingBoxes: [],
        explicacionIaRag: {
          resumenEjecutivo: 'El archivo FEV no cuenta con Código Único de Validación (CUV) reportado ante el Mecanismo Único de Validación de MinSalud.',
          sustentoNormativo: 'Resolución 0948 de 2026 - Artículo 3.1: Prohibición expresa de radicación de paquetes sin validación CUV.',
          fuentesCite: [
            'Resolución 0948 de 2026 - Artículo 3.1',
            'Resolución 2284 de 2023 - Artículo 7'
          ]
        },
        motivoRechazoSinNur: {
          causal: 'FALTA_CUV_MINSALUD',
          norma: 'Res. 0948/2026 Art. 3.1',
          detalle: 'No coincide el CUV con los registros del validador MinSalud. No se genera radicado ni corren términos.',
          constanciaPdfMock: 'CONSTANCIA_RECHAZO_FEV771920.pdf',
          fechaRechazo: '2026-10-31T09:05:00-05:00'
        }
      },
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
          mensajeNormativo: 'Devolución formulada: 2 días restantes para vencimiento del reloj de 5 días (Res. 2284 art. 6).'
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
          descripcion: 'El prestador no hace parte de la red de la EPS o número de contrato errado (subsanable)'
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
            observacionIa: 'Facturado bajo acuerdo CTR-2025-099 no vigente.'
          },
          {
            linea: 2,
            codigoCups: '931000',
            descripcionCups: 'Terapia Física Integral (Paquete 10 sesiones)',
            cantidad: 1,
            valorFacturadoCop: 700000.0,
            valorTarifaPactadaCop: 0.0,
            valorGlosaSugeridaCop: 700000.0,
            estadoItem: 'GLOSADO_SUGERIDO',
            observacionIa: 'Paquete de rehabilitación física objetado por terminación de contrato.'
          }
        ],
        soportesDocumentales: [
          {
            id: 'DOC-9932140-CTR',
            tipoDocumento: 'CONTRATO_PDF',
            nombreArchivo: 'Contrato_Farallones_2025.pdf',
            urlMock: 'assets/soportes/Contrato_Farallones_2025.pdf',
            totalPaginas: 3
          }
        ],
        boundingBoxes: [
          {
            id: 'BB-ESC05-01',
            documentoId: 'DOC-9932140-CTR',
            pagina: 1,
            coordenadas: {
              x: 10.0,
              y: 65.0,
              width: 80.0,
              height: 12.0
            },
            textoExtraidoOcr: 'Vigencia contractual: Desde el 01 de enero de 2025 hasta el 31 de diciembre de 2025.',
            etiquetaCampo: 'Cláusula de Vigencia Expirada',
            colorBorde: '#EF4444',
            mensajeHallazgo: 'Contrato no prorrogado para el período de atención octubre 2026.'
          }
        ],
        explicacionIaRag: {
          resumenEjecutivo: 'El prestador facturó bajo el contrato CTR-2025-099 el cual expiró el 31-dic-2025. Procede causal taxativa de devolución DE4401.',
          sustentoNormativo: 'Resolución 2284 de 2023 - Anexo Técnico 3 Numeral 1.2 Causal DE4401 y Artículo 6 (Ciclo 5-5-5).',
          fuentesCite: [
            'Resolución 2284 de 2023 - Artículo 6',
            'Resolución 2284 de 2023 - Anexo Técnico 3 Numeral 1.2 Causal DE4401'
          ]
        },
        devolucion5Dias: {
          causalDe: 'DE4401',
          fechaLimiteDevolucion: '2026-11-04T23:59:59-05:00',
          diasHabilesRestantesDevolucion: 2,
          precluida: false,
          causalDescripcion: 'Contrato no vigente con la EPS'
        }
      },
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
          mensajeNormativo: 'ACEPTACIÓN TÁCITA LEGAL: Vencieron los 20 días hábiles sin formulación de glosa (Ley 1438 art. 57).'
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
          descripcion: 'Factura aceptada tácitamente por preclusión de términos de glosa'
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
            observacionIa: 'Factura aceptada por perención legal de términos.'
          },
          {
            linea: 2,
            codigoCups: '881201',
            descripcionCups: 'Ecocardiograma Transtorácico Modo M y 2D',
            cantidad: 1,
            valorFacturadoCop: 2000000.0,
            valorTarifaPactadaCop: 2000000.0,
            valorGlosaSugeridaCop: 0.0,
            estadoItem: 'CONFORME',
            observacionIa: 'Factura aceptada por perención legal de términos.'
          }
        ],
        soportesDocumentales: [
          {
            id: 'DOC-6612098-TV',
            tipoDocumento: 'CERTIFICADO_TITULO_VALOR',
            nombreArchivo: 'Certificado_Titulo_Valor_FEV110298.pdf',
            urlMock: 'assets/soportes/Certificado_Titulo_Valor_FEV110298.pdf',
            totalPaginas: 1
          }
        ],
        boundingBoxes: [],
        explicacionIaRag: {
          resumenEjecutivo: 'Han transcurrido 22 días hábiles desde la emisión del NUR sin que la EPS notificara glosas. La factura queda constituida en Título Valor ejecutivo.',
          sustentoNormativo: 'Ley 1438 de 2011 - Artículo 57 y Decreto 441 de 2022 - Artículo 2.5.3.4.4.4.',
          fuentesCite: [
            'Ley 1438 de 2011 - Artículo 57',
            'Decreto 441 de 2022 - Artículo 2.5.3.4.4.4'
          ]
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

  // Métodos de selección y control UI
  seleccionarCaso(id: string): void {
    this.casoActivoId.set(id);
    this.auditoriaService.setScenario(id);
    const caso = this.casos().find(c => c.id === id);
    if (caso && caso.soportesDocumentales && caso.soportesDocumentales.length > 0) {
      this.documentoActivoId.set(caso.soportesDocumentales[0].id);
    }
    this.modoSobreescritura.set(false);
    this.justificacionTexto.set('');
  }

  seleccionarDocumento(docId: string): void {
    this.documentoActivoId.set(docId);
  }

  cambiarZoom(delta: number): void {
    const nuevo = Math.min(Math.max(this.zoomNivel() + delta, 60), 160);
    this.zoomNivel.set(nuevo);
  }

  toggleBoundingBoxes(): void {
    this.mostrarBoundingBoxes.set(!this.mostrarBoundingBoxes());
  }

  onSugerirPertinenciaIa(event: Event): void {
    this.sugerirPertinenciaIa.set((event.target as HTMLInputElement).checked);
  }

  reiniciarCasosDemo(): void {
    this.cargarCasosSemillaMock();
    this.filtroFamilia.set('TODAS');
  }

  // Acción HitL: Ratificación en 1 Clic (F05 / US-12)
  ejecutarRatificacion1Clic(): void {
    if (this.ocultarSugerenciaPertinencia()) {
      return;
    }
    const caso = this.casoActivo();
    const auditor = this.auditorActual;

    const list = this.casos().map(c => {
      if (c.id === caso.id) {
        const nuevoEstado = c.resumenFinanciero.valorGlosaSugeridaCop > 0 ? 'GLOSADA_NOTIFICADA' : 'APROBADA_NOTIFICADA';
        return {
          ...c,
          estadoAuditoria: nuevoEstado as any,
          registroDecisionHitL: {
            auditor: auditor.nombre,
            registroMedico: auditor.registroMedico,
            timestamp: new Date().toISOString(),
            tipoAccion: 'RATIFICACION_1CLIC' as const,
            glosaFinalCop: c.resumenFinanciero.valorGlosaSugeridaCop
          }
        };
      }
      return c;
    });

    this.casos.set(list);
  }

  // Acción HitL: Sobreescritura Forense (F06 / US-13)
  activarModoSobreescritura(): void {
    this.montoGlosaSobreescrita.set(this.casoActivo().resumenFinanciero.valorGlosaSugeridaCop);
    this.justificacionTexto.set('');
    this.modoSobreescritura.set(true);
  }

  cancelarSobreescritura(): void {
    this.modoSobreescritura.set(false);
  }

  guardarSobreescrituraForense(): void {
    if (this.justificacionTexto().length < 50) return;

    const caso = this.casoActivo();
    const auditor = this.auditorActual;
    const monto = this.montoGlosaSobreescrita();

    const list = this.casos().map(c => {
      if (c.id === caso.id) {
        return {
          ...c,
          estadoAuditoria: 'SOBREESCRITO_FORENSE' as const,
          registroDecisionHitL: {
            auditor: auditor.nombre,
            registroMedico: auditor.registroMedico,
            timestamp: new Date().toISOString(),
            tipoAccion: 'SOBREESCRITURA_FORENSE' as const,
            glosaFinalCop: monto,
            justificacionMedica: this.justificacionTexto()
          }
        };
      }
      return c;
    });

    this.casos.set(list);
    this.modoSobreescritura.set(false);
  }

  // Acciones normativas avanzadas (F09, F10, F11)
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
        if (tipo === 'RE9701') {
          return {
            ...c,
            estadoAuditoria: 'APROBADA_NOTIFICADA' as const,
            semaforo: {
              ...c.semaforo,
              mensajeNormativo: 'IPS Aceptó devolución (RE9701): Se expedirá Nota Crédito y nuevo NUR.'
            }
          };
        } else {
          return {
            ...c,
            estadoAuditoria: 'DEVOLUCION_CONTROVERTIDA' as const,
            semaforo: {
              ...c.semaforo,
              mensajeNormativo: 'IPS Controvirtió devolución (RE9601): Continúa sobre el mismo NUR.'
            }
          };
        }
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
    alert('La Factura FEV-110298 (Título Valor TV-SOS-2026-009941) ha sido despachada formalmente al Core de Tesorería de SOS EPS para giro directo.');
  }

  // Helper de estilos para el Semáforo Dinámico
  obtenerEstiloSemaforoBadge(nivel: 'VERDE' | 'AMARILLO' | 'ROJO'): string {
    switch (nivel) {
      case 'ROJO':
        return 'bg-red-50 text-red-800 border border-red-200';
      case 'AMARILLO':
        return 'bg-amber-50 text-amber-900 border border-amber-200';
      case 'VERDE':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
    }
  }

  // Atajos de teclado para la demostración
  @HostListener('window:keydown', ['$event'])
  manejarAtajosTeclado(event: KeyboardEvent): void {
    if (event.ctrlKey && event.shiftKey && event.key.toUpperCase() === 'R') {
      event.preventDefault();
      this.reiniciarCasosDemo();
    }
  }
}
