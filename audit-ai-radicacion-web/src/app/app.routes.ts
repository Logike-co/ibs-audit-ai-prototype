import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/public/login/login.component').then(c => c.LoginComponent) },
  { 
    path: '', 
    loadComponent: () => import('./pages/private/layout/private-layout.component').then(c => c.PrivateLayoutComponent),
    children: [
      { path: 'inicio', loadComponent: () => import('./pages/private/inicio/inicio.component').then(c => c.InicioComponent) },
      { path: 'radicacion', loadComponent: () => import('./pages/private/radicacion/radicacion.component').then(c => c.RadicacionComponent) },
      { path: 'radicaciones', loadComponent: () => import('./pages/private/radicaciones/radicaciones.component').then(c => c.RadicacionesComponent) },
      { path: 'devoluciones', loadComponent: () => import('./pages/private/devoluciones/devoluciones.component').then(c => c.DevolucionesComponent) },
      { path: 'respuestas', loadComponent: () => import('./pages/private/respuestas/respuestas.component').then(c => c.RespuestasComponent) }
    ]
  }
];