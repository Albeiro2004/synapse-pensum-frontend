import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div class="absolute inset-0 opacity-20"
           style="background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:40px 40px;">
      </div>
      <div class="relative w-full max-w-sm">

        <div class="flex items-center gap-3 mb-8">
          <div class="w-8 h-8 rounded-lg bg-aprobada/20 border border-aprobada/30 flex items-center justify-center">
            <svg class="w-4 h-4 text-aprobada" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12"/>
            </svg>
          </div>
          <span class="font-display text-white text-xl">Synapse</span>
        </div>

        <h2 class="font-display text-2xl text-white mb-1">Crear cuenta</h2>
        <p class="text-slate-500 text-sm mb-8">Registra tu perfil de estudiante</p>

        <form (ngSubmit)="onSubmit()">
          <div class="space-y-4">

            <div>
              <label class="block text-sm text-slate-400 mb-1.5">Nombre completo</label>
              <input type="text" [(ngModel)]="form.nombreCompleto" name="nombre"
                     required class="input-field" placeholder="Tu nombre completo"/>
            </div>

            <div>
              <label class="block text-sm text-slate-400 mb-1.5">Usuario</label>
              <input type="text" [(ngModel)]="form.usuario" name="usuario"
                     required class="input-field" placeholder="usuario.unica"/>
            </div>

            <div>
              <label class="block text-sm text-slate-400 mb-1.5">Contraseña</label>
              <input type="password" [(ngModel)]="form.password" name="password"
                     required class="input-field" placeholder="Mínimo 6 caracteres"/>
            </div>

          </div>

          <div *ngIf="error()" class="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <p class="text-red-400 text-sm">{{ error() }}</p>
          </div>

          <button type="submit"
                  [disabled]="loading() || !form.usuario || !form.password || !form.nombreCompleto"
                  class="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            <div *ngIf="loading()" class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
            {{ loading() ? 'Creando cuenta…' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="text-center text-sm text-slate-500 mt-6">
          ¿Ya tienes cuenta?
          <a routerLink="/login" class="text-aprobada hover:text-aprobada/80 transition-colors ml-1">Inicia sesión</a>
        </p>
      </div>
    </div>
  `
})
export class RegistroComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = { nombreCompleto: '', usuario: '', password: '' };
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);
    this.auth.registro(this.form).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/pensum/grilla']); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al crear la cuenta');
      }
    });
  }
}
