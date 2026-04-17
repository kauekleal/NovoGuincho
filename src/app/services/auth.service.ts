import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    name?: string;
    email?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'apiGuinchoToken';
  public token$ = new BehaviorSubject<string | null>(this.getToken());

  constructor(private http: HttpClient) {}

  register(
    username: string,
    name: string,
    email: string,
    password: string,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
        username,
        name,
        email,
        password,
      })
      .pipe(
        tap((response) => {
          this.saveToken(response.token);
        }),
      );
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
        username,
        password,
      })
      .pipe(
        tap((response) => {
          this.saveToken(response.token);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.token$.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getAuthHeaders(): { Authorization?: string } {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.token$.next(token);
  }
}
