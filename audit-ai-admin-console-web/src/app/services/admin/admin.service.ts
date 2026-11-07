import { Injectable, signal, computed } from '@angular/core';

export interface Contrato {
  id: number;
  tenantSchema: string;
  ips: string;
  nit: string;
  modalidad: 'EVENTO' | 'CAPITA' | 'PAGO GLOBAL PROSPECTIVO';
  manual: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  reglasEspeciales: string;
}

export interface CausalGlosa {
  codigo: string;
  descripcion: string;
  porcentaje: number;
  cuentas: number;
}

export interface Tenant {
  id: string;
  name: string;
  nit: string;
  schema: string;
  s3Bucket: string;
  status: 'ACTIVO' | 'PENDIENTE' | 'CREANDO';
  cuentasAuditadas: number;
}

export interface KpiAnalitica {
  tasaAutoAprobacion: number;
  tiempoPromedioSegundos: number;
  cumplimientoNormativo2284: number;
  totalGlosasRecuperadasCop: number;
  roiEstimado: number;
  glosasTacitasVencidas: number;
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
  modulo: string;
  tenant: string;
  norma: string;
  diagnostico: string;
  sustentoLegal: string;
  accionSugerida: string;
  pitch: string;
  pasos: GuiaDemoPaso[];
}

export type PerfilAdmin = 'SUPERADMIN' | 'ADMIN_TENANT';

@Injectable({ providedIn: 'root' })
export class AdminService {
  tenantActivo = signal('tenant_sos');
  perfil = signal<PerfilAdmin>('SUPERADMIN');
  isDemoHudOpen = signal(false);
  mostrarEtiquetasUs = signal(true);
  puedeCambiarTenant = computed(() => this.perfil() === 'SUPERADMIN');

  private readonly kpisPorTenant: Record<string, KpiAnalitica> = {
    tenant_sos: {
      tasaAutoAprobacion: 68,
      tiempoPromedioSegundos: 42,
      cumplimientoNormativo2284: 99.4,
      totalGlosasRecuperadasCop: 845200000,
      roiEstimado: 8.4,
      glosasTacitasVencidas: 0
    },
    tenant_neps: {
      tasaAutoAprobacion: 74,
      tiempoPromedioSegundos: 38,
      cumplimientoNormativo2284: 97.8,
      totalGlosasRecuperadasCop: 2184600000,
      roiEstimado: 11.2,
      glosasTacitasVencidas: 3
    }
  };

  private readonly causalesPorTenant: Record<string, CausalGlosa[]> = {
    tenant_sos: [
      { codigo: '312', descripcion: 'Tarifa liquidada superior a la pactada', porcentaje: 42, cuentas: 596 },
      { codigo: '415', descripcion: 'Procedimiento sin autorización previa', porcentaje: 28, cuentas: 398 },
      { codigo: '224', descripcion: 'Soporte clínico o epicrisis incompleto', porcentaje: 18, cuentas: 256 },
      { codigo: '101', descripcion: 'Código CUPS no concuerda con diagnóstico CIE-10', porcentaje: 12, cuentas: 170 }
    ],
    tenant_neps: [
      { codigo: '415', descripcion: 'Procedimiento sin autorización previa', porcentaje: 38, cuentas: 1478 },
      { codigo: '312', descripcion: 'Tarifa liquidada superior a la pactada', porcentaje: 31, cuentas: 1206 },
      { codigo: '101', descripcion: 'Código CUPS no concuerda con diagnóstico CIE-10', porcentaje: 19, cuentas: 739 },
      { codigo: '224', descripcion: 'Soporte clínico o epicrisis incompleto', porcentaje: 12, cuentas: 467 }
    ]
  };

  tenants = signal<Tenant[]>([
    { 
      id: '1', 
      name: 'Servicio Occidental de Salud (SOS EPS)', 
      nit: '805.001.157-2', 
      schema: 'tenant_sos', 
      s3Bucket: 's3://ibs-audit-ai-tenant-sos-prod',
      status: 'ACTIVO',
      cuentasAuditadas: 1420
    },
    { 
      id: '2', 
      name: 'Nueva EPS S.A.', 
      nit: '900.156.264-2', 
      schema: 'tenant_neps', 
      s3Bucket: 's3://ibs-audit-ai-tenant-neps-prod',
      status: 'ACTIVO',
      cuentasAuditadas: 3890
    },
    { 
      id: '3', 
      name: 'Salud Total EPS-S', 
      nit: '800.130.907-4', 
      schema: 'tenant_stot', 
      s3Bucket: 's3://ibs-audit-ai-tenant-stot-stg',
      status: 'PENDIENTE',
      cuentasAuditadas: 0
    }
  ]);

