import { Injectable, signal, computed } from '@angular/core';

export interface PacienteInfo {
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  edad: number;
  genero: string;
  regimen: string;
}

export interface IpsInfo {
  nit: string;
  razonSocial: string;
  codigoHabilitacion: string;
}

export interface ItemCups {
  codigo: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  valorTotal: number;
  tarifaPactada?: number;
  glosado?: boolean;
  montoGlosa?: number;
}

export interface BoundingBoxInfo {
  pagina: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  textoDetectado: string;
}

export interface SoporteClinicoInfo {
  tipoDocumento: string;
  folios: number;
  resumenClinico: string;
  boundingBox?: BoundingBoxInfo | null;
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
  caso: string;
  norma: string;
  diagnostico: string;
  sustentoLegal: string;
  accionSugerida: string;
  pitch: string;
  pasos: GuiaDemoPaso[];
}

export interface CuentaAuditoria {
  id?: string;
  nur: string;
  estado: 'PENDIENTE' | 'GLOSADA_NOTIFICADA' | 'LEVANTADA';
  diasVencimiento: number;
  colorBadge: 'ROJO' | 'AMARILLO' | 'VERDE';
  cups: string;
  valorFacturado: number;
  tarifaPactada: number;
  recomendacionIa: {
    monto: number;
    causal: string;
    confianza?: number;
    normativa?: string;
    codigoCausal?: string;
    motivo?: string;
  };
  justificacionMedica?: string;
  paciente?: PacienteInfo;
  ips?: IpsInfo;
  numeroFev?: string;
  itemsCups?: ItemCups[];
  soporteClinico?: SoporteClinicoInfo;
}

