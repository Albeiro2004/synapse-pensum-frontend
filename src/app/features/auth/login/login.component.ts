import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex">
      <!-- Left panel - branding -->
      <div
        class="hidden lg:flex lg:w-2/3 relative bg-slate-900 flex-col justify-between p-12 overflow-hidden"
      >
        <!-- Grid pattern bg -->
        <div
          class="absolute inset-0 bg-cover bg-center opacity-30"
          style="background-image: url('https://unicordoba.edu.co/wp-content/uploads/2026/05/entrada-vehicular-monteria.jpg-2-scaled.jpeg');"
        ></div>
        <!-- Glows -->
        <div
          class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-aprobada/10 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute bottom-1/3 right-1/4 w-48 h-48 bg-disponible/5 rounded-full blur-3xl pointer-events-none"
        ></div>

        <div class="relative">
          <div
            class="w-10 h-10 rounded-xl bg-aprobada/20 border border-aprobada/30 flex items-center justify-center mb-8"
          >
            <svg
              class="w-5 h-5 text-aprobada"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
              />
            </svg>
          </div>
          <h1 class="font-display text-4xl text-white mb-4 leading-tight">
            Motor de Inferencia Académica
          </h1>
          <p class="text-slate-400 text-base leading-relaxed max-w-xl">
            Visualiza tu progreso en la malla curricular de Estadística como un grafo de
            dependencias en tiempo real.
          </p>
        </div>

        <!-- DAG mini preview -->
        <div class="relative">
          <div class="flex flex-col gap-3">
            <div class="flex gap-3">
              <div class="h-2 rounded-full bg-aprobada/60" style="width:60px"></div>
              <div class="h-2 rounded-full bg-aprobada/60" style="width:80px"></div>
              <div class="h-2 rounded-full bg-aprobada/60" style="width:48px"></div>
            </div>
            <div class="flex gap-3 ml-8">
              <div class="h-2 rounded-full bg-disponible/60" style="width:70px"></div>
              <div class="h-2 rounded-full bg-disponible/40" style="width:54px"></div>
            </div>
            <div class="flex gap-3 ml-4">
              <div class="h-2 rounded-full bg-slate-700" style="width:90px"></div>
              <div class="h-2 rounded-full bg-slate-700" style="width:60px"></div>
              <div class="h-2 rounded-full bg-slate-700" style="width:44px"></div>
            </div>
          </div>
          <div class="flex items-center gap-4 mt-6 text-xs text-slate-500">
            <span class="flex items-center gap-1.5"
              ><span class="w-2 h-2 rounded-full bg-aprobada"></span>Aprobadas</span
            >
            <span class="flex items-center gap-1.5"
              ><span class="w-2 h-2 rounded-full bg-disponible"></span>Disponibles</span
            >
            <span class="flex items-center gap-1.5"
              ><span class="w-2 h-2 rounded-full bg-slate-600"></span>Bloqueadas</span
            >
          </div>
        </div>
      </div>

      <!-- Right panel - form -->
      <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-sm">
          <!-- Mobile logo -->
          <div class="lg:hidden flex items-center gap-3 mb-8">
            <div
              class="w-8 h-8 rounded-lg bg-aprobada/20 border border-aprobada/30 flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-aprobada"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12" />
              </svg>
            </div>
            <span class="font-display text-white text-xl">Estadística</span>
          </div>

          <h2 class="font-display text-2xl text-white mb-1">Bienvenido</h2>
          <p class="text-slate-500 text-sm mb-8">Ingresa a tu cuenta para ver tu malla</p>

          <form (ngSubmit)="onSubmit()" #f="ngForm">
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-slate-400 mb-1.5">Usuario</label>
                <input
                  type="text"
                  name="usuario"
                  [(ngModel)]="form.usuario"
                  required
                  class="input-field"
                  placeholder="tu.usuario"
                  autocomplete="username"
                />
              </div>

              <div>
                <label class="block text-sm text-slate-400 mb-1.5">Contraseña</label>
                <input
                  [type]="showPwd ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="form.password"
                  required
                  class="input-field"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  (click)="showPwd = !showPwd"
                  class="text-xs text-slate-500 hover:text-slate-300 mt-1 transition-colors"
                >
                  {{ showPwd ? 'Ocultar' : 'Mostrar' }} contraseña
                </button>
              </div>
            </div>

            <!-- Error -->
            <div
              *ngIf="error()"
              class="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
            >
              <p class="text-red-400 text-sm">{{ error() }}</p>
            </div>

            <button
              type="submit"
              [disabled]="loading() || !form.usuario || !form.password"
              class="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              <div
                *ngIf="loading()"
                class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
              ></div>
              {{ loading() ? 'Ingresando…' : 'Ingresar' }}
            </button>
          </form>

          <p class="text-center text-sm text-slate-500 mt-6">
            ¿No tienes cuenta?
            <a
              routerLink="/registro"
              class="text-aprobada hover:text-aprobada/80 transition-colors ml-1"
            >
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  form = { usuario: '', password: '' };
  showPwd = false;
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    if (!this.form.usuario || !this.form.password) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.form).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/pensum/grilla']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Credenciales incorrectas');
      },
    });
  }
}
