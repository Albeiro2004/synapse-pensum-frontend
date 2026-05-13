import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ErrorModalService } from '../services/error-modal.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const errorModal = inject(ErrorModalService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        auth.logout();
      } else if (err.status === 400 && err.error?.mensaje) {
        errorModal.mostrar(err.error.mensaje);
      }
      return throwError(() => err);
    }),
  );
};
