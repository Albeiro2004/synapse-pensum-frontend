import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-aprobada/20 border border-aprobada/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-aprobada" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
            </svg>
          </div>
          <div>
            <span class="font-display text-white text-lg leading-none">Synapse</span>
            <span class="text-slate-500 text-xs block">Motor Académico</span>
          </div>
        </div>

        <!-- Nav tabs -->
        <nav class="hidden sm:flex items-center gap-1">
          <a routerLink="/pensum/grilla" routerLinkActive="bg-slate-700 text-white"
             class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Malla
          </a>
          <a routerLink="/pensum/grafo" routerLinkActive="bg-slate-700 text-white"
             class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/>
              <path d="M7 12h10M17 6l-10 5M17 18l-10-5"/>
            </svg>
            Grafo DAG
          </a>
        </nav>

        <!-- User info -->
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="text-slate-200 text-sm font-medium leading-none">{{ auth.nombreCompleto() }}</p>
            <p class="text-slate-500 text-xs mt-0.5">Estadística</p>
          </div>
          <div class="w-8 h-8 rounded-full bg-aprobada/20 border border-aprobada/30 flex items-center justify-center text-aprobada text-sm font-medium">
            {{ initial }}
          </div>
          <button (click)="auth.logout()" class="text-slate-500 hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-slate-800" title="Cerrar sesión">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>

      </div>
    </header>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);

  get initial(): string {
    return this.auth.nombreCompleto().charAt(0).toUpperCase() || 'E';
  }
}