  contratos = signal<Contrato[]>([
    {
      id: 1,
      tenantSchema: 'tenant_sos',
      ips: 'Clínica Valle del Lili',
      nit: '890.301.245-1',
      modalidad: 'EVENTO',
      manual: 'SOAT 2026 Pleno',
      vigenciaDesde: '2026-01-01',
      vigenciaHasta: '2027-01-01',
      reglasEspeciales: 'Auditoría estricta de materiales de osteosíntesis y prótesis con Bounding Box obligatorio.'
    },
    {
      id: 2,
      tenantSchema: 'tenant_sos',
      ips: 'Clínica Imbanaco',
      nit: '805.001.157-2',
      modalidad: 'EVENTO',
      manual: 'SOAT 2026 + 5% Quirúrgico',
      vigenciaDesde: '2026-01-01',
      vigenciaHasta: '2027-01-01',
      reglasEspeciales: 'Derechos de sala tipo 2 liquidados al 105% de tarifa SOAT. Requiere validación de folio quirúrgico.'
    },
    {
      id: 3,
      tenantSchema: 'tenant_sos',
      ips: 'Hospital Universitario del Valle',
      nit: '890.399.010-8',
      modalidad: 'PAGO GLOBAL PROSPECTIVO',
      manual: 'ISS 2001 + 15%',
      vigenciaDesde: '2026-01-01',
      vigenciaHasta: '2027-01-01',
      reglasEspeciales: 'Atención de trauma y alta complejidad con reporte de estancia en UCI.'
    },
    {
      id: 4,
      tenantSchema: 'tenant_neps',
      ips: 'Hospital San Vicente Fundación',
      nit: '890.900.043-8',
      modalidad: 'EVENTO',
      manual: 'SOAT 2026 + 8% Urgencias',
      vigenciaDesde: '2026-01-01',
      vigenciaHasta: '2026-12-31',
      reglasEspeciales: 'Consulta de urgencias CUPS 890201 a tarifa pactada $65.000. Autorización previa obligatoria fuera de red.'
    },
    {
      id: 5,
      tenantSchema: 'tenant_neps',
      ips: 'Clínica Las Américas S.A.',
      nit: '890.900.123-4',
      modalidad: 'EVENTO',
      manual: 'ISS 2001 + 25%',
      vigenciaDesde: '2026-01-01',
      vigenciaHasta: '2027-01-01',
      reglasEspeciales: 'Red nacional. Cirugías de alta complejidad con tope de materiales implantables.'
    },
    {
      id: 6,
      tenantSchema: 'tenant_neps',
      ips: 'Centro Médico Farallones',
      nit: '805.012.441-1',
      modalidad: 'CAPITA',
      manual: 'Capitación PGP 2026',
      vigenciaDesde: '2026-01-01',
      vigenciaHasta: '2026-12-31',
      reglasEspeciales: 'Población asignada Cali-oriente. RIPS en cero (RVC034); no cruza valor vs ítems.'
    }
  ]);

  private readonly volumenIpsPorTenant: Record<string, { ips: string; cuentas: number }[]> = {
    tenant_sos: [
      { ips: 'Clínica Valle del Lili', cuentas: 620 },
      { ips: 'Clínica Imbanaco', cuentas: 480 },
      { ips: 'Hospital Universitario del Valle', cuentas: 320 }
    ],
    tenant_neps: [
      { ips: 'Hospital San Vicente Fundación', cuentas: 1680 },
      { ips: 'Clínica Las Américas S.A.', cuentas: 1420 },
      { ips: 'Centro Médico Farallones', cuentas: 790 }
    ]
  };

  kpis = computed(() => this.kpisPorTenant[this.tenantActivo()] ?? this.kpisPorTenant['tenant_sos']);
  causalesActivas = computed(() => this.causalesPorTenant[this.tenantActivo()] ?? this.causalesPorTenant['tenant_sos']);
  tenantEnPantalla = computed(() => this.tenants().find(t => t.schema === this.tenantActivo()) ?? this.tenants()[0]);
  contratosDelTenant = computed(() => this.contratos().filter(c => c.tenantSchema === this.tenantActivo()));
  volumenCartera = computed(
    () => this.volumenIpsPorTenant[this.tenantActivo()] ?? this.volumenIpsPorTenant['tenant_sos']
  );
  tenantsVisibles = computed(() =>
    this.puedeCambiarTenant() ? this.tenants() : this.tenants().filter(t => t.schema === this.tenantActivo())
  );

