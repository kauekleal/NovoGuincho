import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelatoriosPage } from './relatorios.page';

describe('RelatoriosPage', () => {
  let component: RelatoriosPage;
  let fixture: ComponentFixture<RelatoriosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatoriosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
