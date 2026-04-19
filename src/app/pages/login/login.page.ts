import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FinanceiroService } from '../../services/financeiro.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  username = '';
  email = '';
  senha = '';

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService,
    private financeiroService: FinanceiroService,
  ) { }

  ngOnInit() {
  }

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

  async entrar() {
    const username = this.username?.trim();
    const senha = this.senha?.trim();

    if (!username || !senha) {
      await this.showToast('Preencha nome de usuário e senha para entrar.', 'warning');
      return;
    }

    if (senha.length < 6) {
      await this.showToast('A senha deve ter no mínimo 6 caracteres.', 'danger');
      return;
    }

    try {
      await firstValueFrom(this.authService.login(username, senha));

      this.financeiroService.loadExpenses();
      this.financeiroService.loadServices();
      await this.router.navigate(['/relatorios']);
    } catch (error: any) {
      const backendMessage = error?.error?.message || 'Falha no login. Verifique usuário e senha.';
      await this.showToast(backendMessage, 'danger');
    }
  }

  async recuperarSenha() {
    const alert = await this.alertController.create({
      cssClass: 'forgot-password-alert',
      header: 'Recuperar senha',
      message: 'Informe o e-mail cadastrado para receber o link de recuperacao.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'seuemail@exemplo.com',
          value: this.email?.trim(),
          attributes: {
            autocapitalize: 'off',
            autocorrect: 'off',
            inputmode: 'email'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar link',
          handler: async (data) => {
            const email = String(data?.email || '').trim();
            if (!this.isEmailValido(email)) {
              const invalidToast = await this.toastController.create({
                message: 'Digite um e-mail valido para continuar.',
                duration: 2000,
                color: 'danger',
                position: 'top'
              });
              await invalidToast.present();
              return false;
            }

            this.email = email;
            const successToast = await this.toastController.create({
              message: `Link de recuperacao enviado para ${email}.`,
              duration: 2400,
              color: 'success',
              position: 'top'
            });
            await successToast.present();
            return true;
          }
        }
      ]
    });

    await alert.present();
  }
}
