import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export type TramiteFactura = 'CONFORME' | 'GLOSA_AUTO' | 'RECHAZO_SIN_NUR';
export type ScenarioCarga = 'EXITO' | 'ESC-04';
export type EstadoPaquete = 'RADICADA' | 'RECHAZO_SIN_NUR';

export interface FacturaRadicada {
  factura: string;
  nur: string;
  valor: number;
  hash: string;
  estado: 'RADICADA' | 'RECHAZO_SIN_NUR';
  tramiteGlosa?: boolean;
  hallazgo?: string;
  tramite: TramiteFactura;
}

export interface FacturaLote {
  factura: string;
  valor: number;
  estado: 'CONFORME' | 'ALERTA' | 'RECHAZO_SIN_CUV' | 'RADICADA';
  hallazgo?: string;
  nur?: string;
  hash?: string;
  tramiteGlosa?: boolean;
}

export type TipoContratoRadicacion =
  | 'EVENTO'
  | 'PAC'
  | 'CAPITA_INICIAL'
  | 'CAPITA_PERIODO'
  | 'PGP'
  | 'OTRA';

export const MAPA_DOCUMENTOS_CONTRATO: Record<TipoContratoRadicacion, string> = {
  EVENTO: 'FEV → RIPS.Json → CUV → soportes Res. 2284 → radicación',
  PAC: 'FEV → RIPS.Json → CUV → soportes Res. 2284 → radicación',
  CAPITA_INICIAL: 'FEV → CUV → soportes (sin RIPS JSON)',
  CAPITA_PERIODO: 'Factura mes actual → RIPS mes anterior → CUV → soportes',
  PGP: 'FEV + RIPS mes actual → CUV → soportes pactados + planilla aportes',
  OTRA: 'Documentos según lo pactado en el contrato (GESTOR_DOC_46)'
};

export interface LoteValidation {
  id: string;
  ips: string;
  nit: string;
  estructuraOk: boolean;
  diferenciaAritmetica: number | null;
  facturaProblema: string | null;
  cuentas: number;
  valorTotal: number;
  cerrado: boolean;
  nur?: string;
  facturas?: FacturaLote[];
  facturasRadicadas?: FacturaRadicada[];
  hash?: string;
  fechaCierre?: string;
  scenarioId: ScenarioCarga;
  rechazoSinNur?: boolean;
  motivoRechazo?: string;
  informePrevalidacion?: boolean;
  tipoContrato: TipoContratoRadicacion;
}

export interface RadicacionHistorial {
  id: string;
  tenantSchema: string;
  ips: string;
  nit: string;
  cuentas: number;
  valorTotal: number;
  estadoPaquete: EstadoPaquete;
  tipoContrato: TipoContratoRadicacion;
  fecha: string;
  hash?: string;
  facturas: FacturaRadicada[];
}

export interface GuiaDemoPaso {
  numero: number;
  titulo: string;
  descripcion: string;
  completado: boolean;
  activo?: boolean;
}

export interface GuiaDemoContexto {
  titulo: string;
  badge: {
    texto: string;
    clase: string;
  };
  ips: string;
  identificador: string;
  norma: string;
  diagnostico: string;
  sustentoLegal: string;
  accionSugerida: string;
  pitch: string;
  pasos: GuiaDemoPaso[];
}

export interface GlosaNotificada {
  id: string;
  factura: string;
  paciente: string;
  ips: string;
  nit: string;
  valorFacturado: number;
  valorGlosado: number;
  causalCodigo: string;
  causalDescripcion: string;
  auditor: string;
  registroMedico: string;
  estado: 'PENDIENTE_RESPUESTA_IPS' | 'SUBSANADA_ENVIADA' | 'ACEPTADA_POR_IPS';
  justificacionIps?: string;
  fechaNotificacion: string;
}

export interface CuentaGlosada {
  nur: string;
  paciente: string;
  factura: string;
  ips: string;
  nit: string;
  causal: string;
  monto: number;
  estado: 'PENDIENTE_RESPUESTA' | 'RESPONDIDA';
  diasHabilesRestantes: number;
}

