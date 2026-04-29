import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  LoginRequestDTO,
  LoginResponseDTO,
  RegistroRequestDTO
} from '../../models/login.dto';

const SESSION_KEY = 'synapse_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _session = signal<LoginResponseDTO | null>(this.loadSession());

  readonly session = this._session.asReadonly();
  readonly isLoggedIn = computed(() => !!this._session());
  readonly estudianteId = computed(() => this._session()?.id ?? null);
  readonly nombreCompleto = computed(() => this._session()?.nombreCompleto ?? '');

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequestDTO) {
    return this.http
      .post<LoginResponseDTO>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap(res => this.saveSession(res)));
  }

  registro(request: RegistroRequestDTO) {
    return this.http
      .post<LoginResponseDTO>(`${environment.apiUrl}/auth/registro`, request)
      .pipe(tap(res => this.saveSession(res)));
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
    this._session.set(null);
    this.router.navigate(['/login']);
  }

  private saveSession(res: LoginResponseDTO) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(res));
    this._session.set(res);
  }

  private loadSession(): LoginResponseDTO | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
