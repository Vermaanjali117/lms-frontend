import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req,next)=>{
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();
    const authReq = addToken(req, token);
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse)=>{
            if (error.status === 401) {
                return authService.refreshToken().pipe(
                    switchMap((response: any) => {
                        const newReq = addToken(req, response.accessToken);
                        return next(newReq);
                    }),
                    catchError((refreshError) => {
                        authService.clearAuth();
                        router.navigate(['/auth/login']);
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};


function addToken(req: HttpRequest<any>, token: string | null) {
    if (token) {
        return req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        });
    }
    return req;
}