  iniciarSesion(perfil: PerfilAdmin, tenantSchema: string) {
    this.perfil.set(perfil);
    this.tenantActivo.set(tenantSchema);
  }

  cambiarTenant(schema: string) {
    if (!this.puedeCambiarTenant()) {
      return;
    }
    this.tenantActivo.set(schema);
  }

  agregarContrato(c: Omit<Contrato, 'id' | 'tenantSchema'>) {
    this.contratos.update(list => [...list, { ...c, id: Date.now(), tenantSchema: this.tenantActivo() }]);
  }
  
  agregarTenant(t: Omit<Tenant, 'id' | 'cuentasAuditadas'>) {
    if (!this.puedeCambiarTenant()) {
      return;
    }
    this.tenants.update(list => [...list, { ...t, id: Math.random().toString(), cuentasAuditadas: 0 }]);
  }

  toggleDemoHud() {
    this.isDemoHudOpen.update(v => !v);
  }

  resetData() {
    if (this.puedeCambiarTenant()) {
      this.tenantActivo.set('tenant_sos');
    }
    this.isDemoHudOpen.set(false);
    this.tenants.set([
      { 
        id: '1', 
        name: 'Servicio Occidental de Salud (SOS EPS)', 
        nit: '805.001.157-2', 
        schema: 'tenant_sos', 
        s3Bucket: 's3://ibs-audit-ai-tenant-sos-prod',
        status: 'ACTIVO',
        cuentasAuditadas: 1420
      },
      { 
        id: '2', 
        name: 'Nueva EPS S.A.', 
        nit: '900.156.264-2', 
        schema: 'tenant_neps', 
        s3Bucket: 's3://ibs-audit-ai-tenant-neps-prod',
        status: 'ACTIVO',
        cuentasAuditadas: 3890
      },
      { 
        id: '3', 
        name: 'Salud Total EPS-S', 
        nit: '800.130.907-4', 
        schema: 'tenant_stot', 
        s3Bucket: 's3://ibs-audit-ai-tenant-stot-stg',
        status: 'PENDIENTE',
        cuentasAuditadas: 0
      }
    ]);
    this.contratos.set([
      {
        id: 1,
        tenantSchema: 'tenant_sos',
        ips: 'Clínica Valle del Lili',
        nit: '890.301.245-1',
        modalidad: 'EVENTO',
        manual: 'SOAT 2026 Pleno',
        vigenciaDesde: '2026-01-01',
        vigenciaHasta: '2027-01-01',
        reglasEspeciales: 'Auditoría estricta de materiales de osteosíntesis y prótesis con Bounding Box obligatorio.'
      },
      {
        id: 2,
        tenantSchema: 'tenant_sos',
        ips: 'Clínica Imbanaco',
        nit: '805.001.157-2',
        modalidad: 'EVENTO',
        manual: 'SOAT 2026 + 5% Quirúrgico',
        vigenciaDesde: '2026-01-01',
        vigenciaHasta: '2027-01-01',
        reglasEspeciales: 'Derechos de sala tipo 2 liquidados al 105% de tarifa SOAT. Requiere validación de folio quirúrgico.'
      },
      {
        id: 3,
        tenantSchema: 'tenant_sos',
        ips: 'Hospital Universitario del Valle',
        nit: '890.399.010-8',
        modalidad: 'PAGO GLOBAL PROSPECTIVO',
        manual: 'ISS 2001 + 15%',
        vigenciaDesde: '2026-01-01',
        vigenciaHasta: '2027-01-01',
        reglasEspeciales: 'Atención de trauma y alta complejidad con reporte de estancia en UCI.'
      },
      {
        id: 4,
        tenantSchema: 'tenant_neps',
        ips: 'Hospital San Vicente Fundación',
        nit: '890.900.043-8',
        modalidad: 'EVENTO',
        manual: 'SOAT 2026 + 8% Urgencias',
        vigenciaDesde: '2026-01-01',
        vigenciaHasta: '2026-12-31',
        reglasEspeciales: 'Consulta de urgencias CUPS 890201 a tarifa pactada $65.000. Autorización previa obligatoria fuera de red.'
      },
      {
        id: 5,
        tenantSchema: 'tenant_neps',
        ips: 'Clínica Las Américas S.A.',
        nit: '890.900.123-4',
        modalidad: 'EVENTO',
        manual: 'ISS 2001 + 25%',
        vigenciaDesde: '2026-01-01',
        vigenciaHasta: '2027-01-01',
        reglasEspeciales: 'Red nacional. Cirugías de alta complejidad con tope de materiales implantables.'
      },
      {
        id: 6,
        tenantSchema: 'tenant_neps',
        ips: 'Centro Médico Farallones',
        nit: '805.012.441-1',
        modalidad: 'CAPITA',
        manual: 'Capitación PGP 2026',
        vigenciaDesde: '2026-01-01',
        vigenciaHasta: '2026-12-31',
        reglasEspeciales: 'Población asignada Cali-oriente. RIPS en cero (RVC034); no cruza valor vs ítems.'
      }
    ]);
  }

