import { Component, OnInit, OnDestroy } from '@angular/core';
import { FinanceiroService, Despesa, Guinchada } from '../../services/financeiro.service';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
  standalone: false,
})
export class HistoricoPage implements OnInit, OnDestroy {
  public tipoAlvo: 'despesas' | 'guinchadas' = 'despesas';
  public despesas: Despesa[] = [];
  public guinchadas: Guinchada[] = [];
  public selectedDate: Date = new Date();

  private subs = new Subscription();

  constructor(private financeiroService: FinanceiroService) {}

  ngOnInit() {
    this.financeiroService.loadExpenses();
    this.financeiroService.loadServices();

    this.subs.add(
      combineLatest([
        this.financeiroService.despesas$,
        this.financeiroService.guinchadas$,
        this.financeiroService.selectedDate$
      ]).subscribe(([allDespesas, allGuinchadas, date]) => {
        const selYearMonth = this.getCompetencia(date);

        this.despesas = allDespesas.filter(d => this.getCompetencia(d.data) === selYearMonth);
        this.guinchadas = allGuinchadas.filter(g => this.getCompetencia(g.data) === selYearMonth);

        this.selectedDate = date;
      })
    );
  }

  private getCompetencia(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    if (typeof date === 'string' && date.length >= 7) {
      return date.substring(0, 7);
    }

    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  excluirDespesa(id: string) {
    this.financeiroService.deleteDespesa(id);
  }

  excluirGuinchada(id: string) {
    this.financeiroService.deleteGuinchada(id);
  }

  // Month Navigation
  mesAnterior() {
    this.financeiroService.prevMonth();
  }

  proximoMes() {
    this.financeiroService.nextMonth();
  }

  getMonthName(): string {
    const names = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${names[this.selectedDate.getMonth()]} ${this.selectedDate.getFullYear()}`;
  }
}
