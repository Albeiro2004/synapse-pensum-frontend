import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MateriaEstadoDTO } from '../../../models/materia-estado.dto';
import { EstadoBadgeComponent } from '../estado-badge/estado-badge.component';
import { EstadoMateria } from '../../../models/estado.enum';

export type AccionCard = 'matricular' | 'cancelar' | 'nota';

export interface AccionCardEvent {
  materia: MateriaEstadoDTO;
  accion: AccionCard;
}

@Component({
  selector: 'app-materia-card',
  standalone: true,
  imports: [CommonModule, EstadoBadgeComponent],
  template: `
    <div
      class="group relative rounded-xl border p-4 transition-all duration-200 select-none"
      [class]="cardClass"
    >
      <!-- Badge semestre final -->
      <div
        *ngIf="materia.semestre >= 8"
        class="absolute -top-1.5 -right-1.5 bg-slate-600 text-slate-200 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-slate-500"
      >
        Final
      </div>

      <!-- Header -->
      <div class="flex items-start justify-between gap-2 mb-3">
        <span class="text-xs font-mono text-slate-500 leading-none">{{ materia.codigo }}</span>
        <app-estado-badge [estado]="materia.estado" />
      </div>

      <!-- Nombre -->
      <h3 class="text-sm font-medium leading-snug mb-3" [class]="nameClass">
        {{ materia.nombre }}
      </h3>

      <!-- Footer -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1 text-xs text-slate-500">
          <!-- ... SVG créditos ... -->
          {{ materia.creditos }} cr
        </div>

        <!-- DISPONIBLE o REPROBADA → Matricular -->
        <button
          *ngIf="materia.estado === 'DISPONIBLE' || materia.estado === 'REPROBADA'"
          class="text-xs font-medium px-2 py-1 rounded-md transition-all duration-150 opacity-0 group-hover:opacity-100 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          [disabled]="loadingAction === 'matricular'"
          (click)="emit('matricular')"
        >
          @if (loadingAction === 'matricular') {
            <svg class="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          }
          {{ loadingAction === 'matricular' ? 'Procesando...' : '+ Matricular' }}
        </button>

        <!-- MATRICULADA → Ingresar nota + Cancelar -->
        <div
          *ngIf="materia.estado === 'MATRICULADA'"
          class="flex gap-1 opacity-0 group-hover:opacity-100"
        >
          <button
            class="text-xs font-medium px-2 py-1 rounded-md bg-disponible/20 text-disponible hover:bg-disponible/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="loadingAction === 'nota'"
            (click)="emit('nota')"
          >
            @if (loadingAction === 'nota') {
              <svg class="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            }
            {{ loadingAction === 'nota' ? 'Guardando...' : 'Ingresar nota' }}
          </button>

          <button
            class="text-xs font-medium px-2 py-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="loadingAction === 'cancelar'"
            (click)="emit('cancelar')"
          >
            @if (loadingAction === 'cancelar') {
              <svg class="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            }
            {{ loadingAction === 'cancelar' ? 'Cancelando...' : 'Cancelar' }}
          </button>
        </div>

        <!-- APROBADA → bloqueada, sin acción -->
        <span
          *ngIf="materia.estado === 'APROBADA'"
          class="text-[10px] text-aprobada/50 opacity-0 group-hover:opacity-100"
        >
          ✓ Nota fija
        </span>
      </div>

      <!-- Prerrequisitos (solo BLOQUEADA) -->
      <div
        *ngIf="materia.prerrequisitosNombres.length > 0 && materia.estado === 'BLOQUEADA'"
        class="mt-3 pt-3 border-t border-slate-700/50"
      >
        <p class="text-[10px] text-slate-600 mb-1">Requiere:</p>
        <div class="flex flex-wrap gap-1">
          <span
            *ngFor="let pre of materia.prerrequisitosNombres"
            class="text-[10px] bg-slate-700/50 text-slate-500 px-1.5 py-0.5 rounded"
          >
            {{ pre }}
          </span>
        </div>
      </div>

      <!-- Nota de reprobada -->
      <div *ngIf="materia.estado === 'REPROBADA'" class="mt-3 pt-3 border-t border-red-500/10">
        <p class="text-[10px] text-red-400/70">Materia reprobada — puedes volver a matricularla</p>
      </div>

      <!-- Glow DISPONIBLE -->
      <div
        *ngIf="materia.estado === 'DISPONIBLE'"
        class="absolute inset-0 rounded-xl ring-1 ring-disponible/30 pointer-events-none"
      ></div>

      <!-- Glow MATRICULADA -->
      <div
        *ngIf="materia.estado === 'MATRICULADA'"
        class="absolute inset-0 rounded-xl ring-1 ring-blue-500/30 pointer-events-none"
      ></div>
    </div>
  `,
})
export class MateriaCardComponent {
  @Input({ required: true }) materia!: MateriaEstadoDTO;
  @Output() accion = new EventEmitter<AccionCardEvent>();
  @Input() loadingAction: AccionCard | null = null;

  emit(tipo: AccionCard) {
    this.accion.emit({ materia: this.materia, accion: tipo });
  }

  get cardClass(): string {
    const map: Record<EstadoMateria, string> = {
      APROBADA: 'bg-slate-800/60 border-aprobada/20 hover:border-aprobada/30 cursor-default',
      DISPONIBLE:
        'bg-slate-800/80 border-disponible/30 hover:border-disponible/60 hover:bg-slate-800 shadow-lg shadow-disponible/5 cursor-pointer',
      BLOQUEADA: 'bg-slate-900/60 border-slate-800/50 opacity-50 cursor-default',
      MATRICULADA:
        'bg-slate-800/80 border-blue-500/30 hover:border-blue-500/50 hover:bg-slate-800 shadow-lg shadow-blue-500/5 cursor-pointer',
      REPROBADA:
        'bg-slate-800/60 border-red-500/20 hover:border-red-500/40 hover:bg-slate-800 cursor-pointer',
    };
    return map[this.materia.estado] ?? '';
  }

  get nameClass(): string {
    const map: Record<EstadoMateria, string> = {
      APROBADA: 'text-slate-300',
      DISPONIBLE: 'text-white',
      BLOQUEADA: 'text-slate-500',
      MATRICULADA: 'text-white',
      REPROBADA: 'text-slate-300',
    };
    return map[this.materia.estado] ?? 'text-slate-400';
  }
}
