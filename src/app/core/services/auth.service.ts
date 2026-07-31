import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {
    effect(() => {
      console.log('currentUser:', this.currentUser());
    });
    effect(() => {
      console.log('isLoggedIn:', this.isLoggedIn());
    });
    effect(() => {
      console.log('userRole:', this.userRole());
    });
    this.token$.subscribe(token => {
      console.log('token:', token);
    });
  }

  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = environment.apiUrl;

  currentUser = signal<User | null>(null);

  isLoggedIn = computed(() => !!this.currentUser());

  userRole = computed(() => this.currentUser()?.role);

  private tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('accessToken')
  );

  token$ = this.tokenSubject.asObservable();
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(response => {
        console.log('Registration successful:', response);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }


  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data, {
      withCredentials: true // send cookies
    }).pipe(
      tap(response => {
        if (response.success) {
          // Store token
          localStorage.setItem('accessToken', response.accessToken);
          this.tokenSubject.next(response.accessToken);

          // Update signal
          this.currentUser.set(response.data);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }


  getMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`).pipe(
      tap(response => {
        if (response.success) {
          this.currentUser.set(response.data);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }


  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }


  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/refresh-token`, {}, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('accessToken', response.accessToken);
          this.tokenSubject.next(response.accessToken);
        }
      })
    );
  }


  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }


  clearAuth(): void {
    localStorage.removeItem('accessToken');
    this.tokenSubject.next(null);
    this.currentUser.set(null);
  }


  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }

}
