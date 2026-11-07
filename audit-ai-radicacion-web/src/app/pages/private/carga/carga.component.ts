import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carga',
  standalone: true,
  template: `
    <div class="bg-white rounded-lg shadow p-8 border border-gray-200 text-center">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Portal de Carga y Radicación</h2>
      
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer flex flex-col items-center justify-center mb-8">
        <svg class="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <p class="text-gray-600 font-medium">Arrastra y suelta tus archivos RIPS/FEV aquí</p>
        <p class="text-gray-400 text-sm mt-2">Soporta formatos .zip y .xml (Max 100MB)</p>
      </div>
      
      <div class="flex justify-center">
        <button (click)="simularCarga()" class="px-6 py-2 bg-blue-600 text-white rounded-md shadow font-medium hover:bg-blue-700 transition-colors">
          Simular carga de paquete 2026-09-13-001
        </button>
      </div>
    </div>
  `
})
export class CargaComponent {
  router = inject(Router);
  
  simularCarga() {
    // Al cargar navega a la prevalidación del paquete
    this.router.navigate(['/prevalidacion']);
  }
}