import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { PensumService } from '../../../core/services/pensum.service';
import { AuthService } from '../../../core/services/auth.service';
import { MateriaEstadoDTO } from '../../../models/materia-estado.dto';
import { MateriaCardComponent } from '../../../shared/components/materia-card/materia-card.component';
import { ModalNotaComponent } from '../modal-nota/modal-nota.component';
import { VistaGrafoComponent } from '../vista-grafo/vista-grafo.component';
import { ErrorModalComponent } from '../../error/error-modal.component';

type Vista = 'grilla' | 'grafo';
type Pagina = 'basico' | 'avanzado';

@Component({
  selector: 'app-pensum',
  templateUrl: './pensum.component.html',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgTemplateOutlet,
    MateriaCardComponent,
    ModalNotaComponent,
    VistaGrafoComponent,
    ErrorModalComponent,
  ],
})
export class PensumComponent implements OnInit {
  materias: MateriaEstadoDTO[] = [];
  loading = true;
  errorMsg: string | null = null;
  vistaActiva: Vista = 'grilla';
  paginaActiva: Pagina = 'basico';
  materiaSeleccionada: MateriaEstadoDTO | null = null;

  readonly semestresBasico = [1, 2, 3, 4, 5];
  readonly semestresAvanzado = [6, 7, 8, 9];

  constructor(
    public pensumService: PensumService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // ── Stats ────────────────────────────────────────────────
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

  // ── Progreso por bloque (para los botones de paginación) ─
  progresoPorBloque(bloque: Pagina): number {
    const sems = bloque === 'basico' ? this.semestresBasico : this.semestresAvanzado;
    const delBloque = this.materias.filter((m) => sems.includes(m.semestre));
    const aprobadas = delBloque.filter((m) => m.estado === 'APROBADA').length;
    return delBloque.length > 0 ? (aprobadas / delBloque.length) * 100 : 0;
  }

  aprobadorPorBloque(bloque: Pagina): number {
    const sems = bloque === 'basico' ? this.semestresBasico : this.semestresAvanzado;
    return this.materias.filter((m) => sems.includes(m.semestre) && m.estado === 'APROBADA').length;
  }

  totalPorBloque(bloque: Pagina): number {
    const sems = bloque === 'basico' ? this.semestresBasico : this.semestresAvanzado;
    return this.materias.filter((m) => sems.includes(m.semestre)).length;
  }

  // ── Data ─────────────────────────────────────────────────
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
        this.errorMsg = err.error?.mensaje ?? 'Error cargando la malla.';
        this.loading = false;
      },
    });
  }

  filtrarPorSemestre(num: number): MateriaEstadoDTO[] {
    const orden: Record<string, number> = { APROBADA: 0, DISPONIBLE: 1, BLOQUEADA: 2 };
    return this.materias
      .filter((m) => m.semestre === num)
      .sort((a, b) => {
        const diff = orden[a.estado] - orden[b.estado];
        return diff !== 0 ? diff : a.nombre.localeCompare(b.nombre);
      });
  }

  // ── Modal ─────────────────────────────────────────────────
  abrirModal(materia: MateriaEstadoDTO): void {
    this.materiaSeleccionada = materia;
  }
  cerrarModal(): void {
    this.materiaSeleccionada = null;
  }
  onGuardado(): void {
    this.cerrarModal();
    this.cargarDatos();
  }

  // ── Auth ──────────────────────────────────────────────────
  onLogout(): void {
    this.authService.logout();
  }
}