const GLOSAS_SEMILLA: GlosaNotificada[] = [
  {
    id: 'GLO-2026-00412',
    factura: 'A118492568',
    paciente: 'María Fernanda Gómez (CC 31.458.910)',
    ips: 'Clínica Imbanaco',
    nit: '805.001.157-2',
    valorFacturado: 7200000,
    valorGlosado: 1450000,
    causalCodigo: '312',
    causalDescripcion: 'Tarifa liquidada excede el manual SOAT 2026 + 5% pactado para Derechos de Sala Tipo 2',
    auditor: 'Dr. Juan Martínez',
    registroMedico: 'RM-45210',
    estado: 'PENDIENTE_RESPUESTA_IPS',
    fechaNotificacion: '2026-10-30T16:45:00'
  },
  {
    id: 'GLO-2026-00413',
    factura: 'FEV-2026-9915',
    paciente: 'Carlos Arturo Restrepo (CC 16.782.341)',
    ips: 'Clínica Valle del Lili',
    nit: '890.301.245-1',
    valorFacturado: 4800000,
    valorGlosado: 950000,
    causalCodigo: '415',
    causalDescripcion: 'Procedimiento secundario no cubierto por autorización previa de la EPS',
    auditor: 'Dra. Elena Pantoja',
    registroMedico: 'RM-38912',
    estado: 'PENDIENTE_RESPUESTA_IPS',
    fechaNotificacion: '2026-10-29T11:20:00'
  }
];

const CUENTAS_GLOSADAS_SEMILLA: CuentaGlosada[] = [
  {
    nur: 'NUR-2026-8849202',
    paciente: 'María Fernanda Gómez (CC 31.458.910)',
    factura: 'A118492568',
    ips: 'Clínica Imbanaco',
    nit: '805.001.157-2',
    causal: 'TA0201 / 312 - Tarifa liquidada excede manual SOAT 2026 + 5% pactado para Derechos de Sala Tipo 2',
    monto: 1450000,
    estado: 'PENDIENTE_RESPUESTA',
    diasHabilesRestantes: 11
  },
  {
    nur: 'NUR-2026-8849203',
    paciente: 'Carlos Arturo Restrepo (CC 16.782.341)',
    factura: 'FEV-2026-9915',
    ips: 'Clínica Valle del Lili',
    nit: '890.301.245-1',
    causal: 'AU0101 / 415 - Procedimiento secundario no cubierto por autorización previa de la EPS',
    monto: 950000,
    estado: 'PENDIENTE_RESPUESTA',
    diasHabilesRestantes: 4
  }
];

@Injectable({
  providedIn: 'root'
})
export class RadicacionService {
  private auth = inject(AuthService);
  loteActivo = signal<LoteValidation | null>(null);
  private historial = signal<RadicacionHistorial[]>(this.semillaHistorial());
  radicacionSeleccionadaId = signal<string>('2026-09-15-003');

  isDemoHudOpen = signal<boolean>(false);
  mostrarEtiquetasUs = signal<boolean>(true);

  glosas = signal<GlosaNotificada[]>(GLOSAS_SEMILLA);
  cuentasGlosadas = signal<CuentaGlosada[]>(CUENTAS_GLOSADAS_SEMILLA);

  radicacionesDelUsuario = computed(() => {
    const nit = this.auth.sesion().nit;
    return this.historial().filter(r => r.nit === nit);
  });
  cuentasGlosadasPendientes = computed(() =>
    this.cuentasGlosadas().filter(c => c.estado === 'PENDIENTE_RESPUESTA' && c.nit === this.auth.sesion().nit)
  );

  radicacionSeleccionada = computed(() => {
    const id = this.radicacionSeleccionadaId();
    return this.radicacionesDelUsuario().find(r => r.id === id) ?? this.radicacionesDelUsuario()[0] ?? null;
  });

