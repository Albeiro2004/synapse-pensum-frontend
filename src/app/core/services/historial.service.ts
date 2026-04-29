import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface NotaRequest {
  estudianteId: string;
  materiaId: string;
  nota: number;
}

@Injectable({ providedIn: 'root' })
export class HistorialService {
  constructor(private http: HttpClient) {}

  registrarNota(request: NotaRequest) {
    return this.http.post<void>(
      `${environment.apiUrl}/academico/nota`,
      request
    );
  }

  actualizarNota(request: NotaRequest) {
    return this.http.put<void>(
      `${environment.apiUrl}/academico/nota`,
      request
    );
  }
}
