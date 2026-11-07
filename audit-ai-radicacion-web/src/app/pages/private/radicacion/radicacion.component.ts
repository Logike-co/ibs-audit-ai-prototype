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
