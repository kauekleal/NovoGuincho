import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  public appPages = [
    { title: 'Login', url: '/login', icon: 'log-in' },
    { title: 'Cadastro', url: '/cadastro', icon: 'person-add' },
    { title: 'Dashboard', url: '/relatorios', icon: 'stats-chart' },
    { title: 'Controle de Lançamentos', url: '/historico', icon: 'list' },
  ];
  constructor() {}
}
