import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService, ExpenseResponse } from './api.service';

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

  constructor(private apiService: ApiService) {}

  loadExpenses() {
    this.apiService.getExpenses().subscribe({
      next: (expenses) => this.syncFromBackend(expenses),
      error: (error) => {
        console.error('Erro ao carregar despesas do backend:', error);
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
        const atual = this.despesas.getValue();
        this.despesas.next([
          {
            id: expense.id,
            categoria: expense.category,
            valor: Number(expense.value),
            data: d.data ? new Date(d.data) : new Date(expense.createdAt),
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
      category: 'Guinchada',
      value: g.valor || 0,
      description: g.descricao || '',
      date: g.data ? new Date(g.data).toISOString() : undefined
    };

    this.apiService.createExpense(payload).subscribe({
      next: (expense) => {
        const atual = this.guinchadas.getValue();
        this.guinchadas.next([
          {
            id: expense.id,
            valor: Number(expense.value),
            data: g.data ? new Date(g.data) : new Date(expense.createdAt),
            descricao: expense.description
          },
          ...atual
        ]);
      },
      error: (error) => {
        console.error('Erro ao criar guinchada no backend:', error);
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
    this.apiService.deleteExpense(id).subscribe({
      next: () => {
        const atual = this.guinchadas.getValue();
        this.guinchadas.next(atual.filter(g => g.id !== id));
      },
      error: (error) => {
        console.error('Erro ao excluir guinchada no backend:', error);
      }
    });
  }

  getResumo() {
    const dTot = this.despesas.getValue().reduce((acc, crr) => acc + crr.valor, 0);
    const rTot = this.guinchadas.getValue().reduce((acc, crr) => acc + crr.valor, 0);
    return {
      despesasTotais: dTot,
      receitaTotal: rTot,
      lucroLiquido: rTot - dTot
    };
  }

  private syncFromBackend(expenses: ExpenseResponse[]) {
    const despesas: Despesa[] = [];
    const guinchadas: Guinchada[] = [];

    expenses.forEach((expense) => {
      const converted = {
        id: expense.id,
        valor: Number(expense.value),
        data: new Date(expense.createdAt),
        descricao: expense.description
      };

      if (expense.category === 'Guinchada' || expense.category.toLowerCase() === 'receita') {
        guinchadas.push(converted);
      } else {
        despesas.push({
          ...converted,
          categoria: this.expenseCategories.includes(expense.category)
            ? expense.category
            : 'Outros'
        });
      }
    });

    this.despesas.next(despesas);
    this.guinchadas.next(guinchadas);
  }
}
