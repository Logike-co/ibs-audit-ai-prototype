import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/public/login/login.component').then(c => c.LoginComponent) },
  { 
    path: '', 
    loadComponent: () => import('./pages/private/layout/private-layout.component').then(c => c.PrivateLayoutComponent),
    children: [
      { path: 'inicio', loadComponent: () => import('./pages/private/inicio/inicio.component').then(c => c.InicioComponent) },
      { path: 'bandeja', loadComponent: () => import('./pages/private/bandeja/bandeja.component').then(c => c.BandejaComponent) },
      { path: 'devoluciones', loadComponent: () => import('./pages/private/devoluciones/devoluciones.component').then(c => c.DevolucionesComponent) },
      { path: 'auditoria/:id', loadComponent: () => import('./pages/private/split-screen/split-screen.component').then(c => c.SplitScreenComponent) }
    ]
  }
];