  radicarRespuesta(nur: string, accion: string) {
    this.cuentasGlosadas.update(list => list.map(c => c.nur === nur ? { ...c, estado: 'RESPONDIDA' } : c));
    this.glosas.update(list => list.map(g => g.factura.includes(nur.slice(-4)) || (g.valorGlosado === 1450000 && nur.includes('8849202')) ? { ...g, estado: 'SUBSANADA_ENVIADA' } : g));
    return { acta: `ACTA-CONC-2026-${Math.floor(1000 + Math.random() * 9000)}`, nur };
  }

  estadoSemaforo = computed(() => {
    const lote = this.loteActivo();
    if (!lote) return 'GRIS';
    if (lote.rechazoSinNur) return 'ROJO';
    return 'VERDE';
  });

  getGuiaDemoContexto(url: string = ''): GuiaDemoContexto {
    if (url.includes('respuestas')) {
      const total = this.cuentasGlosadas().length;
      const pendientes = this.cuentasGlosadasPendientes().length;
      const tramitadas = total - pendientes;

      return {
        titulo: 'Glosas Notificadas · Trámite de Respuesta IPS (Res. 2284)',
        badge: {
          texto: pendientes === 0 ? 'TODAS SUBSANADAS' : '15 DÍAS HÁBILES · RESPUESTA',
          clase: pendientes === 0 ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'
        },
        ips: 'Clínica Imbanaco & Valle del Lili',
        identificador: `${pendientes} Glosas Pendientes (${tramitadas} Tramitadas)`,
        norma: 'Resolución 2284 de 2023 - Art. 14 (Términos Perentorios de Conciliación)',
        diagnostico: 'La aseguradora (EPS) notificó glosas sobre facturas radicadas: NUR-2026-8849202 (Clínica Imbanaco · Exceso tarifario SOAT por $1.450.000) y NUR-2026-8849203 (Clínica Valle del Lili · Procedimiento no cubierto por $950.000). La IPS dispone de 15 días hábiles perentorios para formular respuesta técnica antes de que la glosa adquiera firmeza legal.',
        sustentoLegal: 'Resolución 2284 de 2023 Art. 14: La IPS cuenta con tres mecanismos reglamentarios de respuesta: 1) Aceptar la glosa emitiendo Nota Crédito bajo causal RE9701, 2) Controvertir la causal (RE9601) sustentando pertinencia médica y abriendo término de 10 días para conciliación, o 3) Subsanar con soportes clínicos adicionales (RE9601-SUB).',
        accionSugerida: pendientes > 0
          ? 'La columna principal es el número de factura (A118492568). Responder → Subsanar admite varios PDF o un ZIP (límite paramétrico de demo: 50 MB / 20 archivos).'
          : 'Excelente: Todas las glosas han sido tramitadas oportunamente y radicadas para conciliación oficial con la aseguradora.',
        pitch: 'Trazabilidad jurídica punto a punto: reduce los tiempos de controversia de glosas de 90 a 15 días hábiles, protegiendo el flujo de caja y la cartera de la IPS.',
        pasos: [
          { numero: 1, titulo: 'Recepción y cómputo de términos perentorios', descripcion: 'Notificación electrónica de la EPS con 15 días hábiles restantes', completado: true },
          { numero: 2, titulo: 'Selección de mecanismo legal de respuesta', descripcion: 'Aceptar (RE9701), Controvertir (RE9601) o Subsanar con anexo', completado: tramitadas > 0, activo: pendientes > 0 },
          { numero: 3, titulo: 'Radicación de acta oficial de conciliación', descripcion: 'Generación de número de acta inmutable para la aseguradora', completado: tramitadas > 0, activo: tramitadas === 0 && pendientes > 0 }
        ]
      };
    }

    if (url.includes('radicaciones')) {
      const sel = this.radicacionSeleccionada();
      const glosa = sel?.facturas.some(f => f.tramite === 'GLOSA_AUTO');
      const rechazo = sel?.estadoPaquete === 'RECHAZO_SIN_NUR';
      return {
        titulo: rechazo ? 'Historial · Rechazo sin NUR' : 'Historial · Facturas y su NUR',
        badge: {
          texto: rechazo ? 'ROJO · SIN NUR' : glosa ? 'NUR EMITIDOS · GLOSA EN TRÁMITE' : 'NUR POR FACTURA',
          clase: rechazo ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
        },
        ips: sel?.ips ?? 'Radicador',
        identificador: sel?.id ?? 'Sin radicaciones',
        norma: rechazo ? 'Resolución 0948 de 2026 Art. 3.1' : 'Resolución 2284 de 2023 · NUR por factura',
        diagnostico: rechazo
          ? 'Esta radicación no nació: falta CUV. No hay NUR ni corren términos contra la EPS. El PDF es constancia de rechazo.'
          : glosa
            ? 'Cada fila es una factura con NUR propio. FEV-1024 ya está radicada: el descuadre de paquete aparece como trámite «Alerta + glosa auto» (RN-GLO-AUTO-01), no como rechazo de la radicación.'
            : 'El agrupador de la izquierda es la radicación del día. El sello legal está en la columna NUR.',
        sustentoLegal: 'El NUR se emite por factura. El id de la izquierda no es número de radicado. Tras el NUR el expediente es inmutable; la controversia de paquete sigue por glosa.',
        accionSugerida: 'Seleccione 2026-09-15-003 y señale FEV-1024 (Alerta + glosa auto). Luego 2026-09-15-004 (todo Conforme). Un rechazo sin NUR se ve sin valor de NUR.',
        pitch: 'El radicador consulta su expediente: factura, NUR y trámite.',
        pasos: [
          { numero: 1, titulo: 'Elegir la radicación', descripcion: 'Lista YYYY-MM-DD-nnn', completado: true, activo: true },
          { numero: 2, titulo: 'Leer NUR y trámite', descripcion: 'Conforme o glosa auto con NUR ya emitido', completado: !!sel },
          { numero: 3, titulo: 'Descargar PDF', descripcion: 'Acuse por factura o constancia de rechazo', completado: false }
        ]
      };
    }

    const lote = this.loteActivo();

    if (!lote) {
      return {
        titulo: 'Carga del paquete RIPS / FEV',
        badge: {
          texto: 'FASE 0 · INGESTA',
          clase: 'bg-blue-100 text-blue-800 border-blue-300'
        },
        ips: 'Sin prestador cargado',
        identificador: 'Paquete pendiente',
        norma: 'Resolución 2284 de 2023 & Decreto 441 de 2022',
        diagnostico: 'El portal valida paquetes RIPS/FEV. Hay dos caminos de carga: paquete conforme (CUV válido → NUR por factura) o sin CUV (constancia, cero NUR).',
        sustentoLegal: 'Sin CUV no hay radicación (Res. 0948 Art. 3.1). Un hallazgo de paquete no impide el NUR: se ve después en Radicaciones como trámite.',
        accionSugerida: 'Elija tipo de contrato. Use «Paquete conforme» o «Sin CUV (Res. 0948)». No hay tercer botón de alerta en esta pantalla.',
        pitch: 'Filtro en origen: el radicador ve si nació el NUR, no un agrupador ambiguo.',
        pasos: [
          { numero: 1, titulo: 'Cargar paquete de radicación', descripcion: 'ZIP o atajo de presentador', completado: false, activo: true },
          { numero: 2, titulo: 'Prevalidación', descripcion: 'Informe por factura, aún sin NUR', completado: false },
          { numero: 3, titulo: 'Radicación o constancia', descripcion: 'NUR por factura o rechazo sin NUR', completado: false }
        ]
      };
    }

    if (lote.scenarioId === 'ESC-04' || lote.rechazoSinNur) {
      return {
        titulo: 'Rechazo estricto: falta CUV MinSalud',
        badge: {
          texto: 'ROJO · RECHAZO SIN NUR',
          clase: 'bg-rose-100 text-rose-900 border-rose-300'
        },
        ips: lote.ips,
        identificador: `Factura ${lote.facturaProblema} · ${lote.id}`,
        norma: 'Resolución 0948 de 2026 - Artículo 3.1',
        diagnostico: 'La factura FEV-771920 carece del Código Único de Validación (CUV). La plataforma bloquea la generación de NUR.',
        sustentoLegal: 'Art. 3.1 Res. 0948 de 2026: no se entiende radicada ninguna factura de salud sin CUV previo; no corren términos de pago para la EPS.',
        accionSugerida: 'Descargue la constancia y pulse «Ver en Radicaciones». No hay NUR ni reemplazo de archivo.',
        pitch: 'Blindaje jurídico para la EPS: la cuenta no nació.',
        pasos: [
          { numero: 1, titulo: 'Inspección de CUV', descripcion: 'Falta CUV en cabecera de factura', completado: true },
          { numero: 2, titulo: 'Bloqueo de NUR', descripcion: 'Res. 0948 Art. 3.1', completado: true },
          { numero: 3, titulo: 'Constancia de rechazo', descripcion: 'Queda en el historial sin NUR', completado: false, activo: true }
        ]
      };
    }

    return {
      titulo: lote.cerrado ? 'Paquete radicado · NUR por factura' : 'Paquete conforme · listo para radicar',
      badge: {
        texto: lote.cerrado ? 'VERDE · RADICADO' : 'VERDE · CONFORME',
        clase: 'bg-emerald-100 text-emerald-900 border-emerald-300'
      },
      ips: lote.ips,
      identificador: lote.cerrado ? `${lote.cuentas} NUR · ${lote.id}` : `${lote.cuentas} facturas · ${lote.id}`,
      norma: 'Resolución 2284 de 2023 · NUR por factura',
      diagnostico: lote.cerrado
        ? 'Cada factura tiene NUR propio. El expediente es inmutable. El detalle vive en Radicaciones.'
        : 'CUV válido, estructura conforme. Confirme para emitir NUR por factura.',
      sustentoLegal: 'Tras el NUR no hay modificación del paquete. Un hallazgo de paquete, si existiera, no se enseña aquí: queda como trámite en el historial.',
        accionSugerida: lote.cerrado
        ? 'El resumen con NUR por factura queda en esta pantalla. Luego puede ir a Radicaciones.'
        : 'Pulse «Confirmar y radicar oficialmente». El resumen con NUR permanece aquí.',
      pitch: 'Automatización: cuentas validadas y NUR por factura en segundos.',
      pasos: [
        { numero: 1, titulo: 'Validación de RIPS y FEV', descripcion: 'Estructura y CUV conformes', completado: true },
        { numero: 2, titulo: 'Confirmación del radicador', descripcion: lote.cerrado ? 'NUR emitidos' : 'Pendiente de confirmar', completado: !!lote.cerrado, activo: !lote.cerrado },
        { numero: 3, titulo: 'Consultar historial', descripcion: 'Factura, NUR, trámite', completado: !!lote.cerrado }
      ]
    };
  }

