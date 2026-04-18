import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: false,
})
export class CadastroPage implements OnInit {
  public nome = '';
  public username = '';
  public telefone = '';
  public email = '';
  public senha = '';
  public confirmarSenha = '';

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router,
  ) {}

  ngOnInit() {}

  private isEmailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  async criarConta() {
    if (!this.nome.trim() || !this.username.trim() || !this.email.trim() || !this.senha.trim() || !this.confirmarSenha.trim()) {
      const toast = await this.toastController.create({
        message: 'Preencha todos os campos para criar a conta.',
        duration: 1800,
        color: 'warning',
        position: 'top',
      });
      await toast.present();
      return;
    }

    if (!this.isEmailValido(this.email.trim())) {
      const toast = await this.toastController.create({
        message: 'Digite um e-mail válido.',
        duration: 1800,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      const toast = await this.toastController.create({
        message: 'As senhas não coincidem.',
        duration: 1800,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
      return;
    }

    try {
      await firstValueFrom(
        this.authService.register(
          this.username.trim(),
          this.nome.trim(),
          this.email.trim(),
          this.senha,
        ),
      );

      await this.router.navigate(['/relatorios']);
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Falha ao criar conta. Tente outro usuário.',
        duration: 2200,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    }
  }
}