  getGuiaDemoContexto(url: string = ''): GuiaDemoContexto {
    const activeTenantName = this.tenantActivo() === 'tenant_sos' 
      ? 'Servicio Occidental de Salud (SOS EPS)' 
      : this.tenantActivo() === 'tenant_neps' 
        ? 'Nueva EPS S.A.' 
        : 'Salud Total EPS-S';
    const activeSchema = this.tenantActivo();

    // 1. PESTAÑA CONTRATOS Y TARIFAS (US-19 / US-08)
    if (url.includes('contratos')) {
      return {
        titulo: 'US-19 · Consola de Contratos, Tarifas y Reglas Especiales',
        badge: {
          texto: '📑 US-19 · GOBERNANZA TARIFARIA',
          clase: 'bg-emerald-100 text-emerald-900 border-emerald-300'
        },
        modulo: 'US-19 (Contratos & Habilitación) · US-08 (Cruce Tarifario)',
        tenant: activeTenantName,
        norma: 'Decreto 441 de 2022 & Res. 2284 (US-19 / US-08 / RN-TAR-01)',
        diagnostico: `Red contractual de ${activeTenantName} (${this.contratosDelTenant().length} acuerdos en ${activeSchema}). Al conmutar el tenant, la tabla cambia de IPS: SOS muestra Valle del Lili / Imbanaco / HUV; Nueva EPS muestra San Vicente / Las Américas / Farallones.`,
        sustentoLegal: 'Decreto 441 de 2022 & US-19: Obligatoriedad de parametrizar modalidades de pago (Evento, PGP, Cápita), tarifas por sede de habilitación REPS y reglas de auditoría especiales.',
        accionSugerida: 'Demuestre la vinculación directa entre la regla de US-19 y el visor HITL (US-08), o utilice el formulario "Registrar Nuevo Contrato" para simular el alta de una IPS en vivo.',
        pitch: 'Cero divergencias entre el acuerdo jurídico firmado y la regla algorítmica de auditoría en la nube.',
        pasos: [
          {
            numero: 1,
            titulo: 'Parametrización de manuales base SOAT / ISS (US-19)',
            descripcion: '3 contratos vigentes con modalidades Evento y PGP',
            completado: true
          },
          {
            numero: 2,
            titulo: 'Vinculación de reglas de auditoría al visor HITL (US-08)',
            descripcion: 'Regla de Imbanaco reflejada en Bounding Box de visor',
            completado: true
          },
          {
            numero: 3,
            titulo: 'Alta interactiva de nuevos acuerdos con IPS (US-19)',
            descripcion: 'Creación instantánea sin reiniciar servicios',
            completado: false,
            activo: true
          }
        ]
      };
    }

    // 2. PESTAÑA TENANTS Y S3 (US-21 / US-02 / US-34)
    if (url.includes('tenants')) {
      return {
        titulo: 'US-21 · Aprovisionamiento y Aislamiento Multi-Tenant',
        badge: {
          texto: '🏢 US-21 · GESTIÓN TENANTS EPS',
          clase: 'bg-indigo-100 text-indigo-900 border-indigo-300'
        },
        modulo: `US-21 (Aprovisionamiento) · US-02 (Aislamiento ${activeSchema})`,
        tenant: activeTenantName,
        norma: 'Ley 1581 de 2012 (Habeas Data) & ISO 27001 (US-02 / US-21)',
        diagnostico: `Aislamiento estricto de base de datos por esquema dedicado en PostgreSQL (${activeSchema}) y buckets AWS S3 independientes con llaves KMS rotadas cada 90 días. Cumple con el criterio US-02 de cero fuga de datos clínicos entre aseguradoras competidoras.`,
        sustentoLegal: 'US-21 & US-02: El Operador Central de IBS da de alta entidades pagadoras (EPS) generando automáticamente su espacio de datos segregado sin intervención manual sobre bases de datos.',
        accionSugerida: 'Conmute el Tenant Activo arriba para ver cómo se aísla la carga de datos (US-02), o presione "Aprovisionar Nuevo Tenant EPS" para ejecutar el pipeline guiado de alta (US-21).',
        pitch: 'Arquitectura Enterprise SaaS multi-inquilino lista para despliegues masivos sin riesgo de contaminación cruzada.',
        pasos: [
          {
            numero: 1,
            titulo: 'Aislamiento de bases de datos por esquema (US-02)',
            descripcion: 'Esquemas independientes por tenant EPS en PostgreSQL',
            completado: true
          },
          {
            numero: 2,
            titulo: 'Buckets S3 dedicados con cifrado KMS (US-02)',
            descripcion: 'Custodia segregada de soportes clínicos en la nube',
            completado: true
          },
          {
            numero: 3,
            titulo: 'Pipeline guiado de aprovisionamiento de EPS (US-21)',
            descripcion: 'Alta en 4 fases: DB, S3, Cognito/Auth y Activación',
            completado: false,
            activo: true
          }
        ]
      };
    }

    // 3. DASHBOARD ANALÍTICA (US-18 / US-20)
    const kpi = this.kpis();
    const cuentasTenant = this.tenantEnPantalla().cuentasAuditadas;
    const glosasMiles = (kpi.totalGlosasRecuperadasCop / 1_000_000).toFixed(1);
    return {
      titulo: 'US-18 · Tableros de Operación, Exposición Jurídica y ROI',
      badge: {
        texto: '📊 US-18 · ANALÍTICA & GOBIERNO',
        clase: 'bg-violet-100 text-violet-900 border-violet-300'
      },
      modulo: 'US-18 (Tableros Ejecutivos) · US-20 (Traza Forense)',
      tenant: activeTenantName,
      norma: 'Resolución 2284 de 2023 · Cumplimiento de Plazos & ROI (US-18)',
      diagnostico: `Cartera aislada de ${activeTenantName}: ${cuentasTenant.toLocaleString('es-CO')} cuentas en el esquema ${activeSchema}. Auto-aprobación ${kpi.tasaAutoAprobacion}% en ${kpi.tiempoPromedioSegundos} s/cuenta. Glosas recuperadas $${glosasMiles} M COP (ROI ${kpi.roiEstimado}x). Las cifras de otra EPS no se mezclan.`,
      sustentoLegal: `US-18 y US-02: el gerente solo ve el dinero objetado, el cumplimiento Res. 2284 (${kpi.cumplimientoNormativo2284}%) y las glosas tácitas (${kpi.glosasTacitasVencidas}) del tenant activo.`,
        accionSugerida: this.puedeCambiarTenant()
          ? 'Conmute la EPS en la pantalla entre "SOS EPS" y "Nueva EPS". Deben cambiar KPIs, mix de causales, volumen y contratos de red.'
          : 'Este perfil de admin de tenant solo ve la cartera de su EPS. No hay conmutador hacia otra aseguradora.',
      pitch: `$${glosasMiles} M COP recuperados en este tenant y ROI ${kpi.roiEstimado}x. El aislamiento impide contaminar la cartera de una EPS con la de otra.`,
      pasos: [
        {
          numero: 1,
          titulo: `Auto-aprobación ${kpi.tasaAutoAprobacion}% · ${cuentasTenant.toLocaleString('es-CO')} cuentas`,
          descripcion: `Esquema ${activeSchema} · ${kpi.tiempoPromedioSegundos} s por cuenta`,
          completado: true
        },
        {
          numero: 2,
          titulo: `Cumplimiento Res. 2284 ${kpi.cumplimientoNormativo2284}%`,
          descripcion: kpi.glosasTacitasVencidas === 0 ? 'Cero glosas tácitas vencidas en este tenant' : `${kpi.glosasTacitasVencidas} alertas de término en este tenant`,
          completado: true
        },
        {
          numero: 3,
          titulo: `Recuperación $${glosasMiles} M COP · ROI ${kpi.roiEstimado}x`,
          descripcion: 'Solo la cartera del tenant en pantalla (US-20)',
          completado: true
        }
      ]
    };
  }
}
