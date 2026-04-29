import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MateriaEstadoDTO } from '../../../models/materia-estado.dto';
import { HistorialService } from '../../../core/services/historial.service';
import { AuthService } from '../../../core/services/auth.service';
import { EstadoBadgeComponent } from '../../../shared/components/estado-badge/estado-badge.component';

@Component({
  selector: 'app-modal-nota',
  standalone: true,
  imports: [CommonModule, FormsModule, EstadoBadgeComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
         (click)="onBackdropClick($event)">

      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"></div>

      <!-- Modal -->
      <div class="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">

        <!-- Header -->
        <div class="p-6 pb-4 border-b border-slate-700/50">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs text-slate-500 font-mono mb-1">{{ materia.codigo }}</p>
              <h2 class="text-white font-display text-xl leading-tight">{{ materia.nombre }}</h2>
              <div class="flex items-center gap-3 mt-2">
                <app-estado-badge [estado]="materia.estado" />
                <span class="text-xs text-slate-500">{{ materia.creditos }} créditos · Semestre {{ materia.semestre }}</span>
              </div>
            </div>
            <button (click)="cerrar.emit()" class="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-700 transition-all ml-4">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6">

          <!-- Note input -->
          <label class="block mb-2">
            <span class="text-sm text-slate-400 mb-2 block">
              {{ materia.estado === 'APROBADA' ? 'Actualizar nota final' : 'Registrar nota final' }}
            </span>
            <div class="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                [(ngModel)]="nota"
                (input)="onNotaChange()"
                placeholder="0.0"
                class="input-field text-2xl font-display text-center pr-12"
                [class.border-aprobada]="nota >= 3.0"
                [class.border-red-500]="nota > 0 && nota < 3.0"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">/ 5.0</span>
            </div>
          </label>

          <!-- Visual indicator -->
          <div class="flex items-center justify-between mb-2 mt-1">
            <span class="text-xs text-slate-500">Reprobada</span>
            <span class="text-xs text-slate-500">Aprobada</span>
          </div>
          <div class="h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
            <div class="h-full rounded-full transition-all duration-300"
                 [style.width.%]="(nota / 5) * 100"
                 [class]="nota >= 3.0 ? 'bg-aprobada' : 'bg-red-500'">
            </div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-600 mb-4">
            <span>0.0</span><span>1.0</span><span>2.0</span>
            <span class="text-slate-400 font-medium">3.0</span>
            <span>4.0</span><span>5.0</span>
          </div>

          <!-- Result label -->
          <div *ngIf="nota > 0" class="text-center mb-4">
            <span *ngIf="nota >= 3.0" class="text-aprobada text-sm font-medium">
              ✓ Nota aprobatoria
            </span>
            <span *ngIf="nota < 3.0" class="text-red-400 text-sm font-medium">
              ✗ Nota reprobatoria
            </span>
          </div>

          <!-- Error -->
          <div *ngIf="error()" class="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
            <p class="text-red-400 text-sm">{{ error() }}</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button (click)="cerrar.emit()" class="btn-ghost flex-1 text-center">
              Cancelar
            </button>
            <button
              (click)="guardar()"
              [disabled]="loading() || nota <= 0 || nota > 5"
              class="btn-primary flex-1 text-center flex items-center justify-center gap-2">
              <div *ngIf="loading()" class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              {{ loading() ? 'Guardando…' : materia.estado === 'APROBADA' ? 'Actualizar' : 'Registrar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalNotaComponent {
  @Input({ required: true }) materia!: MateriaEstadoDTO;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  private historial = inject(HistorialService);
  private auth = inject(AuthService);

  nota = 0;
  loading = signal(false);
  error = signal<string | null>(null);

  onNotaChange() {
    if (this.nota > 5) this.nota = 5;
    if (this.nota < 0) this.nota = 0;
    this.error.set(null);
  }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.cerrar.emit();
  }

  guardar() {
    if (this.nota <= 0 || this.nota > 5) return;

    const request = {
      estudianteId: this.auth.estudianteId()!,
      materiaId: this.materia.id,
      nota: this.nota,
    };

    this.loading.set(true);
    this.error.set(null);

    const call = this.materia.estado === 'APROBADA'
      ? this.historial.actualizarNota(request)
      : this.historial.registrarNota(request);

    call.subscribe({
      next: () => {
        this.loading.set(false);
        this.guardado.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo guardar la nota');
      }
    });
  }
}
