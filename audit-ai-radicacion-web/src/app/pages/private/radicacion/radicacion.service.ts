import { Injectable, signal, computed } from '@angular/core';

export interface Lote {
  numero: string;
  eps: string;
  totalCuentas: number;
  totalBruto: number;
  descuentos: number;
  netoFacturado: number;
  archivoSoporte: string;
}

export interface CuentaGlosada {
  nur: string;
  paciente: string;
  factura: string;
  causal: string;
  monto: number;
  estado: 'PENDIENTE_RESPUESTA' | 'RESPONDIDA';
  diasHabilesRestantes: number;
}

@Injectable({ providedIn: 'root' })
export class RadicacionService {
  loteActual = signal<Lote | null>({
    numero: '2026-09-13-001', eps: 'SOS EPS', totalCuentas: 48,
    totalBruto: 186480000, descuentos: 80000, netoFacturado: 186400000,
    archivoSoporte: 'rip_sos_lote1.zip'
  });

  archivoSintacticoReemplazado = signal(false);

  validezLote = computed(() => {
    const lote = this.loteActual();
    if (!lote) return { valido: false, mensaje: 'No hay lote.' };
    const netoReal = lote.totalBruto - lote.descuentos;
    if (netoReal !== lote.netoFacturado && !this.archivoSintacticoReemplazado()) {
      return { valido: false, mensaje: `Error Sintáctico: El valor neto facturado (${lote.netoFacturado}) no concuerda con Total (${lote.totalBruto}) - Descuentos (${lote.descuentos}).` };
    }
    return { valido: true, mensaje: 'Validación de estructura correcta. Listo para cierre inmutable.' };
  });

  cuentasGlosadas = signal<CuentaGlosada[]>([
    { nur: 'NUR-2026-8849202', paciente: 'María Fernanda Gómez', factura: 'FEV-2026-9912', causal: 'TA0201 / 312 - Tarifa liquidada excede manual SOAT 2026 + 5% pactado para Derechos de Sala Tipo 2', monto: 1450000, estado: 'PENDIENTE_RESPUESTA', diasHabilesRestantes: 11 },
    { nur: 'NUR-2026-8849203', paciente: 'Carlos Arturo Restrepo', factura: 'FEV-2026-9915', causal: 'AU0101 / 415 - Procedimiento secundario no cubierto por autorización previa de la EPS', monto: 950000, estado: 'PENDIENTE_RESPUESTA', diasHabilesRestantes: 4 }
  ]);

  cuentasGlosadasPendientes = computed(() => this.cuentasGlosadas().filter(c => c.estado === 'PENDIENTE_RESPUESTA'));

  cerrarLote() {
    return {
      nurAsignado: 'NUR-SOS-2026-0004999',
      hashSHA256: 'SHA256:8f3a8b2c4d5e917fa00b73c21e4918237d89ac02fe38b1d9c490a612ef49c21e',
      fechaEmision: new Date().toISOString()
    };
  }

  radicarRespuesta(nur: string, accion: string) {
    this.cuentasGlosadas.update(list => list.map(c => c.nur === nur ? { ...c, estado: 'RESPONDIDA' } : c));
    return { acta: `ACTA-CONC-2026-${Math.floor(1000 + Math.random() * 9000)}`, nur };
  }

  resetData() {
    this.loteActual.set({
      numero: '2026-09-13-001', eps: 'SOS EPS', totalCuentas: 48,
      totalBruto: 186480000, descuentos: 80000, netoFacturado: 186400000,
      archivoSoporte: 'rip_sos_lote1.zip'
    });
    this.archivoSintacticoReemplazado.set(false);
    this.cuentasGlosadas.set([
      { nur: 'NUR-2026-8849202', paciente: 'María Fernanda Gómez', factura: 'FEV-2026-9912', causal: 'TA0201 / 312 - Tarifa liquidada excede manual SOAT 2026 + 5% pactado para Derechos de Sala Tipo 2', monto: 1450000, estado: 'PENDIENTE_RESPUESTA', diasHabilesRestantes: 11 },
      { nur: 'NUR-2026-8849203', paciente: 'Carlos Arturo Restrepo', factura: 'FEV-2026-9915', causal: 'AU0101 / 415 - Procedimiento secundario no cubierto por autorización previa de la EPS', monto: 950000, estado: 'PENDIENTE_RESPUESTA', diasHabilesRestantes: 4 }
    ]);
  }
}
