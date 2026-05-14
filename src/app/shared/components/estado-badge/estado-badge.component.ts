import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoMateria } from '../../../models/estado.enum';

@Component({
  selector: 'app-estado-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass">
      <span class="w-1.5 h-1.5 rounded-full inline-block mr-1.5" [class]="dotClass"></span>
      {{ label }}
    </span>
  `,
})
export class EstadoBadgeComponent {
  @Input() estado: EstadoMateria = 'BLOQUEADA';

  get badgeClass(): string {
    const map: Record<EstadoMateria, string> = {
      APROBADA: 'badge-aprobada',
      DISPONIBLE: 'badge-disponible',
      BLOQUEADA: 'badge-bloqueada',
      MATRICULADA:
        'bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium px-2 py-0.5 rounded-full',
      REPROBADA:
        'bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium px-2 py-0.5 rounded-full',
    };
    return map[this.estado] ?? 'badge-bloqueada';
  }

  get dotClass(): string {
    const map: Record<EstadoMateria, string> = {
      APROBADA: 'bg-aprobada',
      DISPONIBLE: 'bg-disponible',
      BLOQUEADA: 'bg-slate-500',
      MATRICULADA: 'bg-blue-400',
      REPROBADA: 'bg-red-400',
    };
    return map[this.estado] ?? 'bg-slate-500';
  }

  get label(): string {
    const map: Record<EstadoMateria, string> = {
      APROBADA: 'Aprobada',
      DISPONIBLE: 'Disponible',
      BLOQUEADA: 'Bloqueada',
      MATRICULADA: 'Matriculada',
      REPROBADA: 'Reprobada',
    };
    return map[this.estado] ?? this.estado;
  }
}
