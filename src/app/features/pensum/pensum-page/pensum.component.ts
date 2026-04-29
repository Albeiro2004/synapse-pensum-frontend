import { Component, OnInit, computed } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { PensumService } from '../../../core/services/pensum.service';
import { AuthService } from '../../../core/services/auth.service';
import { MateriaEstadoDTO } from '../../../models/materia-estado.dto';
import { MateriaCardComponent } from '../../../shared/components/materia-card/materia-card.component';
import { ModalNotaComponent } from '../modal-nota/modal-nota.component';
import { VistaGrafoComponent } from '../vista-grafo/vista-grafo.component';

type Vista = 'grilla' | 'grafo';

@Component({
  selector: 'app-pensum',
  templateUrl: './pensum.component.html',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    MateriaCardComponent,
    ModalNotaComponent,
    VistaGrafoComponent,
  ],
})
export class PensumComponent implements OnInit {

  // ── Estado ──────────────────────────────────────────────
  materias: MateriaEstadoDTO[] = [];
  semestres: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  loading = true;
  errorMsg: string | null = null;
  vistaActiva: Vista = 'grilla';
  materiaSeleccionada: MateriaEstadoDTO | null = null;

  // ── Stats (se recalculan cada vez que cambian las materias) ──
  get stats() {
    return this.pensumService.getStats();
  }

  get progresoPorc(): number {
    const s = this.stats;
    return s.total > 0 ? (s.aprobadas / s.total) * 100 : 0;
  }

  get inicial(): string {
    return this.authService.nombreCompleto().charAt(0).toUpperCase() || 'E';
  }

  // ── Constructor ─────────────────────────────────────────
  constructor(
    public pensumService: PensumService,
    public authService: AuthService,
  ) {}

  // ── Lifecycle ───────────────────────────────────────────
  ngOnInit(): void {
    this.cargarDatos();
  }

  // ── Data ────────────────────────────────────────────────
  cargarDatos(): void {
    const id = this.authService.estudianteId();
    if (!id) {
      this.authService.logout();
      return;
    }

    this.loading = true;
    this.errorMsg = null;

    this.pensumService.cargarPensum(id).subscribe({
      next: (data) => {
        this.materias = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.mensaje ?? 'Error cargando la malla. Intenta nuevamente.';
        this.loading = false;
      },
    });
  }

  // ── Filtro por semestre ──────────────────────────────────
  filtrarPorSemestre(num: number): MateriaEstadoDTO[] {
    return this.materias
      .filter(m => m.semestre === num)
      .sort((a, b) => {
        // Aprobadas primero, luego disponibles, luego bloqueadas
        const orden = { APROBADA: 0, DISPONIBLE: 1, BLOQUEADA: 2 };
        const diff = orden[a.estado] - orden[b.estado];
        return diff !== 0 ? diff : a.nombre.localeCompare(b.nombre);
      });
  }

  // ── Modal ────────────────────────────────────────────────
  abrirModal(materia: MateriaEstadoDTO): void {
    this.materiaSeleccionada = materia;
  }

  cerrarModal(): void {
    this.materiaSeleccionada = null;
  }

  onGuardado(): void {
    this.cerrarModal();
    this.cargarDatos(); // Recarga el grafo completo para reflejar nuevos estados
  }

  // ── Auth ─────────────────────────────────────────────────
  onLogout(): void {
    this.authService.logout();
  }
}