  guiaDemoContexto = computed<GuiaDemoContexto>(() => this.getGuiaDemoContexto());

  private huella(seed: number, i: number): string {
    const hex = '0123456789abcdef';
    return 'SHA256:' + Array.from({ length: 16 }, (_, k) => hex[(seed * (i + 3) + k * 7) % 16]).join('') + '…';
  }

  private armarFacturas(cuentas: number, valorTotal: number, problema: string | null, hallazgo: string | null, rechazoSinCuv = false): FacturaLote[] {
    const valorUnitario = Math.round(valorTotal / Math.max(cuentas, 1));
    const year = new Date().getFullYear();
    return Array.from({ length: cuentas }, (_, i) => {
      const esProblema = problema !== null && (i === 0 || cuentas === 1);
      const factura = esProblema ? problema : `FEV-${year}-${String(i + 1).padStart(4, '0')}`;
      if (esProblema && rechazoSinCuv) {
        return { factura, valor: valorUnitario, estado: 'RECHAZO_SIN_CUV' as const, hallazgo: hallazgo ?? undefined };
      }
      return { factura, valor: valorUnitario, estado: 'CONFORME' as const };
    });
  }

  private semillaHistorial(): RadicacionHistorial[] {
    const liliValor = 3983333;
    const lili: FacturaRadicada[] = [
      { factura: 'FEV-1024', nur: 'NUR-LILI-2026-9311', valor: liliValor, hash: this.huella(46, 0), estado: 'RADICADA', tramiteGlosa: true, tramite: 'GLOSA_AUTO', hallazgo: 'Descuadre aritmético $80.000 COP. NUR emitido; glosa automática (RN-GLO-AUTO-01).' },
      { factura: 'FEV-2026-0002', nur: 'NUR-LILI-2026-9312', valor: liliValor, hash: this.huella(46, 1), estado: 'RADICADA', tramite: 'CONFORME' },
      { factura: 'FEV-2026-0003', nur: 'NUR-LILI-2026-9313', valor: liliValor, hash: this.huella(46, 2), estado: 'RADICADA', tramite: 'CONFORME' },
      { factura: 'FEV-2026-0004', nur: 'NUR-LILI-2026-9314', valor: liliValor, hash: this.huella(46, 3), estado: 'RADICADA', tramite: 'CONFORME' },
      { factura: 'FEV-2026-0005', nur: 'NUR-LILI-2026-9315', valor: liliValor, hash: this.huella(46, 4), estado: 'RADICADA', tramite: 'CONFORME' }
    ];
    const huvValor = 3613333;
    const huv: FacturaRadicada[] = Array.from({ length: 7 }, (_, i) => ({
      factura: `FEV-2026-${String(i + 1).padStart(4, '0')}`,
      nur: `NUR-HUV-2026-${3621 + i}`,
      valor: huvValor,
      hash: this.huella(56, i),
      estado: 'RADICADA' as const,
      tramite: 'CONFORME' as const
    }));
    const imbValor = 4460937;
    const imbanaco: FacturaRadicada[] = [
      { factura: 'FEV-1024', nur: 'NUR-IMB-2026-1024', valor: imbValor, hash: this.huella(41, 0), estado: 'RADICADA', tramiteGlosa: true, tramite: 'GLOSA_AUTO', hallazgo: 'Descuadre aritmético $80.000 COP. NUR emitido; glosa automática (RN-GLO-AUTO-01).' },
      { factura: 'A118492568', nur: 'NUR-2026-8849202', valor: 7200000, hash: this.huella(41, 1), estado: 'RADICADA', tramite: 'CONFORME' },
      { factura: 'FEV-2026-8801', nur: 'NUR-IMB-2026-8801', valor: imbValor, hash: this.huella(41, 2), estado: 'RADICADA', tramite: 'CONFORME' }
    ];
    return [
      {
        id: '2026-09-15-003',
        tenantSchema: 'tenant_sos',
        ips: 'Clínica Imbanaco',
        nit: '805.001.157-2',
        cuentas: imbanaco.length,
        valorTotal: imbanaco.reduce((s, f) => s + f.valor, 0),
        estadoPaquete: 'RADICADA',
        tipoContrato: 'EVENTO',
        fecha: '2026-09-15T11:20:00',
        hash: 'SHA256:8f3a8b2c4d5e917fa00b73c21e4918237d89ac02fe38b1d9c490a612ef49c21e',
        facturas: imbanaco
      },
      {
        id: '2026-09-15-005',
        tenantSchema: 'tenant_sos',
        ips: 'Clínica Valle del Lili',
        nit: '890.301.245-1',
        cuentas: lili.length,
        valorTotal: liliValor * lili.length,
        estadoPaquete: 'RADICADA',
        tipoContrato: 'EVENTO',
        fecha: '2026-09-15T11:20:00',
        hash: 'SHA256:aa11bb22cc33dd44ee55ff6677889900aabbccddeeff00112233445566778899',
        facturas: lili
      },
      {
        id: '2026-09-15-004',
        tenantSchema: 'tenant_sos',
        ips: 'Hospital Universitario del Valle',
        nit: '890.399.010-8',
        cuentas: huv.length,
        valorTotal: huvValor * huv.length,
        estadoPaquete: 'RADICADA',
        tipoContrato: 'PGP',
        fecha: '2026-09-15T16:40:00',
        hash: 'SHA256:1a2b3c4d5e6f7890aa11bb22cc33dd44ee55ff6677889900aabbccddeeff0011',
        facturas: huv
      }
    ];
  }

