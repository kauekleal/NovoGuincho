import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService, ExpenseResponse } from './api.service';
import { ServiceService, ServiceResponse } from './service.service';

export interface Despesa {
  id: string;
  categoria: string;
  valor: number;
  data: Date;
  descricao?: string;
}

export interface Guinchada {
  id: string;
  valor: number;
  data: Date;
  descricao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private despesas = new BehaviorSubject<Despesa[]>([]);
  private guinchadas = new BehaviorSubject<Guinchada[]>([]);
  private selectedDate = new BehaviorSubject<Date>(new Date());

  despesas$ = this.despesas.asObservable();
  guinchadas$ = this.guinchadas.asObservable();
  selectedDate$ = this.selectedDate.asObservable();

  private readonly expenseCategories = [
    'Gasolina',
    'Pedágio',
    'Manutenção',
    'Pessoal',
    'Outros'
  ];

  constructor(
    private apiService: ApiService,
    private serviceService: ServiceService,
  ) {}

  loadExpenses() {
    this.apiService.getExpenses().subscribe({
      next: (expenses) => this.syncExpensesFromBackend(expenses),
      error: (error) => {
        console.error('Erro ao carregar despesas do backend:', error);
      }
    });
  }

  loadServices() {
    this.serviceService.getServices().subscribe({
      next: (services) => this.syncServicesFromBackend(services),
      error: (error) => {
        console.error('Erro ao carregar serviços do backend:', error);
      }
    });
  }

  addDespesa(d: Partial<Despesa>) {
    const payload = {
      category: d.categoria || 'Outros',
      value: d.valor || 0,
      description: d.descricao || '',
      date: d.data ? new Date(d.data).toISOString() : new Date().toISOString()
    };

    this.apiService.createExpense(payload).subscribe({
      next: (expense) => {
        const atual = this.despesas.getValue();
        this.despesas.next([
          {
            id: expense.id,
            categoria: expense.category,
            valor: Number(expense.value),
            data: new Date(expense.date || expense.createdAt),
            descricao: expense.description
          },
          ...atual
        ]);
      },
      error: (error) => {
        console.error('Erro ao criar despesa no backend:', error);
      }
    });
  }

  addGuinchada(g: Partial<Guinchada>) {
    const payload = {
      value: Number(g.valor) || 0,
      description: g.descricao || '',
      date: g.data ? new Date(g.data).toISOString() : new Date().toISOString()
    };

    this.serviceService.createService(payload).subscribe({
      next: (service) => {
        const atual = this.guinchadas.getValue();
        this.guinchadas.next([
          {
            id: service.id,
            valor: Number(service.value),
            data: new Date(service.date || service.createdAt),
            descricao: service.description
          },
          ...atual
        ]);
      },
      error: (error) => {
        console.error('Erro ao criar serviço no backend:', error);
      }
    });
  }

  deleteDespesa(id: string) {
    this.apiService.deleteExpense(id).subscribe({
      next: () => {
        const atual = this.despesas.getValue();
        this.despesas.next(atual.filter(d => d.id !== id));
      },
      error: (error) => {
        console.error('Erro ao excluir despesa no backend:', error);
      }
    });
  }

  deleteGuinchada(id: string) {
    this.serviceService.deleteService(id).subscribe({
      next: () => {
        const atual = this.guinchadas.getValue();
        this.guinchadas.next(atual.filter(g => g.id !== id));
      },
      error: (error) => {
        console.error('Erro ao excluir serviço no backend:', error);
      }
    });
  }

  getResumo() {
    const dTot = this.despesas.getValue().reduce((acc, crr) => acc + Number(crr.valor || 0), 0);
    const rTot = this.guinchadas.getValue().reduce((acc, crr) => acc + Number(crr.valor || 0), 0);
    return {
      despesasTotais: dTot,
      receitaTotal: rTot,
      lucroLiquido: rTot - dTot
    };
  }

  // Month Filtering Logic
  getSelectedDate() {
    return this.selectedDate.getValue();
  }

  updateSelectedDate(date: Date) {
    this.selectedDate.next(date);
  }

  nextMonth() {
    const current = this.selectedDate.getValue();
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.selectedDate.next(next);
  }

  prevMonth() {
    const current = this.selectedDate.getValue();
    const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.selectedDate.next(prev);
  }

  private syncExpensesFromBackend(expenses: ExpenseResponse[]) {
    const despesas: Despesa[] = expenses.map((expense) => ({
      id: expense.id,
      categoria: this.expenseCategories.includes(expense.category)
        ? expense.category
        : 'Outros',
      valor: Number(expense.value),
      data: new Date(expense.date || expense.createdAt),
      descricao: expense.description
    }));

    this.despesas.next(despesas);
  }

  private syncServicesFromBackend(services: ServiceResponse[]) {
    const guinchadas: Guinchada[] = services.map((service) => ({
      id: service.id,
      valor: Number(service.value),
      data: new Date(service.date || service.createdAt),
      descricao: service.description
    }));

    this.guinchadas.next(guinchadas);
  }

}
