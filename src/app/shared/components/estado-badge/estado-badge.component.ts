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
  `
})
export class EstadoBadgeComponent {
  @Input() estado: EstadoMateria = 'BLOQUEADA';

  get badgeClass(): string {
    return {
      APROBADA: 'badge-aprobada',
      DISPONIBLE: 'badge-disponible',
      BLOQUEADA: 'badge-bloqueada',
    }[this.estado];
  }

  get dotClass(): string {
    return {
      APROBADA: 'bg-aprobada',
      DISPONIBLE: 'bg-disponible',
      BLOQUEADA: 'bg-slate-500',
    }[this.estado];
  }

  get label(): string {
    return {
      APROBADA: 'Aprobada',
      DISPONIBLE: 'Disponible',
      BLOQUEADA: 'Bloqueada',
    }[this.estado];
  }
}