  seleccionarRadicacion(id: string) {
    this.radicacionSeleccionadaId.set(id);
  }

  cargarPreset(scenario: ScenarioCarga | 'ESC-01' | 'ESC-02' | 'ESC-03') {
    if (this.loteActivo()?.cerrado) {
      return;
    }
    const flujo: ScenarioCarga = scenario === 'ESC-04' ? 'ESC-04' : 'EXITO';
    if (flujo === 'EXITO') {
      const sesion = this.auth.sesion();
      this.loteActivo.set({
        id: '2026-11-05-010',
        ips: sesion.ips,
        nit: sesion.nit,
        estructuraOk: true,
        diferenciaAritmetica: null,
        facturaProblema: null,
        cuentas: 32,
        valorTotal: 142850000,
        cerrado: false,
        scenarioId: 'EXITO',
        informePrevalidacion: true,
        tipoContrato: 'EVENTO',
        facturas: this.armarFacturas(32, 142850000, null, null)
      });
      return;
    }
    const sesion = this.auth.sesion();
    this.loteActivo.set({
      id: '2026-10-31-089',
      ips: sesion.ips,
      nit: sesion.nit,
      estructuraOk: false,
      diferenciaAritmetica: null,
      facturaProblema: 'FEV-771920',
      cuentas: 1,
      valorTotal: 3850000,
      cerrado: false,
      scenarioId: 'ESC-04',
      rechazoSinNur: true,
      motivoRechazo: 'Falta CUV obligatorio según Res. 0948/2026 Art. 3.1. Paquete rechazado sin radicar y sin generar NUR.',
      informePrevalidacion: true,
      tipoContrato: 'EVENTO',
      facturas: this.armarFacturas(1, 3850000, 'FEV-771920', 'Sin CUV válido (Res. 0948 Art. 3.1). No hay NUR.', true)
    });
  }

