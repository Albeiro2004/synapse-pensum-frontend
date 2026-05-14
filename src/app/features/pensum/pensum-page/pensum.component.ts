import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { PensumService } from '../../../core/services/pensum.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatriculaService } from '../../../core/services/matricula.service';
import { MateriaEstadoDTO } from '../../../models/materia-estado.dto';
import {
  MateriaCardComponent,
  AccionCardEvent,
  AccionCard,
} from '../../../shared/components/materia-card/materia-card.component';
import { ModalNotaComponent } from '../modal-nota/modal-nota.component';
import { VistaGrafoComponent } from '../vista-grafo/vista-grafo.component';
import { ErrorModalComponent } from '../../error/error-modal.component';
import { finalize } from 'rxjs';

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
  materiaParaNota: MateriaEstadoDTO | null = null;
  loadingAction: AccionCard | null = null;

  readonly semestresBasico = [1, 2, 3, 4, 5];
  readonly semestresAvanzado = [6, 7, 8, 9];

  constructor(
    public pensumService: PensumService,
    public authService: AuthService,
    private matriculaService: MatriculaService,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

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

  progresoPorBloque(bloque: Pagina): number {
    const sems = bloque === 'basico' ? this.semestresBasico : this.semestresAvanzado;
    const del = this.materias.filter((m) => sems.includes(m.semestre));
    const aprobadas = del.filter((m) => m.estado === 'APROBADA').length;
    return del.length > 0 ? (aprobadas / del.length) * 100 : 0;
  }

  aprobadorPorBloque(bloque: Pagina): number {
    const sems = bloque === 'basico' ? this.semestresBasico : this.semestresAvanzado;
    return this.materias.filter((m) => sems.includes(m.semestre) && m.estado === 'APROBADA').length;
  }

  totalPorBloque(bloque: Pagina): number {
    const sems = bloque === 'basico' ? this.semestresBasico : this.semestresAvanzado;
    return this.materias.filter((m) => sems.includes(m.semestre)).length;
  }

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
    const orden: Record<string, number> = {
      MATRICULADA: 0,
      APROBADA: 1,
      DISPONIBLE: 2,
      REPROBADA: 3,
      BLOQUEADA: 4,
    };
    return this.materias
      .filter((m) => m.semestre === num)
      .sort((a, b) => {
        const diff = orden[a.estado] - orden[b.estado];
        return diff !== 0 ? diff : a.nombre.localeCompare(b.nombre);
      });
  }

  onAccion(event: AccionCardEvent): void {
    const { materia, accion } = event;

    // 1. Nota → solo abre modal, no requiere loading
    if (accion === 'nota') {
      this.materiaParaNota = materia;
      return;
    }

    // 2. Delegamos a los métodos privados
    if (accion === 'matricular') this.matricular(materia);
    else if (accion === 'cancelar') this.cancelarMatricula(materia);
  }

  private matricular(materia: MateriaEstadoDTO): void {
    const estudianteId = this.authService.estudianteId();
    if (!estudianteId) return;

    this.loadingAction = 'matricular';
    this.matriculaService
      .matricular({ estudianteId, materiaId: materia.id })
      .pipe(finalize(() => (this.loadingAction = null))) // ✅ Se ejecuta SIEMPRE (éxito o error)
      .subscribe({
        next: () => this.cargarDatos(),
        error: (err) => console.error('Error al matricular', err),
      });
  }

  private cancelarMatricula(materia: MateriaEstadoDTO): void {
    const estudianteId = this.authService.estudianteId();
    if (!estudianteId) return;

    this.loadingAction = 'cancelar';
    this.matriculaService
      .cancelar({ estudianteId, materiaId: materia.id })
      .pipe(finalize(() => (this.loadingAction = null)))
      .subscribe({
        next: () => this.cargarDatos(),
        error: (err) => console.error('Error al cancelar', err),
      });
  }

  cerrarModal(): void {
    this.materiaParaNota = null;
  }
  onGuardado(): void {
    this.cerrarModal();
    this.cargarDatos();
  }
  onLogout(): void {
    this.authService.logout();
  }
}
