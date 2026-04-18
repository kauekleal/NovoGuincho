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

  despesas$ = this.despesas.asObservable();
  guinchadas$ = this.guinchadas.asObservable();

  private readonly expenseCategories = [
    'Gasolina',
    'Pedágio',
    'Manutenção',
    'Pessoal',
    'Outros'
  ];

  private readonly customDatesKey = 'apiGuinchoCustomDates';

  constructor(
    private apiService: ApiService,
    private serviceService: ServiceService,
  ) {}

  private getCustomDates(): Record<string, string> {
    try {
      const raw = localStorage.getItem(this.customDatesKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveCustomDate(id: string, date: Date) {
    const all = this.getCustomDates();
    all[id] = date.toISOString();
    localStorage.setItem(this.customDatesKey, JSON.stringify(all));
  }

  private removeCustomDate(id: string) {
    const all = this.getCustomDates();
    delete all[id];
    localStorage.setItem(this.customDatesKey, JSON.stringify(all));
  }

  private resolveDate(id: string, fallback: string | Date): Date {
    const custom = this.getCustomDates()[id];
    return custom ? new Date(custom) : new Date(fallback);
  }

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
      date: d.data ? new Date(d.data).toISOString() : undefined
    };

    this.apiService.createExpense(payload).subscribe({
      next: (expense) => {
        const dataFinal = d.data ? new Date(d.data) : new Date(expense.createdAt);
        if (d.data) {
          this.saveCustomDate(expense.id, dataFinal);
        }
        const atual = this.despesas.getValue();
        this.despesas.next([
          {
            id: expense.id,
            categoria: expense.category,
            valor: Number(expense.value),
            data: dataFinal,
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
    };

    this.serviceService.createService(payload).subscribe({
      next: (service) => {
        const dataFinal = g.data ? new Date(g.data) : new Date(service.createdAt);
        if (g.data) {
          this.saveCustomDate(service.id, dataFinal);
        }
        const atual = this.guinchadas.getValue();
        this.guinchadas.next([
          {
            id: service.id,
            valor: Number(service.value),
            data: dataFinal,
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
        this.removeCustomDate(id);
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
        this.removeCustomDate(id);
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

  private syncExpensesFromBackend(expenses: ExpenseResponse[]) {
    const despesas: Despesa[] = expenses.map((expense) => ({
      id: expense.id,
      categoria: this.expenseCategories.includes(expense.category)
        ? expense.category
        : 'Outros',
      valor: Number(expense.value),
      data: this.resolveDate(expense.id, expense.createdAt),
      descricao: expense.description
    }));

    this.despesas.next(despesas);
  }

  private syncServicesFromBackend(services: ServiceResponse[]) {
    const guinchadas: Guinchada[] = services.map((service) => ({
      id: service.id,
      valor: Number(service.value),
      data: this.resolveDate(service.id, service.createdAt),
      descricao: service.description
    }));

    this.guinchadas.next(guinchadas);
  }
}
