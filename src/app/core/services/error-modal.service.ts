import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorModalService {
  mensaje = signal<string | null>(null);

  mostrar(mensaje: string) {
    this.mensaje.set(mensaje);
  }
  cerrar() {
    this.mensaje.set(null);
  }
}