  cargarArchivos(tipo: TipoContratoRadicacion = 'EVENTO') {
    this.cargarPreset('EXITO');
    this.loteActivo.update(lote => lote ? { ...lote, tipoContrato: tipo } : lote);
  }

  prevalidar() {
    this.loteActivo.update(lote => {
      if (!lote || lote.cerrado) return lote;
      return { ...lote, informePrevalidacion: true };
    });
  }

  private upsertHistorial(entry: RadicacionHistorial) {
    this.historial.update(list => {
      const sin = list.filter(r => r.id !== entry.id);
      return [entry, ...sin];
    });
    this.radicacionSeleccionadaId.set(entry.id);
  }

  cerrarLote(): boolean {
    const lote = this.loteActivo();
    if (!lote || lote.cerrado || lote.rechazoSinNur || !lote.estructuraOk) {
      return false;
    }
    const prefix = lote.ips.includes('Lili') ? 'LILI' : lote.ips.includes('Imbanaco') ? 'IMB' : lote.ips.includes('Versalles') ? 'VER' : 'HUV';
    const year = new Date().getFullYear();
    const base = Math.floor(1000 + Math.random() * 9000);
    const origen = lote.facturas?.length
      ? lote.facturas
      : this.armarFacturas(lote.cuentas, lote.valorTotal, lote.facturaProblema, null);
    const facturas: FacturaLote[] = origen.map((f, i) => {
      const hash = this.huella(base, i);
      return {
        ...f,
        nur: `NUR-${prefix}-${year}-${base + i}`,
        hash,
        estado: 'RADICADA' as const,
        tramiteGlosa: false
      };
    });
    const facturasRadicadas: FacturaRadicada[] = facturas.map(f => ({
      factura: f.factura,
      nur: f.nur as string,
      valor: f.valor,
      hash: f.hash as string,
      estado: 'RADICADA',
      tramiteGlosa: false,
      tramite: 'CONFORME'
    }));
    const cerrado: LoteValidation = {
      ...lote,
      cerrado: true,
      facturas,
      facturasRadicadas,
      hash: 'SHA256:8f3a8b2c4d5e917fa00b73c21e4918237d89ac02fe38b1d9c490a612ef49c21e',
      fechaCierre: new Date().toISOString()
    };
    this.loteActivo.set(cerrado);
    this.upsertHistorial({
      id: cerrado.id,
      tenantSchema: this.auth.sesion().tenantSchema,
      ips: cerrado.ips,
      nit: cerrado.nit,
      cuentas: cerrado.cuentas,
      valorTotal: cerrado.valorTotal,
      estadoPaquete: 'RADICADA',
      tipoContrato: cerrado.tipoContrato,
      fecha: cerrado.fechaCierre as string,
      hash: cerrado.hash,
      facturas: facturasRadicadas
    });
    return true;
  }