const CASOS_INICIALES: CuentaAuditoria[] = [
  {
    id: 'ESC-01',
    nur: 'NUR-2026-8849201',
    estado: 'PENDIENTE',
    diasVencimiento: 16,
    colorBadge: 'VERDE',
    cups: '890201 · 381101',
    valorFacturado: 2450000,
    tarifaPactada: 2450000,
    numeroFev: 'FEV-99823',
    ips: {
      nit: '890987654-1',
      razonSocial: 'Clínica Las Américas S.A.',
      codigoHabilitacion: '050010123401'
    },
    paciente: {
      tipoDocumento: 'CC',
      numeroDocumento: '1037654321',
      nombre: 'Carmen Elisa Ramírez Gómez',
      edad: 58,
      genero: 'Femenino',
      regimen: 'Contributivo'
    },
    itemsCups: [
      { codigo: '890201', descripcion: 'CONSULTA DE PRIMERA VEZ POR MEDICINA GENERAL', cantidad: 1, valorUnitario: 85000, valorTotal: 85000, tarifaPactada: 85000, glosado: false },
      { codigo: '381101', descripcion: 'APICECTOMIA DE DIENTE ANTERIOR CON OBTURACION RETROGRADA', cantidad: 1, valorUnitario: 2365000, valorTotal: 2365000, tarifaPactada: 2365000, glosado: false }
    ],
    recomendacionIa: {
      monto: 0,
      causal: 'APROBADO_DIRECTO — Validación integral sintáctica y aritmética exitosa',
      codigoCausal: 'SIN_GLOSA',
      confianza: 0.98,
      normativa: 'Resolución 2284 de 2023 - Art. 12',
      motivo: 'Todos los soportes clínicos (epicrisis, hoja de evolución) coinciden plenamente con los procedimientos facturados en FEV y tarifas pactadas.'
    },
    soporteClinico: {
      tipoDocumento: 'EPICRISIS Y LIQUIDACION QUIRURGICA',
      folios: 4,
      resumenClinico: 'Paciente femenina de 58 años intervenida satisfactoriamente sin complicaciones intraoperatorias. Se adjunta consentimiento informado y registro anestésico completo.',
      boundingBox: null
    }
  },
  {
    id: 'ESC-02',
    nur: 'NUR-2026-8849202',
    estado: 'PENDIENTE',
    diasVencimiento: 3,
    colorBadge: 'ROJO',
    cups: '890201 · 893805',
    valorFacturado: 235000,
    tarifaPactada: 215000,
    numeroFev: 'A118492568',
    ips: {
      nit: '890900123-5',
      razonSocial: 'Hospital Universitario San Vicente Fundación',
      codigoHabilitacion: '050010098201'
    },
    paciente: {
      tipoDocumento: 'CC',
      numeroDocumento: '71982341',
      nombre: 'Jorge Iván Mejía Zuluaga',
      edad: 46,
      genero: 'Masculino',
      regimen: 'Subsidiado'
    },
    itemsCups: [
      { codigo: '890201', descripcion: 'CONSULTA MEDICINA GENERAL (URGENCIAS)', cantidad: 1, valorUnitario: 85000, valorTotal: 85000, tarifaPactada: 65000, glosado: true, montoGlosa: 20000 },
      { codigo: '893805', descripcion: 'ELECTROCARDIOGRAMA DE RITMO O DE DOCE DERIVACIONES', cantidad: 1, valorUnitario: 150000, valorTotal: 150000, tarifaPactada: 150000, glosado: false, montoGlosa: 0 }
    ],
    recomendacionIa: {
      monto: 20000,
      causal: 'GLOSA_PARCIAL — Causal 312: Tarifa facturada ($85.000) superior a la pactada en contrato SOAT ($65.000)',
      codigoCausal: 'TA0201',
      confianza: 0.94,
      normativa: 'Resolución 3047 de 2008 & Manual Tarifario ISS 2001 / SOAT Art. 89',
      motivo: 'Discrepancia detectada entre el valor unitario radicado en el item 1 ($85.000 COP) y el anexo técnico de tarifas pactadas para la IPS ($65.000 COP). Exceso liquidado: $20.000 COP.'
    },
    soporteClinico: {
      tipoDocumento: 'HOJA DE EVOLUCION QUIRURGICA Y FACTURA FEV',
      folios: 3,
      resumenClinico: 'Paciente masculino de 46 años remitido por urgencias con cuadro de dolor abdominal en fosa ilíaca derecha. Apendicectomía por laparotomía sin complicaciones.',
      boundingBox: {
        pagina: 3,
        x: 120,
        y: 340,
        width: 480,
        height: 65,
        label: 'Evidencia Glosa Causal 312: CUPS 890201 Facturado $85.000 vs Pactado $65.000',
        textoDetectado: '890201 CONSULTA MED GENERAL URGENCIAS ... FACT: $85,000.00 | TARIFA BASE PACTADA CONTRATO IPS-EPS: $65,000.00'
      }
    }
  },
  {
    id: 'ESC-03',
    nur: 'NUR-2026-8849203',
    estado: 'PENDIENTE',
    diasVencimiento: 8,
    colorBadge: 'AMARILLO',
    cups: '890701 · 902204',
    valorFacturado: 410000,
    tarifaPactada: 410000,
    numeroFev: 'FEV-11029',
    ips: {
      nit: '900345678-2',
      razonSocial: 'Centro Médico El Poblado IPS',
      codigoHabilitacion: '050010334401'
    },
    paciente: {
      tipoDocumento: 'CC',
      numeroDocumento: '43567890',
      nombre: 'Beatriz Eugenia Valenzuela',
      edad: 34,
      genero: 'Femenino',
      regimen: 'Contributivo'
    },
    itemsCups: [
      { codigo: '890701', descripcion: 'CONSULTA DE CONTROL POR ESPECIALISTA', cantidad: 1, valorUnitario: 130000, valorTotal: 130000, tarifaPactada: 130000, glosado: false, montoGlosa: 0 },
      { codigo: '902204', descripcion: 'HEMOGRAMA IV METODO AUTOMATICO', cantidad: 1, valorUnitario: 280000, valorTotal: 280000, tarifaPactada: 280000, glosado: true, montoGlosa: 280000 }
    ],
    recomendacionIa: {
      monto: 280000,
      causal: 'RECHAZO_NORMATIVO — Causal 204: Soporte clínico no corresponde a CUPS facturado en FEV / Falta FURIPS',
      codigoCausal: 'DE1601',
      confianza: 0.91,
      normativa: 'Resolución 2284 de 2023 & Decreto 780 de 2016 (Reclamaciones SOAT)',
      motivo: 'Cuenta radicada con evento de accidente de tránsito sin formulario FURIPS anexo ni reporte de laboratorio clínico que certifique la toma y procesamiento del hemograma IV.'
    },
    soporteClinico: {
      tipoDocumento: 'ATENCION INICIAL DE URGENCIAS',
      folios: 2,
      resumenClinico: 'Paciente femenina con politraumatismo leve por choque vehicular. No se anexa FURIPS ni resultado paraclínico de hemostasia.',
      boundingBox: {
        pagina: 2,
        x: 90,
        y: 210,
        width: 510,
        height: 55,
        label: 'Inconsistencia Normativa: Falta FURIPS y resultado de Hemograma IV',
        textoDetectado: 'ANEXOS REQUERIDOS: FURIPS DILIGENCIADO [NO APORTADO] | RESULTADO HEMOGRAMA IV [PENDIENTE]'
      }
    }
  }
];

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  cuentas = signal<CuentaAuditoria[]>(CASOS_INICIALES);
  isDemoHudOpen = signal<boolean>(false);
  mostrarEtiquetasUs = signal<boolean>(true);
  activeScenarioId = signal<string>('ESC-02');

  bandejaOrdenada = computed(() => {
    return this.cuentas().filter(c => c.estado === 'PENDIENTE').sort((a, b) => a.diasVencimiento - b.diasVencimiento);
  });

  getCuenta(nur: string) {
    return computed(() => this.cuentas().find(c => c.nur === nur));
  }

  toggleDemoHud() {
    this.isDemoHudOpen.update(v => !v);
  }

  setDemoHud(open: boolean) {
    this.isDemoHudOpen.set(open);
  }

  setScenario(id: string) {
    this.activeScenarioId.set(id);
  }

  ratificarGlosa(nur: string) {
    this.cuentas.update(list => list.map(c => c.nur === nur ? { ...c, estado: 'GLOSADA_NOTIFICADA' } : c));
  }

  sobreescribir(nur: string, justificacion: string) {
    this.cuentas.update(list => list.map(c => c.nur === nur ? { ...c, estado: 'LEVANTADA', justificacionMedica: justificacion } : c));
  }

  resetData() {
    this.cuentas.set(JSON.parse(JSON.stringify(CASOS_INICIALES)));
  }

  getGuiaDemoContexto(urlOrNur: string = ''): GuiaDemoContexto {
    const hint = (urlOrNur || '').toUpperCase();
    const scenario = this.activeScenarioId().toUpperCase();
    const target = hint.includes('BANDEJA') ? hint : (scenario || hint);
    const cuentasActuales = this.cuentas();

    // 1. BANDEJA DE ENTRADA O SIN CASO CONCRETO
    if (target.includes('BANDEJA') || (!target.includes('8849201') && !target.includes('8849202') && !target.includes('8849203') && !target.includes('ESC-'))) {
      return {
        titulo: 'Bandeja de Entrada · Priorización por Riesgo Legal (US-11 · US-17)',
        badge: {
          texto: 'US-11 · TRIAGE HITL INTELIGENTE',
          clase: 'bg-indigo-100 text-indigo-900 border-indigo-300'
        },
        caso: `${this.bandejaOrdenada().length} Cuentas en Triage Clínico (US-11 · US-08)`,
        norma: 'Resolución 2284 de 2023 · Términos Perentorios de 20 Días (US-17 · US-28)',
        diagnostico: 'La IA pre-clasificó las cuentas entrantes por criticidad temporal y riesgo económico según US-11 y US-08. El semáforo ROJO alerta sobre casos con solo 3 días restantes para formular glosas antes de su preclusión (US-17).',
        sustentoLegal: 'El Art. 12 de la Res. 2284 establece que si la aseguradora no formula glosas dentro del plazo de 20 días hábiles, la cuenta se entiende aprobada tácitamente (Straight-Through Forzado · US-17). Auditoría con trazabilidad inmutable de accesos al expediente (US-28).',
        accionSugerida: 'Haga clic en el caso crítico ESC-02 (Hospital San Vicente · 3 días) para inspeccionar la evidencia clínica y contractual en el visor Split-Screen (US-11).',
        pitch: 'Elimina el riesgo de aceptación tácita involuntaria (US-17) y organiza la carga del médico auditor por estricto impacto financiero y severidad clínica.',
        pasos: [
          {
            numero: 1,
            titulo: 'Triage de cuentas por criticidad legal (US-08 / US-17)',
            descripcion: 'Ordenamiento por días hábiles restantes de auditoría y semáforo Res. 2284',
            completado: true
          },
          {
            numero: 2,
            titulo: 'Selección de caso para auditoría HITL (US-11)',
            descripcion: 'Abrir expediente en visor interactivo Split-Screen 50/50',
            completado: false,
            activo: true
          },
          {
            numero: 3,
            titulo: 'Dictamen médico y notificación a IPS (US-12 / US-13 / US-20)',
            descripcion: 'Aprobar, ratificar glosa en 1 clic o sobreescribir con justificación forense',
            completado: false
          }
        ]
      };
    }

    // 2. CASO 1: ESC-01 / NUR-2026-8849201 (Limpio / Pre-Aprobación)
    if (target.includes('8849201') || target.includes('ESC-01')) {
      const cuenta = cuentasActuales.find(c => c.nur === 'NUR-2026-8849201');
      const aprobada = cuenta && cuenta.estado !== 'PENDIENTE';
      return {
        titulo: aprobada ? 'ESC-01 · Cuenta Aprobada Exitosamente (US-05 · US-11)' : 'ESC-01 · Cuenta Conforme · Pre-Aprobación IA (US-05 · US-14)',
        badge: {
          texto: aprobada ? 'US-05 · APROBADA STRAIGHT-THROUGH' : 'US-14 · SIN GLOSA (98% CONFIANZA RAG)',
          clase: 'bg-emerald-100 text-emerald-900 border-emerald-300'
        },
        caso: 'NUR-2026-8849201 · Clínica Las Américas (US-11 · Split-Screen)',
        norma: 'Resolución 2284 de 2023 - Art. 12 & Manual SOAT 2026 (US-14)',
        diagnostico: 'Cuenta médica por $2.450.000 COP con validación integral exitosa. El motor RAG normativo cruzó la epicrisis, la hoja de liquidación quirúrgica y las tarifas contractuales pactadas sin discrepancias (US-14 · US-05).',
        sustentoLegal: 'La documentación clínica soporta plenamente los procedimientos facturados en FEV según Anexo Técnico 3 Res. 2284. Expediente conforme habilitado para Straight-Through Processing (US-05).',
        accionSugerida: aprobada 
          ? 'Cuenta aprobada y enviada a tesorería. Traza forense inmutable registrada (US-20). Regrese a la bandeja para continuar.' 
          : 'Observe cómo la IA pre-aprobó con 98% de confianza y pulse "Aprobar Cuenta Médica" para liberar el pago de inmediato (US-05).',
        pitch: 'Reduce el tiempo de auditoría médica de 20 minutos a menos de 10 segundos en cuentas sin inconsistencias (Straight-Through Processing US-05).',
        pasos: [
          {
            numero: 1,
            titulo: 'Extracción de CUPS de epicrisis con OCR (US-14)',
            descripcion: 'Procedimientos coinciden 100% con FEV y soportes clínicos',
            completado: true
          },
          {
            numero: 2,
            titulo: 'Validación de tarifa contractual pactada (US-14 / US-19)',
            descripcion: 'Tarifas validadas contra SOAT 2026 y acuerdo de voluntades',
            completado: true
          },
          {
            numero: 3,
            titulo: 'Aprobación y autorización de pago (US-05 / US-20)',
            descripcion: aprobada ? 'Liberado a tesorería EPS con firma forense' : 'Listo para autorización médica directa',
            completado: !!aprobada,
            activo: !aprobada
          }
        ]
      };
    }

    // 3. CASO 2: ESC-02 / NUR-2026-8849202 (Glosa Parcial SOAT / Bounding Box)
    if (target.includes('8849202') || target.includes('ESC-02')) {
      const cuenta = cuentasActuales.find(c => c.nur === 'NUR-2026-8849202');
      const glosada = cuenta && cuenta.estado === 'GLOSADA_NOTIFICADA';
      return {
        titulo: glosada ? 'ESC-02 · Glosa Parcial Notificada (US-12 · US-20)' : 'ESC-02 · Discrepancia Tarifaria · Causal 312 (US-12 · US-14)',
        badge: {
          texto: glosada ? 'US-12 · GLOSA NOTIFICADA' : 'US-12 · RATIFICACIÓN 1-CLIC · GLOSA $20.000',
          clase: 'bg-rose-100 text-rose-900 border-rose-300'
        },
        caso: 'NUR-2026-8849202 · Hospital San Vicente Fundación (US-11 · Split-Screen)',
        norma: 'Manual Tarifario ISS 2001 / SOAT Art. 89 & Causal 312 MinSalud (US-14)',
        diagnostico: 'Se liquidó la Consulta de Urgencias (CUPS 890201) a $85.000 COP, cuando la tarifa pactada en contrato EPS-IPS es de $65.000 COP. La IA detectó sobrecosto de $20.000 COP y trazó el Bounding Box OCR en el folio quirúrgico (US-14).',
        sustentoLegal: 'Causal 312 de MinSalud: Valor facturado excede lo pactado contractualmente en el acuerdo de voluntades. Proceso habilitado para Ratificación 1-Clic (US-12).',
        accionSugerida: glosada 
          ? 'Glosa ratificada en 1-clic y transmitida electrónicamente a la IPS con traza inmutable (US-20). Plazo de 5 días de respuesta activado (US-17).' 
          : 'Observe el Bounding Box violeta en el visor izquierdo y el cruce contractual a la derecha. Haga clic en "✓ Ratificar Decisión · 1 Clic (US-12)".',
        pitch: 'Recuperación de sobrecostos asistida por IA con evidencia probatoria irrefutable estampada sobre la hoja clínica (US-12 · US-14).',
        pasos: [
          {
            numero: 1,
            titulo: 'Detección de exceso tarifario en CUPS 890201 (US-14)',
            descripcion: 'Discrepancia de $20.000 COP frente al contrato registrado',
            completado: true
          },
          {
            numero: 2,
            titulo: 'Trazado visual de Bounding Box OCR en Split-Screen (US-11)',
            descripcion: 'Coordenadas exactas en folio clínico visualizadas en visor izquierdo',
            completado: true
          },
          {
            numero: 3,
            titulo: 'Ratificación médica en 1-Clic y notificación a IPS (US-12 / US-20)',
            descripcion: glosada ? 'Notificación oficial despachada a prestador con traza SHA-256' : 'Pendiente de ratificación por médico auditor',
            completado: !!glosada,
            activo: !glosada
          }
        ]
      };
    }

    // 4. CASO 3: ESC-03 / NUR-2026-8849203 (Rechazo / Sin FURIPS)
    if (target.includes('8849203') || target.includes('ESC-03')) {
      const cuenta = cuentasActuales.find(c => c.nur === 'NUR-2026-8849203');
      const glosada = cuenta && cuenta.estado === 'GLOSADA_NOTIFICADA';
      const levantada = cuenta && cuenta.estado === 'LEVANTADA';
      return {
        titulo: glosada ? 'ESC-03 · Glosa Causal 204 Transmitida (US-12 · US-20)' : levantada ? 'ESC-03 · Glosa Sobreescrita Médicamente (US-13 · Forense)' : 'ESC-03 · Inconsistencia Normativa · Causal 204 (US-13 · US-14)',
        badge: {
          texto: levantada ? 'US-13 · SOBREESCRITA FORENSE' : glosada ? 'US-12 · GLOSADA $280.000' : 'US-13 · AUDITORÍA HITL REQUERIDA',
          clase: levantada ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'
        },
        caso: 'NUR-2026-8849203 · Centro Médico El Poblado IPS (US-11)',
        norma: 'Decreto 780 de 2016 (Reclamaciones SOAT) & Res. 2284 (US-14)',
        diagnostico: 'Factura radicada por accidente de tránsito que factura Hemograma IV ($280.000 COP), pero el paquete no contiene el formulario obligatorio FURIPS ni reporte de laboratorio emitido.',
        sustentoLegal: 'Causal 204: Soporte clínico no corresponde a CUPS facturado en FEV / Ausencia de documentos esenciales de reclamación SOAT. Aplica Sobreescritura Forense con justificación médica ≥ 50 caracteres (US-13).',
        accionSugerida: glosada 
          ? 'Glosa notificada a la IPS requiriendo el envío de FURIPS y resultado de laboratorio con traza inmutable (US-20).' 
          : levantada 
            ? 'El auditor sobreescribió la causal con dictamen médico forense justificado (US-13).' 
            : 'Haga clic en "Sobreescribir Decisión (US-13)" e ingrese una justificación médica (≥ 50 caracteres) o ratifique la glosa en 1 clic (US-12).',
        pitch: 'Control de pertinencia y documentación estricta: evita pagos indebidos en reclamaciones de accidentes de tránsito con blindaje forense (US-13).',
        pasos: [
          {
            numero: 1,
            titulo: 'Checklist documental de reclamación SOAT (US-14)',
            descripcion: 'Detección de ausencia de FURIPS y reporte de laboratorio',
            completado: true
          },
          {
            numero: 2,
            titulo: 'Cálculo de glosa causal 204 ($280.000) (US-14)',
            descripcion: 'Recomendación de glosa por soporte clínico incompleto',
            completado: true
          },
          {
            numero: 3,
            titulo: 'Dictamen médico final (US-12 Ratificación / US-13 Sobreescritura)',
            descripcion: (glosada || levantada) ? 'Dictamen emitido formalmente con traza forense (US-20)' : 'Pendiente de ratificación o sobreescritura médica',
            completado: !!(glosada || levantada),
            activo: !(glosada || levantada)
          }
        ]
      };
    }

    // 5. ESC-04: Factura Sin CUV
    if (target.includes('ESC-04')) {
      return {
        titulo: 'ESC-04 · Factura Sin CUV · Rechazo Res. 0948/2026 (US-01 · US-02)',
        badge: {
          texto: 'US-01 · RECHAZO RADICACIÓN',
          clase: 'bg-rose-100 text-rose-900 border-rose-300'
        },
        caso: 'ESC-04 · Clínica Versalles S.A. (Rechazo Pre-Radicación)',
        norma: 'Resolución 0948 de 2026 - Art. 3.1 & Regla de Negocio RN-01',
        diagnostico: 'La factura FEV-771920 carece del Código Único de Validación (CUV) previo expedido por MinSalud. Bloqueo inmediato sin generar NUR (US-01).',
        sustentoLegal: 'Art. 3.1: No se entenderá radicada ninguna factura sin CUV previo; no corren términos de pago ni de 20 días hábiles para la EPS.',
        accionSugerida: 'Genere constancia de rechazo inmediato para devolución a la IPS prestadora sin alterar bandejas de auditoría médica.',
        pitch: 'Blindaje jurídico total ante glosas extemporáneas o investigaciones de la SuperSalud (US-01).',
        pasos: [
          { numero: 1, titulo: 'Validación de CUV MinSalud (US-01)', descripcion: 'Falta CUV en cabecera XML Dian/MinSalud', completado: true },
          { numero: 2, titulo: 'Bloqueo legal de NUR (US-02)', descripcion: 'Aplicación estricta Res. 0948/2026', completado: true },
          { numero: 3, titulo: 'Constancia técnica de rechazo (US-01)', descripcion: 'Devolución formal sin iniciar plazos', completado: true }
        ]
      };
    }

    // 6. ESC-05: Ciclo 5-5-5 y Preclusión
    if (target.includes('ESC-05')) {
      return {
        titulo: 'ESC-05 · Ciclo 5-5-5 y Preclusión de Devolución (US-03 · US-04)',
        badge: {
          texto: 'US-03 · DEVOLUCIÓN RES. 2284',
          clase: 'bg-orange-100 text-orange-900 border-orange-300'
        },
        caso: 'ESC-05 · Hospital Departamental (Causal DE4401)',
        norma: 'Resolución 2284 de 2023 - Art. 6 (Términos de Devolución 5-5-5)',
        diagnostico: 'Causal DE4401 (Contrato Vencido). La devolución formal a la IPS debe formularse dentro de los primeros 5 días hábiles siguientes a la radicación. Al día 6 la causal precluye irrevocablemente.',
        sustentoLegal: 'Art. 6 Res. 2284: Pasados 5 días hábiles sin formular devolución, la aseguradora pierde la facultad y debe auditar ordinariamente.',
        accionSugerida: 'Observe el temporizador perentorio y cómo el sistema bloquea devoluciones si se superan los 5 días hábiles.',
        pitch: 'Monitoreo de caducidad jurídica en tiempo real para evitar pérdida de derechos de defensa de la aseguradora.',
        pasos: [
          { numero: 1, titulo: 'Identificación de causal de devolución (US-03)', descripcion: 'Contrato vencido detectado en FEV', completado: true },
          { numero: 2, titulo: 'Cálculo de días de ventana 5-5-5 (US-04)', descripcion: 'Verificación de plazo de 5 días hábiles', completado: true },
          { numero: 3, titulo: 'Fórmula de devolución oportuna (US-03)', descripcion: 'Evita la preclusión del derecho', completado: true }
        ]
      };
    }

    // 7. ESC-06: Aceptación Tácita Legal
    return {
      titulo: 'ESC-06 · Aceptación Tácita Legal · Día 21+ (US-17 · US-24)',
      badge: {
        texto: 'US-17 · TÍTULO VALOR EJECUTIVO',
        clase: 'bg-amber-100 text-amber-900 border-amber-300'
      },
      caso: 'ESC-06 · Clínica del Occidente (Término Perentorio Vencido)',
      norma: 'Ley 1438 de 2011 Art. 57 & Decreto 441 de 2022 (US-17)',
      diagnostico: 'Cumplidos los 20 días hábiles posteriores a la radicación sin notificación de glosa válida, opera la aceptación tácita por ministerio de la ley. La factura adquiere mérito ejecutivo como Título Valor.',
      sustentoLegal: 'Art. 57 Ley 1438: Preclusión absoluta de glosar. La EPS debe ordenar el pago en tesorería sin descuentos.',
      accionSugerida: 'Demuestre cómo el software deshabilita la imposición de glosas extemporáneas y remite la orden directa a Tesorería (US-24).',
      pitch: 'Auditoría preventiva que garantiza no incurrir en pagos de intereses de mora por vencimiento de términos legales (US-17).',
      pasos: [
        { numero: 1, titulo: 'Control cronológico de 20 días hábiles (US-17)', descripcion: 'Vencimiento de plazos normativos', completado: true },
        { numero: 2, titulo: 'Bloqueo legal de glosas tardías (US-17)', descripcion: 'Imposibilidad jurídica de objetar', completado: true },
        { numero: 3, titulo: 'Pase automático a pago en tesorería (US-24)', descripcion: 'Emisión de Título Valor ejecutivo', completado: true }
      ]
    };
  }
}
