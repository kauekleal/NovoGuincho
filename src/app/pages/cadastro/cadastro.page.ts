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

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      color,
      position: 'top',
    });
    await toast.present();
  }

  async criarConta() {
    const nome = this.nome.trim();
    const username = this.username.trim();
    const email = this.email.trim();

    if (!nome || !username || !email || !this.senha.trim() || !this.confirmarSenha.trim()) {
      await this.showToast('Preencha todos os campos para criar a conta.', 'warning');
      return;
    }

    if (nome.length < 3) {
      await this.showToast('O nome deve ter no mínimo 3 caracteres.', 'danger');
      return;
    }

    if (username.length < 3) {
      await this.showToast('O nome de usuário deve ter no mínimo 3 caracteres.', 'danger');
      return;
    }

    if (!this.isEmailValido(email)) {
      await this.showToast('Digite um e-mail válido.', 'danger');
      return;
    }

    if (this.senha.length < 6) {
      await this.showToast('A senha deve ter no mínimo 6 caracteres.', 'danger');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      await this.showToast('As senhas não coincidem.', 'danger');
      return;
    }

    try {
      await firstValueFrom(
        this.authService.register(username, nome, email, this.senha),
      );

      await this.router.navigate(['/relatorios']);
    } catch (error: any) {
      const backendMessage = error?.error?.message || 'Falha ao criar conta. Tente outro usuário.';
      await this.showToast(backendMessage, 'danger');
    }
  }
}
