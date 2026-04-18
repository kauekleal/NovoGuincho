import { Component, OnInit, OnDestroy } from '@angular/core';
import { FinanceiroService, Despesa, Guinchada } from '../../services/financeiro.service';
import { Subscription } from 'rxjs';

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

  private subs = new Subscription();

  constructor(private financeiroService: FinanceiroService) {}

  ngOnInit() {
    this.financeiroService.loadExpenses();
    this.financeiroService.loadServices();

    this.subs.add(
      this.financeiroService.despesas$.subscribe(res => {
        this.despesas = res;
      })
    );
    this.subs.add(
      this.financeiroService.guinchadas$.subscribe(res => {
        this.guinchadas = res;
      })
    );
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
}
