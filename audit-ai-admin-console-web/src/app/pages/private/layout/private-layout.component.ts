import { Component, inject, HostListener, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AdminService } from '../../../services/admin/admin.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans"
         [class.demo-us-labels-off]="!service.mostrarEtiquetasUs()">
      <header class="text-white shadow-lg z-20 flex-shrink-0 border-b"
              style="background-color: var(--color-brand); border-color: color-mix(in srgb, var(--color-brand) 80%, black);">
        <div class="w-full px-4 sm:px-6">
          <div class="flex justify-between items-center h-14">
            <div class="flex items-center space-x-3">
              <button type="button"
                      (click)="alternarMenu()"
                      class="p-2 rounded-md hover:bg-white/15 border border-white/20 transition"
                      [attr.aria-expanded]="menuAbierto()"
                      aria-controls="menu-portal-admin"
                      [attr.aria-label]="menuAbierto() ? 'Ocultar menú' : 'Mostrar menú'"
                      [title]="menuAbierto() ? 'Ocultar menú' : 'Mostrar menú'">
                <svg *ngIf="!menuAbierto()" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg *ngIf="menuAbierto()" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-[var(--color-brand-secondary)] animate-pulse"></span>
              <span class="text-base font-black tracking-wider text-white">AUDIT-AI <span class="text-[var(--color-brand-secondary)] font-semibold text-xs">IBS</span></span>
              <span class="bg-white/15 text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20 font-semibold">CONSOLA ADMIN</span>
            </div>

            <div class="flex items-center space-x-3">
              <button (click)="service.toggleDemoHud()"
                      title="Abrir/Cerrar Panel Guía de Demo (Ctrl+Shift+D)"
                      class="px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 transition shadow-sm border"
                      [ngClass]="service.isDemoHudOpen() ? 'bg-[var(--color-brand-secondary)] text-slate-950 border-yellow-300' : 'bg-white/15 hover:bg-white/25 text-white border-white/20'">
                <span>Guía Demo</span>
                <span class="text-[10px] font-mono opacity-80">(Ctrl+Shift+D)</span>
              </button>

              <div class="h-4 w-px bg-white/20"></div>

              <div class="hidden sm:flex flex-col text-right">
                <span class="text-[11px] font-medium text-white">{{ service.perfil() === 'ADMIN_TENANT' ? service.tenantEnPantalla().name : 'Admin IBS Platform' }}</span>
                <span class="text-[9px] font-mono text-[var(--color-brand-secondary)]">{{ service.perfil() === 'ADMIN_TENANT' ? 'ADMIN TENANT · SOLO SU EPS' : 'SUPERADMIN · MULTITENANT' }}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="flex-1 flex overflow-hidden relative">
        <nav id="menu-portal-admin"
             class="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col py-4 overflow-y-auto"
             [class.hidden]="!menuAbierto()"
             aria-label="Vistas de la consola admin">
          <p class="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Menú</p>
          <a routerLink="/inicio"
             routerLinkActive="bg-[color-mix(in_srgb,var(--color-brand)_12%,white)] text-[var(--color-brand)] font-bold border-r-4 border-[var(--color-brand)]"
             (click)="navegarYCerrar($event, '/inicio')"
             class="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
            Inicio
          </a>
          <a routerLink="/dashboard"
             routerLinkActive="bg-[color-mix(in_srgb,var(--color-brand)_12%,white)] text-[var(--color-brand)] font-bold border-r-4 border-[var(--color-brand)]"
             (click)="navegarYCerrar($event, '/dashboard')"
             class="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
            Analítica
          </a>
          <a routerLink="/tablero-eps"
             routerLinkActive="bg-[color-mix(in_srgb,var(--color-brand)_12%,white)] text-[var(--color-brand)] font-bold border-r-4 border-[var(--color-brand)]"
             (click)="navegarYCerrar($event, '/tablero-eps')"
             class="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
            Tablero EPS
          </a>
          <a routerLink="/contratos"
             routerLinkActive="bg-[color-mix(in_srgb,var(--color-brand)_12%,white)] text-[var(--color-brand)] font-bold border-r-4 border-[var(--color-brand)]"
             (click)="navegarYCerrar($event, '/contratos')"
             class="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
            Contratos y tarifas
          </a>
          <a *ngIf="service.puedeCambiarTenant()"
             routerLink="/tenants"
             routerLinkActive="bg-[color-mix(in_srgb,var(--color-brand)_12%,white)] text-[var(--color-brand)] font-bold border-r-4 border-[var(--color-brand)]"
             (click)="navegarYCerrar($event, '/tenants')"
             class="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
            Tenants y S3
          </a>
        </nav>

        <main class="flex-1 overflow-y-auto p-6 w-full">
          <router-outlet></router-outlet>
        </main>

        <!-- DRAWER GUÍA DE DEMOSTRACIÓN (DEMO HUD) REACTIVO -->
        <aside *ngIf="service.isDemoHudOpen()" 
               class="w-96 bg-white border-l border-slate-200 shadow-2xl z-30 flex flex-col transition-all duration-300 animate-slide-left">
          
          <!-- Encabezado del Copiloto -->
          <div class="p-4 text-white flex justify-between items-center"
               style="background-color: var(--color-brand);">
            <div>
              <h3 class="font-bold text-sm tracking-wide">Copiloto Guía Demo</h3>
              <p class="text-[10px] text-white/70 font-mono">Speaker Script · Consola EPS & Admin</p>
            </div>
            <button (click)="service.toggleDemoHud()" class="text-white/70 hover:text-white text-lg font-bold">×</button>
          </div>

          <label class="flex items-start gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-[11px] text-slate-200 cursor-pointer select-none">
            <input type="checkbox"
                   class="mt-0.5 rounded border-slate-500 text-amber-500 focus:ring-amber-400"
                   [checked]="service.mostrarEtiquetasUs()"
                   (change)="onMostrarEtiquetasUs($event)">
            <span>
              <span class="font-semibold text-white">Mostrar historias de usuario</span>
              <span class="block text-slate-400 font-normal">Badges US-xx en la vista gráfica, no en este panel</span>
            </span>
          </label>

          <div class="p-4 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700">
            
            <!-- Badge de Estado Dinámico -->
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                    [ngClass]="contextoActivo.badge.clase">
                {{ contextoActivo.badge.texto }}
              </span>
              <span class="text-[10px] text-slate-400 font-mono truncate max-w-[170px]" [title]="contextoActivo.norma">
                {{ contextoActivo.norma }}
              </span>
            </div>

            <!-- Ficha Contextual del Caso / Módulo -->
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
              <div class="flex justify-between items-start">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Módulo en Pantalla:</span>
                <span class="text-[10px] font-mono font-bold text-[var(--color-brand)] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                  {{ contextoActivo.modulo }}
                </span>
              </div>
              <h4 class="font-bold text-slate-900 text-sm leading-snug">
                {{ contextoActivo.titulo }}
              </h4>
              <p class="text-[11px] text-slate-500 font-medium">
                Tenant Activo: <strong class="text-slate-700">{{ contextoActivo.tenant }}</strong>
              </p>
            </div>

            <!-- Diagnóstico Qué Está Pasando -->
            <div class="border-l-4 border-[var(--color-brand)] bg-slate-50 p-3 rounded-r">
              <p class="font-bold text-slate-900 mb-1">¿Qué está pasando?</p>
              <p class="text-slate-700 leading-relaxed text-[11px]">
                {{ contextoActivo.diagnostico }}
              </p>
            </div>

            <!-- Sustento Legal / Normativa MinSalud -->
            <div class="border-l-4 border-amber-500 bg-amber-50/70 p-3 rounded-r">
              <p class="font-bold text-amber-950 mb-1 flex items-center space-x-1">
                <span>⚖️</span>
                <span>Sustento Legal & Normativo</span>
              </p>
              <p class="text-amber-900 leading-relaxed text-[11px]">
                {{ contextoActivo.sustentoLegal }}
              </p>
            </div>

            <!-- Acción Guiada al Presentador -->
            <div class="border-l-4 border-emerald-500 bg-emerald-50/70 p-3 rounded-r">
              <p class="font-bold text-emerald-950 mb-1 flex items-center space-x-1">
                <span>🎯</span>
                <span>Acción a Realizar Ahora</span>
              </p>
              <p class="text-emerald-900 leading-relaxed text-[11px] font-medium">
                {{ contextoActivo.accionSugerida }}
              </p>
            </div>

            <!-- Checklist Interactivo de Pasos -->
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <p class="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex justify-between items-center">
                <span>Progreso del Flujo Demo</span>
                <span class="text-[10px] font-mono text-slate-400">CHECKLIST</span>
              </p>
              <div class="space-y-1.5">
                <div *ngFor="let paso of contextoActivo.pasos" 
                     class="flex items-start space-x-2 text-[11px] p-1.5 rounded transition"
                     [ngClass]="paso.completado ? 'bg-emerald-50 text-emerald-900' : paso.activo ? 'bg-blue-50 text-blue-950 font-semibold border border-blue-200' : 'text-slate-500'">
                  <span class="mt-0.5 font-bold">
                    {{ paso.completado ? '✓' : paso.numero + '.' }}
                  </span>
                  <div class="flex-1">
                    <p class="leading-tight">{{ paso.titulo }}</p>
                    <p class="text-[10px] opacity-80 font-normal">{{ paso.descripcion }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <p class="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Presentador</p>
              <button type="button" (click)="resetearDemo()"
                      class="w-full px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-medium text-slate-800">
                ↺ Reset Demo
              </button>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-1">Portales</p>
              <div class="flex flex-wrap gap-1">
                <a [href]="portals.hitl" class="px-2 py-1 rounded border border-slate-200 text-[11px] text-slate-700 hover:bg-white">Auditoría</a>
                <a [href]="portals.radicacion" class="px-2 py-1 rounded border border-slate-200 text-[11px] text-slate-700 hover:bg-white">Radicación</a>
                <span class="px-2 py-1 rounded text-[11px] font-bold text-slate-900" style="background-color: var(--color-brand-secondary);">Admin</span>
              </div>
            </div>

            <!-- Atajos del Presentador -->
            <div class="border-t border-slate-200 pt-3">
              <p class="font-bold text-slate-900 mb-1 text-[11px]">Atajos de Teclado:</p>
              <ul class="space-y-1 font-mono text-[10px] text-slate-500">
                <li><strong class="text-slate-700">Ctrl+Shift+R:</strong> Reset Demo instantáneo</li>
                <li><strong class="text-slate-700">Ctrl+Shift+D:</strong> Alternar este panel HUD</li>
              </ul>
            </div>

          </div>
        </aside>
      </div>
    </div>
  `
})
export class PrivateLayoutComponent {
  service = inject(AdminService);
  router = inject(Router);
  readonly portals = environment.portals;
  menuAbierto = signal(true);

  alternarMenu() {
    this.menuAbierto.update(v => !v);
  }

  navegarYCerrar(event: Event, ruta: string) {
    event.preventDefault();
    void this.router.navigateByUrl(ruta).then(() => this.menuAbierto.set(false));
  }

  private contexto = computed(() => {
    this.service.tenantActivo();
    this.service.kpis();
    this.service.contratosDelTenant();
    this.service.volumenCartera();
    return this.service.getGuiaDemoContexto(this.router.url);
  });

  get contextoActivo() {
    return this.contexto();
  }

  onMostrarEtiquetasUs(event: Event) {
    this.service.mostrarEtiquetasUs.set((event.target as HTMLInputElement).checked);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && (event.key === 'R' || event.key === 'r')) {
      event.preventDefault();
      this.resetearDemo();
    }
    if (event.ctrlKey && event.shiftKey && (event.key === 'D' || event.key === 'd')) {
      event.preventDefault();
      this.service.toggleDemoHud();
    }
  }

  resetearDemo() {
    this.service.resetData();
  }
}
