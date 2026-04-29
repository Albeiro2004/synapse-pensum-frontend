import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MateriaEstadoDTO } from '../../models/materia-estado.dto';

@Injectable({ providedIn: 'root' })
export class PensumService {
  private _materias = signal<MateriaEstadoDTO[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly materias = this._materias.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private http: HttpClient) {}

  /** Carga el pensum completo del estudiante y actualiza el signal interno */
  cargarPensum(estudianteId: string) {
    this._loading.set(true);
    this._error.set(null);
    return this.http
      .get<MateriaEstadoDTO[]>(
        `${environment.apiUrl}/academico/disponibles/${estudianteId}`
      )
      .pipe(
        tap({
          next: data => {
            this._materias.set(data);
            this._loading.set(false);
          },
          error: err => {
            this._error.set(err.error?.mensaje ?? 'Error cargando el pensum');
            this._loading.set(false);
          },
        })
      );
  }

  /** Agrupa materias por semestre ordenadas (1→9) */
  getMateriasPorSemestre(): Map<number, MateriaEstadoDTO[]> {
    const map = new Map<number, MateriaEstadoDTO[]>();
    for (const m of this._materias()) {
      if (!map.has(m.semestre)) map.set(m.semestre, []);
      map.get(m.semestre)!.push(m);
    }
    return new Map([...map.entries()].sort((a, b) => a[0] - b[0]));
  }

  /** Estadísticas derivadas del estado actual del grafo */
  getStats() {
    const all = this._materias();
    return {
      total: all.length,
      aprobadas: all.filter(m => m.estado === 'APROBADA').length,
      disponibles: all.filter(m => m.estado === 'DISPONIBLE').length,
      bloqueadas: all.filter(m => m.estado === 'BLOQUEADA').length,
      creditosAprobados: all
        .filter(m => m.estado === 'APROBADA')
        .reduce((s, m) => s + m.creditos, 0),
      creditosTotales: all.reduce((s, m) => s + m.creditos, 0),
    };
  }
}
