import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuditoriaService } from '../../../services/auditoria/auditoria.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 p-6">
      <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
        <h2 class="text-xl font-bold text-slate-800">Inicio</h2>
        <p class="text-sm text-slate-600 mt-1">
          Auditor médico. Entre a la bandeja de excepciones o abra el caso en revisión.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a routerLink="/bandeja"
           class="block bg-white p-5 rounded-lg border border-slate-200 hover:border-[var(--color-brand)] shadow-sm transition">
          <h3 class="font-bold text-slate-900">Bandeja de excepciones</h3>
          <p class="text-xs text-slate-500 mt-1">{{ auditoria.bandejaOrdenada().length }} cuentas pendientes de ratificación.</p>
        </a>
      </div>
    </div>
  `
})
export class InicioComponent {
  auditoria = inject(AuditoriaService);
}
