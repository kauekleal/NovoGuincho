import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { FinanceiroService } from '../../services/financeiro.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.page.html',
  styleUrls: ['./relatorios.page.scss'],
  standalone: false
})
export class RelatoriosPage implements OnInit, OnDestroy {

  // Resumo
  public resumo = { despesasTotais: 0, receitaTotal: 0, lucroLiquido: 0 };

  // Modals state
  public isGuinchadaModalOpen = false;
  public isDespesaModalOpen = false;

  // Forms
  public formGuinchada: any = { valor: null, descricao: '', data: new Date().toISOString() };
  public formDespesa: any = { valor: null, categoria: 'Gasolina', descricao: '', data: new Date().toISOString() };

  private subs: Subscription = new Subscription();

  // 1. Lucro Mensal (Bar Chart) - Full year
  public lucroChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      label: 'Receita (R$)',
      backgroundColor: 'rgba(255, 122, 0, 0.75)',
      borderColor: 'rgba(255, 122, 0, 1)',
      borderWidth: 1,
      borderRadius: 5
    }]
  };
  public lucroChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { color: 'rgba(255,255,255,0.1)' } }, y: { grid: { color: 'rgba(255,255,255,0.1)' } } },
    color: '#fff'
  };

  // 2. Despesas por Categoria (Doughnut Chart)
  public despesasChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Gasolina', 'Pedágio', 'Manutenção', 'Pessoal', 'Outros'],
    datasets: [{
      data: [0, 0, 0, 0, 0], // starting empty
      backgroundColor: ['#ff7a00', '#00bcd4', '#8bc34a', '#e91e63', '#ffc107'],
      hoverOffset: 4,
      borderColor: '#000000'
    }]
  };
  public despesasChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } },
    color: '#fff'
  };

  constructor(private financeiroService: FinanceiroService) { }

  ngOnInit() {
    this.financeiroService.loadExpenses();

    this.subs.add(
      this.financeiroService.despesas$.subscribe(despesas => {
        this.resumo = this.financeiroService.getResumo();
        this.updateDespesasChart(despesas);
      })
    );

    this.subs.add(
      this.financeiroService.guinchadas$.subscribe(guinchadas => {
        this.resumo = this.financeiroService.getResumo();
        this.updateLucroChart(guinchadas);
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  updateDespesasChart(despesas: any[]) {
    const categoriasVisiveis = ['Gasolina', 'Pedágio', 'Manutenção', 'Pessoal', 'Outros'];
    const map = { Gasolina: 0, Pedágio: 0, Manutenção: 0, Pessoal: 0, Outros: 0 };
    
    despesas.forEach(d => {
      if (map[d.categoria as keyof typeof map] !== undefined) {
        map[d.categoria as keyof typeof map] += d.valor;
      } else {
        map['Outros'] += d.valor;
      }
    });

    // Update chart data immutably for ng2-charts to detect changes
    this.despesasChartData = {
      labels: categoriasVisiveis,
      datasets: [
        {
          ...this.despesasChartData.datasets[0],
          data: [map.Gasolina, map['Pedágio'], map['Manutenção'], map.Pessoal, map.Outros]
        }
      ]
    };
  }

  updateLucroChart(guinchadas: any[]) {
    const newData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const anoAtual = new Date().getFullYear();
    
    guinchadas.forEach(g => {
      const gDate = new Date(g.data);
      if (gDate.getFullYear() === anoAtual) {
        newData[gDate.getMonth()] += g.valor;
      }
    });

    this.lucroChartData = {
      labels: this.lucroChartData.labels,
      datasets: [
        {
          ...this.lucroChartData.datasets[0],
          data: newData
        }
      ]
    };
  }

  // Action Methods
  salvarGuinchada() {
    if (!this.formGuinchada.valor) return;
    this.financeiroService.addGuinchada({
      valor: Number(this.formGuinchada.valor),
      descricao: this.formGuinchada.descricao,
      data: new Date(this.formGuinchada.data)
    });
    this.formGuinchada = { valor: null, descricao: '', data: new Date().toISOString() };
    this.isGuinchadaModalOpen = false;
  }

  salvarDespesa() {
    if (!this.formDespesa.valor) return;
    this.financeiroService.addDespesa({
      valor: Number(this.formDespesa.valor),
      categoria: this.formDespesa.categoria,
      descricao: this.formDespesa.descricao,
      data: new Date(this.formDespesa.data)
    });
    this.formDespesa = { valor: null, categoria: 'Gasolina', descricao: '', data: new Date().toISOString() };
    this.isDespesaModalOpen = false;
  }

  onDespesaDateChange(event: any) {
    this.formDespesa.data = event.detail.value;
  }

  onGuinchadaDateChange(event: any) {
    this.formGuinchada.data = event.detail.value;
  }

}
