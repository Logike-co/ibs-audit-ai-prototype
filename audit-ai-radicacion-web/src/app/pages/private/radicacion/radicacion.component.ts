import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  MAPA_DOCUMENTOS_CONTRATO,
  RadicacionService,
  ScenarioCarga,
  TipoContratoRadicacion
} from '../../../services/radicacion/radicacion.service';

@Component({
  selector: 'app-radicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './radicacion.component.html'
})
export class RadicacionComponent {
  radicacionService = inject(RadicacionService);
  router = inject(Router);

  paquete = this.radicacionService.loteActivo;
  semaforo = this.radicacionService.estadoSemaforo;
  mapaDocumentos = MAPA_DOCUMENTOS_CONTRATO;

  archivoSeleccionado = false;
  tipoContrato: TipoContratoRadicacion | '' = '';
  
  // RN-RAD-01 (Mesa 06-Nov): Conteo numérico en tiempo real de facturas leídas
  procesandoZip = false;
  facturasLeidasCount = 0;
  totalItemsLeidosCount = 0;

  seleccionarArchivo(event: Event) {
    this.archivoSeleccionado = true;
    this.procesandoZip = true;
    this.facturasLeidasCount = 0;
    this.totalItemsLeidosCount = 0;

    // Simulación reactiva progresiva de lectura de ZIP (RN-RAD-01)
    const interval = setInterval(() => {
      if (this.facturasLeidasCount < 18) {
        this.facturasLeidasCount += 3;
        this.totalItemsLeidosCount += 14;
      } else {
        clearInterval(interval);
        this.procesandoZip = false;
      }
    }, 120);
  }

  cargar() {
    if (!this.tipoContrato) {
      return;
    }
    this.radicacionService.cargarArchivos(this.tipoContrato);
  }

  cargarPreset(scenario: ScenarioCarga) {
    this.radicacionService.cargarPreset(scenario);
  }

  descargarConstanciaRechazo() {
    alert('Descargando Constancia Oficial de Rechazo por Falta de CUV (Res. 0948 de 2026 Art. 3.1) en PDF.');
  }

  verRechazoEnHistorial() {
    this.radicacionService.registrarRechazoEnHistorial();
    void this.router.navigate(['/radicaciones']);
  }

  radicar() {
    this.radicacionService.cerrarLote();
  }

  descargarPdf() {
    this.radicacionService.descargarCertificado();
  }

  nuevaCarga() {
    this.radicacionService.loteActivo.set(null);
    this.archivoSeleccionado = false;
  }
}
