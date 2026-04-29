import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MateriaEstadoDTO } from '../../../models/materia-estado.dto';
import { EstadoBadgeComponent } from '../estado-badge/estado-badge.component';

@Component({
  selector: 'app-materia-card',
  standalone: true,
  imports: [CommonModule, EstadoBadgeComponent],
  template: `
    <div
      class="group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer select-none"
      [class]="cardClass"
      (click)="onCardClick()"
    >
      <!-- Semestre final badge -->
      <div *ngIf="materia.semestre >= 8"
           class="absolute -top-1.5 -right-1.5 bg-slate-600 text-slate-200 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-slate-500">
        Final
      </div>

      <!-- Header -->
      <div class="flex items-start justify-between gap-2 mb-3">
        <span class="text-xs font-mono text-slate-500 leading-none">{{ materia.codigo }}</span>
        <app-estado-badge [estado]="materia.estado" />
      </div>

      <!-- Name -->
      <h3 class="text-sm font-medium leading-snug mb-3" [class]="nameClass">
        {{ materia.nombre }}
      </h3>

      <!-- Footer info -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1 text-xs text-slate-500">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {{ materia.creditos }} cr
        </div>

        <!-- Action button -->
        <button *ngIf="materia.estado !== 'BLOQUEADA'"
                class="text-xs font-medium px-2 py-1 rounded-md transition-all duration-150 opacity-0 group-hover:opacity-100"
                [class]="actionBtnClass"
                (click)="$event.stopPropagation(); onAction()">
          {{ materia.estado === 'APROBADA' ? 'Editar nota' : 'Registrar nota' }}
        </button>
      </div>

      <!-- Prerrequisitos tooltip -->
      <div *ngIf="materia.prerrequisitosNombres.length > 0 && materia.estado === 'BLOQUEADA'"
           class="mt-3 pt-3 border-t border-slate-700/50">
        <p class="text-[10px] text-slate-600 mb-1">Requiere:</p>
        <div class="flex flex-wrap gap-1">
          <span *ngFor="let pre of materia.prerrequisitosNombres"
                class="text-[10px] bg-slate-700/50 text-slate-500 px-1.5 py-0.5 rounded">
            {{ pre }}
          </span>
        </div>
      </div>

      <!-- Glow overlay for DISPONIBLE -->
      <div *ngIf="materia.estado === 'DISPONIBLE'"
           class="absolute inset-0 rounded-xl ring-1 ring-disponible/30 pointer-events-none">
      </div>
    </div>
  `
})
export class MateriaCardComponent {
  @Input({ required: true }) materia!: MateriaEstadoDTO;
  @Output() accion = new EventEmitter<MateriaEstadoDTO>();

  get cardClass(): string {
    return {
      APROBADA: 'bg-slate-800/60 border-aprobada/20 hover:border-aprobada/40 hover:bg-slate-800',
      DISPONIBLE: 'bg-slate-800/80 border-disponible/30 hover:border-disponible/60 hover:bg-slate-800 shadow-lg shadow-disponible/5',
      BLOQUEADA: 'bg-slate-900/60 border-slate-800/50 opacity-60 cursor-default',
    }[this.materia.estado];
  }

  get nameClass(): string {
    return {
      APROBADA: 'text-slate-200',
      DISPONIBLE: 'text-white',
      BLOQUEADA: 'text-slate-500',
    }[this.materia.estado];
  }

  get actionBtnClass(): string {
    return {
      APROBADA: 'bg-slate-700 text-slate-300 hover:bg-slate-600',
      DISPONIBLE: 'bg-disponible/20 text-disponible hover:bg-disponible/30',
      BLOQUEADA: '',
    }[this.materia.estado];
  }

  onCardClick() {
    if (this.materia.estado !== 'BLOQUEADA') {
      this.accion.emit(this.materia);
    }
  }

  onAction() {
    this.accion.emit(this.materia);
  }
}
