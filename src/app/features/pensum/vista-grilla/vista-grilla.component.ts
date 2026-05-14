import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PensumService } from '../../../core/services/pensum.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  AccionCardEvent,
  MateriaCardComponent,
} from '../../../shared/components/materia-card/materia-card.component';
import { ModalNotaComponent } from '../modal-nota/modal-nota.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { MateriaEstadoDTO } from '../../../models/materia-estado.dto';

@Component({
  selector: 'app-vista-grilla',
  standalone: true,
  imports: [CommonModule, MateriaCardComponent, ModalNotaComponent, SpinnerComponent],
  template: `
    <div class="p-4 sm:p-6 max-w-7xl mx-auto">
      <!-- Stats bar -->
      <div
        *ngIf="!pensum.loading() && pensum.materias().length > 0"
        class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-in"
      >
        <div class="card p-4">
          <p class="text-xs text-slate-500 mb-1">Progreso</p>
          <div class="flex items-end gap-2">
            <span class="text-2xl font-display text-white">{{ stats().aprobadas }}</span>
            <span class="text-slate-500 text-sm mb-0.5">/ {{ stats().total }}</span>
          </div>
          <div class="h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
            <div
              class="h-full bg-aprobada rounded-full transition-all duration-700"
              [style.width.%]="progresoPorc()"
            ></div>
          </div>
          <p class="text-[10px] text-slate-600 mt-1">
            {{ progresoPorc() | number: '1.0-0' }}% completado
          </p>
        </div>

        <div class="card p-4">
          <p class="text-xs text-slate-500 mb-1">Disponibles</p>
          <span class="text-2xl font-display text-disponible">{{ stats().disponibles }}</span>
          <p class="text-[10px] text-slate-600 mt-1">materias por cursar</p>
        </div>

        <div class="card p-4">
          <p class="text-xs text-slate-500 mb-1">Créditos</p>
          <div class="flex items-end gap-2">
            <span class="text-2xl font-display text-white">{{ stats().creditosAprobados }}</span>
            <span class="text-slate-500 text-sm mb-0.5">/ {{ stats().creditosTotales }}</span>
          </div>
          <p class="text-[10px] text-slate-600 mt-1">créditos acumulados</p>
        </div>

        <div class="card p-4">
          <p class="text-xs text-slate-500 mb-1">Bloqueadas</p>
          <span class="text-2xl font-display text-slate-500">{{ stats().bloqueadas }}</span>
          <p class="text-[10px] text-slate-600 mt-1">sin prerrequisitos</p>
        </div>
      </div>

      <!-- Loading -->
      <app-spinner *ngIf="pensum.loading()" />

      <!-- Error -->
      <div *ngIf="pensum.error()" class="card p-8 text-center">
        <p class="text-red-400 mb-4">{{ pensum.error() }}</p>
        <button (click)="cargar()" class="btn-primary">Reintentar</button>
      </div>

      <!-- Semestres grid -->
      <div *ngIf="!pensum.loading() && !pensum.error()">
        <div
          *ngFor="let entry of semestresEntries; let i = index"
          class="mb-8 animate-slide-up"
          [style.animation-delay.ms]="i * 60"
        >
          <!-- Semester header -->
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
              [class]="semestreHeaderClass(entry[0])"
            >
              {{ entry[0] }}
            </div>
            <h2 class="text-sm font-medium text-slate-400">
              {{ semestreLabel(entry[0]) }}
            </h2>
            <div class="flex-1 h-px bg-slate-800"></div>
            <span class="text-xs text-slate-600">{{ entry[1].length }} materias</span>
          </div>

          <!-- Cards grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <app-materia-card
              *ngFor="let materia of entry[1]"
              [materia]="materia"
              (accion)="onAccion($event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <app-modal-nota
      *ngIf="materiaSeleccionada()"
      [materia]="materiaSeleccionada()!"
      (cerrar)="cerrarModal()"
      (guardado)="onGuardado()"
    />
  `,
})
export class VistaGrillaComponent implements OnInit {
  pensum = inject(PensumService);
  private auth = inject(AuthService);

  materiaSeleccionada = signal<MateriaEstadoDTO | null>(null);
  stats = computed(() => this.pensum.getStats());
  progresoPorc = computed(() => {
    const s = this.stats();
    return s.total > 0 ? (s.aprobadas / s.total) * 100 : 0;
  });

  get semestresEntries(): [number, MateriaEstadoDTO[]][] {
    return [...this.pensum.getMateriasPorSemestre().entries()];
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    const id = this.auth.estudianteId();
    if (id) this.pensum.cargarPensum(id).subscribe();
  }

  onAccion(event: AccionCardEvent) {
    if (event.accion === 'nota' || event.accion === 'matricular' || event.accion === 'cancelar') {
      this.materiaSeleccionada.set(event.materia);
    }
  }

  cerrarModal() {
    this.materiaSeleccionada.set(null);
  }

  onGuardado() {
    this.cerrarModal();
    this.cargar();
  }

  semestreLabel(sem: number): string {
    if (sem === 8 || sem === 9) return `Semestre ${sem} — Nivel Final`;
    return `Semestre ${sem}`;
  }

  semestreHeaderClass(sem: number): string {
    if (sem >= 8) return 'bg-disponible/20 text-disponible border border-disponible/30';
    return 'bg-slate-800 text-slate-400 border border-slate-700';
  }
}
