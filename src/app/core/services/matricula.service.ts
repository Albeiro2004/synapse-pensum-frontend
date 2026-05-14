import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface MatricularRequest {
  estudianteId: string;
  materiaId: string;
}

@Injectable({ providedIn: 'root' })
export class MatriculaService {
  constructor(private http: HttpClient) {}

  matricular(request: MatricularRequest) {
    return this.http.post<void>(`${environment.apiUrl}/matricula`, request);
  }

  cancelar(request: MatricularRequest) {
    return this.http.delete<void>(`${environment.apiUrl}/matricula`, { body: request });
  }
}