  registrarRechazoEnHistorial(): boolean {
    const lote = this.loteActivo();
    if (!lote?.rechazoSinNur) {
      return false;
    }
    const facturas: FacturaRadicada[] = (lote.facturas ?? []).map(f => ({
      factura: f.factura,
      nur: '',
      valor: f.valor,
      hash: '—',
      estado: 'RECHAZO_SIN_NUR' as const,
      tramite: 'RECHAZO_SIN_NUR' as const,
      hallazgo: f.hallazgo
    }));
    this.upsertHistorial({
      id: lote.id,
      tenantSchema: this.auth.sesion().tenantSchema,
      ips: lote.ips,
      nit: lote.nit,
      cuentas: lote.cuentas,
      valorTotal: lote.valorTotal,
      estadoPaquete: 'RECHAZO_SIN_NUR',
      tipoContrato: lote.tipoContrato,
      fecha: new Date().toISOString(),
      facturas
    });
    return true;
  }

  responderGlosa(glosaId: string, justificacion: string) {
    this.glosas.update(list =>
      list.map(g => g.id === glosaId ? { ...g, estado: 'SUBSANADA_ENVIADA', justificacionIps: justificacion } : g)
    );
  }

  aceptarGlosa(glosaId: string) {
    this.glosas.update(list =>
      list.map(g => g.id === glosaId ? { ...g, estado: 'ACEPTADA_POR_IPS' } : g)
    );
  }

