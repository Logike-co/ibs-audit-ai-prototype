import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/public/login/login.component').then(c => c.LoginComponent) },
  { 
    path: '', 
    loadComponent: () => import('./pages/private/layout/private-layout.component').then(c => c.PrivateLayoutComponent),
    children: [
      { path: 'inicio', loadComponent: () => import('./pages/private/inicio/inicio.component').then(c => c.InicioComponent) },
      { path: 'dashboard', loadComponent: () => import('./pages/private/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'tablero-eps', loadComponent: () => import('./pages/private/tablero-eps/tablero-eps.component').then(c => c.TableroEpsComponent) },
      { path: 'contratos', loadComponent: () => import('./pages/private/contratos/contratos.component').then(c => c.ContratosComponent) },
      { path: 'tenants', loadComponent: () => import('./pages/private/tenants/tenants.component').then(c => c.TenantsComponent) }
    ]
  }
];