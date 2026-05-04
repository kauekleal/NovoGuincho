import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ServiceResponse {
  id: string;
  userId: string;
  value: number | string;
  description: string;
  date?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicePayload {
  value: number;
  description: string;
  date?: string;
}

export interface UpdateServicePayload {
  value?: number;
  description?: string;
  date?: string;
}


@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  getServices(): Observable<ServiceResponse[]> {
    return this.http.get<ServiceResponse[]>(`${environment.apiUrl}/service`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  getService(id: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${environment.apiUrl}/service/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  createService(payload: CreateServicePayload): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(`${environment.apiUrl}/service`, payload, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  updateService(id: string, payload: UpdateServicePayload): Observable<ServiceResponse> {
    return this.http.patch<ServiceResponse>(`${environment.apiUrl}/service/${id}`, payload, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/service/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