  toggleDemoHud() {
    this.isDemoHudOpen.update(v => !v);
  }

  resetData() {
    this.loteActivo.set(null);
    this.isDemoHudOpen.set(false);
    this.historial.set(this.semillaHistorial());
    this.radicacionSeleccionadaId.set('2026-09-15-003');
    this.glosas.set(GLOSAS_SEMILLA.map(g => ({ ...g })));
    this.cuentasGlosadas.set(CUENTAS_GLOSADAS_SEMILLA.map(c => ({ ...c })));
  }

  descargarCertificado() {
    const lote = this.loteActivo();
    const total = lote?.facturasRadicadas?.length ?? 0;
    alert(`Acuse consolidado descargado.\n${total} facturas radicadas, cada una con su propio NUR.\nHash SHA256 estampado según Res. 2284.\nEstado: CERRADO Y RADICADO.`);
  }

  descargarCertificadoFactura(f: FacturaRadicada) {
    if (f.tramite === 'RECHAZO_SIN_NUR' || !f.nur) {
      alert(`Constancia de rechazo de la factura ${f.factura}.\nSin NUR (Res. 0948 Art. 3.1).`);
      return;
    }
    alert(`Certificado de Radicación de la factura ${f.factura}.\nNUR: ${f.nur}\nHuella ${f.hash}\nEstado: RADICADA.`);
  }

  descargarNurCsv() {
    const sel = this.radicacionSeleccionada() ?? this.loteActivo();
    const total = ('facturas' in (sel ?? {}) ? this.radicacionSeleccionada()?.facturas.length : this.loteActivo()?.facturasRadicadas?.length) ?? 0;
    alert(`Exportando CSV con ${total} filas (factura, NUR, valor, huella, trámite).`);
  }

  etiquetaTramite(tramite: TramiteFactura): string {
    if (tramite === 'GLOSA_AUTO') return 'Alerta + glosa auto';
    if (tramite === 'RECHAZO_SIN_NUR') return 'Rechazo sin NUR';
    return 'Conforme';
  }
}
