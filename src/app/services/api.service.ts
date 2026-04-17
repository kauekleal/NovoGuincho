import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ExpenseResponse {
  id: string;
  category: string;
  value: string;
  description?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  category: string;
  value: number;
  description?: string;
  date?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  getExpenses(): Observable<ExpenseResponse[]> {
    return this.http.get<ExpenseResponse[]>(`${environment.apiUrl}/expenses`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  createExpense(payload: CreateExpensePayload): Observable<ExpenseResponse> {
    return this.http.post<ExpenseResponse>(`${environment.apiUrl}/expenses`, payload, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/expenses/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
