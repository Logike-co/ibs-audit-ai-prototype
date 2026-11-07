import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RadicacionService, CuentaGlosada } from '../../../services/radicacion/radicacion.service';

@Component({
  selector: 'app-respuestas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Glosas Notificadas Pendientes</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Factura</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NUR</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Causal</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto a Glosar</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Plazo IPS (15 Días)</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let c of service.cuentasGlosadasPendientes()" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-bold text-gray-900 font-mono">{{ c.factura }}</td>
                <td class="px-4 py-3 text-sm text-gray-500 font-mono">{{ c.nur }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ c.causal }}</td>
                <td class="px-4 py-3 text-sm text-red-600 font-medium">{{ c.monto | currency:'COP':'symbol':'1.0-0' }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-0.5 rounded text-xs font-bold" [ngClass]="c.diasHabilesRestantes <= 5 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'">
                    {{ c.diasHabilesRestantes }} días hábiles
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <button (click)="seleccionar(c)" class="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs hover:bg-blue-100 font-medium">
                    Responder
                  </button>
                </td>
              </tr>
              <tr *ngIf="service.cuentasGlosadasPendientes().length === 0">
                <td colspan="6" class="px-4 py-6 text-center text-gray-500 text-sm">No hay glosas pendientes por responder.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="cuentaSeleccionada" class="bg-white rounded-lg shadow border-2 border-blue-200 p-6 relative">
        <button (click)="cuentaSeleccionada = null" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
        <h3 class="text-lg font-bold text-blue-900 mb-2">Responder a factura {{ cuentaSeleccionada.factura }}</h3>
        <p class="text-xs text-gray-500 font-mono mb-2">{{ cuentaSeleccionada.nur }}</p>
        <p class="text-sm text-gray-600 mb-6">Seleccione el mecanismo legal de respuesta según la Resolución 2284 de 2023 (Término perentorio: 15 días hábiles).</p>

        <div class="space-y-4">
          <label class="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer" [class.border-blue-500]="accion === 'RE9701'" [class.bg-blue-50]="accion === 'RE9701'">
            <input type="radio" name="accion" value="RE9701" [(ngModel)]="accion" class="h-4 w-4 text-blue-600">
            <div class="ml-3">
              <span class="font-bold text-gray-900 font-mono">RE9701</span>
              <span class="ml-2 font-medium text-gray-800">Aceptar Glosa (Emisión de Nota Crédito)</span>
              <p class="text-xs text-gray-500">Se acepta la objeción tarifaria o médica formulada por la EPS.</p>
            </div>
          </label>
          
          <label class="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer" [class.border-blue-500]="accion === 'RE9601'" [class.bg-blue-50]="accion === 'RE9601'">
            <input type="radio" name="accion" value="RE9601" [(ngModel)]="accion" class="h-4 w-4 text-blue-600">
            <div class="ml-3">
              <span class="font-bold text-gray-900 font-mono">RE9601</span>
              <span class="ml-2 font-medium text-gray-800">Controvertir Glosa Injustificada</span>
              <p class="text-xs text-gray-500">Se objeta la causal sobre el mismo NUR. Abre término de 10 días para conciliación.</p>
            </div>
          </label>
          
          <label class="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer" [class.border-blue-500]="accion === 'SUBSANAR'" [class.bg-blue-50]="accion === 'SUBSANAR'">
            <input type="radio" name="accion" value="SUBSANAR" [(ngModel)]="accion" class="h-4 w-4 text-blue-600">
            <div class="ml-3">
              <span class="font-bold text-gray-900 font-mono">RE9601-SUB</span>
              <span class="ml-2 font-medium text-gray-800">Subsanar Falla con Soportes Documentales</span>
              <p class="text-xs text-gray-500">Se adjunta anexo documental (RGL / Epicrisis / FURIPS) para desvirtuar la glosa.</p>
            </div>
          </label>
        </div>

        <div *ngIf="accion === 'SUBSANAR'" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p class="text-sm text-yellow-800 font-medium mb-1">Adjunte soportes (varios PDF o un ZIP de glosas)</p>
          <p class="text-xs text-yellow-700 mb-2">Límite paramétrico de demostración: 50 MB / 20 archivos. En producto el tope lo fija parametrización, no el código.</p>
          <input type="file" multiple accept=".pdf,.zip,application/pdf,application/zip" (change)="onSoportes($event)" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200">
          <ul *ngIf="nombresSoporte.length" class="mt-2 text-xs text-gray-700 list-disc list-inside">
            <li *ngFor="let n of nombresSoporte">{{ n }}</li>
          </ul>
        </div>

        <div class="mt-8 flex justify-end">
          <button (click)="enviarRespuesta()" [disabled]="!accion || (accion === 'SUBSANAR' && !soporteAsignado)" class="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Radicar Respuesta a Glosa
          </button>
        </div>
      </div>

      <div *ngIf="resultado" class="bg-green-50 border-l-4 border-green-500 p-6 rounded shadow-sm flex items-center justify-between">
        <div>
          <h3 class="text-green-800 font-bold text-lg mb-1">¡Respuesta Radicada Exitosamente!</h3>
          <p class="text-green-700 text-sm">Se ha enviado a conciliación.</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-green-600 font-bold uppercase mb-1">Acta de Recepción</p>
          <p class="text-xl font-mono text-green-900">{{ resultado.acta }}</p>
          <button (click)="resultado = null" class="mt-2 text-xs text-green-700 underline">Cerrar</button>
        </div>
      </div>

    </div>
  `
})
export class RespuestasComponent {
  service = inject(RadicacionService);
  cuentaSeleccionada: CuentaGlosada | null = null;
  accion = '';
  soporteAsignado = false;
  nombresSoporte: string[] = [];
  resultado: any = null;

  seleccionar(c: CuentaGlosada) {
    this.cuentaSeleccionada = c;
    this.accion = '';
    this.soporteAsignado = false;
    this.nombresSoporte = [];
    this.resultado = null;
  }

  onSoportes(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.nombresSoporte = files.map(f => f.name);
    this.soporteAsignado = files.length > 0;
  }

  enviarRespuesta() {
    if (this.cuentaSeleccionada) {
      this.resultado = this.service.radicarRespuesta(this.cuentaSeleccionada.nur, this.accion);
      this.cuentaSeleccionada = null;
      this.accion = '';
    }
  }
}