import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Building2, Plus, HardDrive, Database, ShieldCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-angular';
import { AdminService, Tenant } from '../../../services/admin/admin.service';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './tenants.component.html'
})
export class TenantsComponent {
  adminService = inject(AdminService);
  private router = inject(Router);
  tenants = this.adminService.tenantsVisibles;

  constructor() {
    if (!this.adminService.puedeCambiarTenant()) {
      void this.router.navigate(['/inicio']);
    }
  }

  // Icons
  Building2 = Building2;
  Plus = Plus;
  HardDrive = HardDrive;
  Database = Database;
  ShieldCheck = ShieldCheck;
  CheckCircle2 = CheckCircle2;
  Loader2 = Loader2;
  AlertCircle = AlertCircle;

  showProvisionForm = signal(false);
  isProvisioning = signal(false);
  provisioningState = signal<'IDLE' | 'DB' | 'S3' | 'COGNITO' | 'DONE'>('IDLE');

  newTenant = {
    name: '',
    nit: '',
    slug: '',
    email: '',
    quota: '100000'
  };

  get generatedS3Bucket() {
    if (!this.newTenant.slug) return '';
    return `s3://ibs-audit-ai-${this.newTenant.slug.toLowerCase().replace(/\s+/g, '-')}`;
  }

  toggleProvisionForm() {
    this.showProvisionForm.set(!this.showProvisionForm());
  }

  async provisionTenant() {
    if (!this.newTenant.name || !this.newTenant.nit || !this.newTenant.slug) return;
    
    this.isProvisioning.set(true);
    
    // Simulate steps
    this.provisioningState.set('DB');
    await this.delay(1500);
    
    this.provisioningState.set('S3');
    await this.delay(1200);
    
    this.provisioningState.set('COGNITO');
    await this.delay(1000);
    
    this.provisioningState.set('DONE');
    
    // Add to list
    setTimeout(() => {
      this.adminService.agregarTenant({
        name: this.newTenant.name,
        nit: this.newTenant.nit,
        schema: `tenant_${this.newTenant.slug}`,
        s3Bucket: this.generatedS3Bucket,
        status: 'ACTIVO'
      });
      
      this.isProvisioning.set(false);
      this.showProvisionForm.set(false);
      this.provisioningState.set('IDLE');
      this.newTenant = { name: '', nit: '', slug: '', email: '', quota: '100000' };
    }, 2000);
  }
  
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
