import { Component, inject, HostListener, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { AuthService } from '../../../services/auth/auth.service';
import { AuditoriaService } from '../../../services/auditoria/auditoria.service';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans"
         [class.demo-us-labels-off]="!auditoriaService.mostrarEtiquetasUs()">
      <header class="text-white shadow-lg z-20 flex-shrink-0 border-b"
              style="background-color: var(--color-brand); border-color: color-mix(in srgb, var(--color-brand) 80%, black);">
        <div class="w-full px-4 sm:px-6">
          <div class="flex justify-between items-center h-14">
            <div class="flex items-center space-x-3">
              <button type="button"
                      (click)="alternarMenu()"
                      class="p-2 rounded-md hover:bg-white/15 border border-white/20 transition"
                      [attr.aria-expanded]="menuAbierto()"
                      aria-controls="menu-portal-hitl"
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
              <span class="bg-white/15 text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20 font-semibold">AUDITORÍA HITL</span>
            </div>

            <div class="flex items-center space-x-3">
              <button (click)="toggleHud()"
                      title="Abrir/Cerrar Panel Guía de Demo (Ctrl+Shift+D)"
                      class="px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 transition shadow-sm border"
                      [ngClass]="auditoriaService.isDemoHudOpen() ? 'bg-[var(--color-brand-secondary)] text-slate-950 border-yellow-300' : 'bg-white/15 hover:bg-white/25 text-white border-white/20'">
                <span>Guía Demo</span>
                <span class="text-[10px] font-mono opacity-80">(Ctrl+Shift+D)</span>
              </button>

              <div class="h-4 w-px bg-white/20"></div>

              <div class="hidden sm:flex flex-col text-right">
                <span class="text-[11px] font-medium text-white">Dr. Juan Martínez</span>
                <span class="text-[9px] font-mono text-[var(--color-brand-secondary)]">RM-45210 · AUDITOR_MEDICO</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- NOTIFICACIÓN FLOTANTE TEMPORAL DE RESET -->
      <div *ngIf="mostrarToastReset" 
           class="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-xl text-xs font-semibold flex items-center space-x-2 animate-bounce">
        <span>✓</span>
        <span>Demostración reiniciada: 3 casos restablecidos a estado PENDIENTE original</span>
      </div>

      <div class="flex-1 flex overflow-hidden relative">
        <nav id="menu-portal-hitl"
             class="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col py-4 overflow-y-auto"
             [class.hidden]="!menuAbierto()"
             aria-label="Vistas del portal HITL">
          <p class="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Menú</p>
          <a routerLink="/inicio"
             routerLinkActive="bg-[color-mix(in_srgb,var(--color-brand)_12%,white)] text-[var(--color-brand)] font-bold border-r-4 border-[var(--color-brand)]"
             (click)="navegarYCerrar($event, '/inicio')"
             class="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            Inicio
          </a>
          <a routerLink="/bandeja"
             routerLinkActive="bg-[color-mix(in_srgb,var(--color-brand)_12%,white)] text-[var(--color-brand)] font-bold border-r-4 border-[var(--color-brand)]"
             (click)="navegarYCerrar($event, '/bandeja')"
             class="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            Bandeja de excepciones
            <span class="ml-auto bg-slate-100 text-slate-600 text-[10px] font-mono px-1.5 py-0.5 rounded">
              {{ auditoriaService.bandejaOrdenada().length }}
            </span>
          </a>
          <a routerLink="/devoluciones"
             routerLinkActive="bg-[color-mix(in_srgb,var(--color-brand)_12%,white)] text-[var(--color-brand)] font-bold border-r-4 border-[var(--color-brand)]"
             (click)="navegarYCerrar($event, '/devoluciones')"
             class="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            Devoluciones (SCR-14)
            <span class="ml-auto bg-emerald-100 text-emerald-800 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
              5D
            </span>
          </a>
          <a *ngIf="activeNur"
             [routerLink]="['/auditoria', activeNur]"
             routerLinkActive="bg-[color-mix(in_srgb,var(--color-brand)_12%,white)] text-[var(--color-brand)] font-bold border-r-4 border-[var(--color-brand)]"
             (click)="navegarYCerrar($event, '/auditoria/' + activeNur)"
             class="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            Caso en revisión
          </a>
        </nav>

        <main class="flex-1 min-h-0 flex flex-col overflow-hidden w-full relative">
          <router-outlet></router-outlet>
        </main>

        <!-- DRAWER GUÍA DE DEMOSTRACIÓN (DEMO HUD) REACTIVO -->
        <aside *ngIf="auditoriaService.isDemoHudOpen()" 
               class="w-96 bg-white border-l border-slate-200 shadow-2xl z-30 flex flex-col transition-all duration-300 animate-slide-left">
          
          <!-- Encabezado del Copiloto -->
          <div class="p-4 text-white flex justify-between items-center"
               style="background-color: var(--color-brand);">
            <div>
              <h3 class="font-bold text-sm tracking-wide">Copiloto Guía Demo</h3>
              <p class="text-[10px] text-white/70 font-mono">Speaker Script · Auditoría HITL</p>
            </div>
            <button (click)="toggleHud()" class="text-white/70 hover:text-white text-lg font-bold">×</button>
          </div>

          <label class="flex items-start gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-700 cursor-pointer select-none">
            <input type="checkbox"
                   class="mt-0.5 rounded border-slate-400 text-amber-500 focus:ring-amber-400"
                   [checked]="auditoriaService.mostrarEtiquetasUs()"
                   (change)="onMostrarEtiquetasUs($event)">
            <span>
              <span class="font-semibold text-slate-900">Mostrar historias de usuario</span>
              <span class="block text-slate-500 font-normal">Badges US-xx en la vista gráfica, no en este panel</span>
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

            <!-- Ficha Contextual del Caso -->
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
              <div class="flex justify-between items-start">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Caso en Revisión:</span>
                <span class="text-[10px] font-mono font-bold text-[var(--color-brand)] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                  {{ contextoActivo.caso }}
                </span>
              </div>
              <h4 class="font-bold text-slate-900 text-sm leading-snug">
                {{ contextoActivo.titulo }}
              </h4>
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

            <!-- Diagrama de Flujo del Proceso HitL (DRAKON / ADR-0004) -->
            <div class="text-white rounded-lg p-3 space-y-2" style="background-color: var(--color-brand);">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono text-[var(--color-brand-secondary)] uppercase tracking-wider font-bold">
                  Flujo algorítmico HITL
                </span>
                <span class="bg-white/15 text-white border border-white/20 text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold">
                  ADR-0004 · DRAKON
                </span>
              </div>
              <p class="text-[10px] text-slate-300 leading-snug">
                Pipeline de decisión médica bajo Res. 2284/2023:
              </p>
              
              <!-- Flujograma simplificado en nodos visuales -->
              <div class="space-y-1.5 pt-1 text-[10px]">
                <div class="p-1.5 rounded bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                  <span class="font-bold text-slate-200">1. Triage & Plazo (20 Días)</span>
                  <span class="text-[9px] font-mono text-emerald-400">US-11 / US-17</span>
                </div>
                <div class="text-center text-slate-500 font-mono text-[9px]">▼</div>
                <div class="p-1.5 rounded bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                  <span class="font-bold text-[var(--color-brand-secondary)]">2. RAG & Cruce Tarifario OCR</span>
                  <span class="text-[9px] font-mono text-white/70">US-14 / US-08</span>
                </div>
                <div class="text-center text-slate-500 font-mono text-[9px]">▼</div>
                <div class="p-1.5 rounded bg-black/20 border border-white/20 space-y-1">
                  <span class="font-bold text-amber-300 block">3. Bifurcación Médica (Split-Screen)</span>
                  <div class="grid grid-cols-2 gap-1 text-[9px] text-slate-300 pt-0.5">
                    <span class="bg-slate-900/80 p-1 rounded border border-slate-700 text-center">✓ Ratifica 1-Clic<br><b class="text-emerald-400 font-mono">US-12</b></span>
                    <span class="bg-slate-900/80 p-1 rounded border border-slate-700 text-center">✎ Sobreescribe<br><b class="text-amber-400 font-mono">US-13 (≥50c)</b></span>
                  </div>
                </div>
                <div class="text-center text-slate-500 font-mono text-[9px]">▼</div>
                <div class="p-1.5 rounded bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                  <span class="font-bold text-emerald-300">4. Traza Forense Inmutable</span>
                  <span class="text-[9px] font-mono text-emerald-400">US-20 / US-28</span>
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
                <span class="px-2 py-1 rounded text-[11px] font-bold text-slate-900" style="background-color: var(--color-brand-secondary);">Auditoría</span>
                <a href="http://localhost:4200" class="px-2 py-1 rounded border border-slate-200 text-[11px] text-slate-700 hover:bg-white">Radicación</a>
                <a href="http://localhost:4220" class="px-2 py-1 rounded border border-slate-200 text-[11px] text-slate-700 hover:bg-white">Admin</a>
              </div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-1">Escenarios</p>
              <button type="button" (click)="irAEscenario('NUR-2026-8849201')"
                      class="w-full text-left px-3 py-2 rounded-md text-[11px] border"
                      [ngClass]="activeNur === 'NUR-2026-8849201' ? 'bg-emerald-50 text-emerald-900 font-bold border-emerald-200' : 'bg-white text-slate-700 border-slate-200'">
                ESC-01 · Limpio
              </button>
              <button type="button" (click)="irAEscenario('NUR-2026-8849202')"
                      class="w-full text-left px-3 py-2 rounded-md text-[11px] border"
                      [ngClass]="activeNur === 'NUR-2026-8849202' ? 'bg-rose-50 text-rose-900 font-bold border-rose-200' : 'bg-white text-slate-700 border-slate-200'">
                ESC-02 · Glosa parcial
              </button>
              <button type="button" (click)="irAEscenario('NUR-2026-8849203')"
                      class="w-full text-left px-3 py-2 rounded-md text-[11px] border"
                      [ngClass]="activeNur === 'NUR-2026-8849203' ? 'bg-amber-50 text-amber-950 font-bold border-amber-200' : 'bg-white text-slate-700 border-slate-200'">
                ESC-03 · Rechazo SOAT
              </button>
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
  authService = inject(AuthService);
  auditoriaService = inject(AuditoriaService);
  router = inject(Router);
  menuAbierto = signal(true);

  mostrarToastReset = false;

  alternarMenu() {
    this.menuAbierto.update(v => !v);
  }

  navegarYCerrar(event: Event, ruta: string) {
    event.preventDefault();
    void this.router.navigateByUrl(ruta).then(() => this.menuAbierto.set(false));
  }

  private urlActual = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  private contexto = computed(() => {
    this.auditoriaService.cuentas();
    const url = this.urlActual();
    if (url.includes('bandeja')) {
      return this.auditoriaService.getGuiaDemoContexto(url);
    }
    return this.auditoriaService.getGuiaDemoContexto(this.auditoriaService.activeScenarioId());
  });

  get contextoActivo() {
    return this.contexto();
  }

  get activeNur(): string {
    switch (this.auditoriaService.activeScenarioId()) {
      case 'ESC-01': return 'NUR-2026-8849201';
      case 'ESC-02': return 'NUR-2026-8849202';
      case 'ESC-03': return 'NUR-2026-8849203';
      default: {
        const url = this.urlActual();
        if (url.includes('NUR-2026-8849201')) return 'NUR-2026-8849201';
        if (url.includes('NUR-2026-8849202')) return 'NUR-2026-8849202';
        if (url.includes('NUR-2026-8849203')) return 'NUR-2026-8849203';
        return '';
      }
    }
  }

  toggleHud() {
    this.auditoriaService.toggleDemoHud();
  }

  onMostrarEtiquetasUs(event: Event) {
    this.auditoriaService.mostrarEtiquetasUs.set((event.target as HTMLInputElement).checked);
  }

  irAEscenario(nur: string) {
    const escenario = nur.includes('8849201') ? 'ESC-01' : nur.includes('8849202') ? 'ESC-02' : nur.includes('8849203') ? 'ESC-03' : 'ESC-02';
    this.auditoriaService.setScenario(escenario);
    void this.router.navigate(['/auditoria', nur]).then(() => this.menuAbierto.set(false));
  }

  resetearDemo() {
    this.auditoriaService.resetData();
    this.mostrarToastReset = true;
    setTimeout(() => {
      this.mostrarToastReset = false;
    }, 2800);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && (event.key === 'D' || event.key === 'd')) {
      event.preventDefault();
      this.toggleHud();
    }
    if (event.ctrlKey && event.shiftKey && (event.key === 'R' || event.key === 'r')) {
      event.preventDefault();
      this.resetearDemo();
    }
  }

  logout() {
    this.auditoriaService.resetData();
    this.authService.logout();
  }
}
