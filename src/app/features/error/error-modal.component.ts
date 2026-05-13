// shared/components/error-modal/error-modal.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorModalService } from '../../core/services/error-modal.service';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="svc.mensaje()"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      (click)="svc.cerrar()"
    >
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

      <div
        class="relative bg-slate-800 border border-red-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-slide-up"
        (click)="$event.stopPropagation()"
      >
        <!-- Ícono -->
        <div class="flex justify-center mb-4">
          <div class="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              class="w-6 h-6 text-red-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        <h3 class="text-white font-semibold text-center mb-2">Acción no permitida</h3>
        <p class="text-slate-400 text-sm text-center leading-relaxed mb-6">
          {{ svc.mensaje() }}
        </p>

        <button (click)="svc.cerrar()" class="btn-primary w-full">Entendido</button>
      </div>
    </div>
  `,
})
export class ErrorModalComponent {
  svc = inject(ErrorModalService);
}
