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

  async entrar() {
    if (!this.username?.trim() || !this.senha?.trim()) {
      const toast = await this.toastController.create({
        message: 'Preencha nome de usuário e senha para entrar.',
        duration: 1800,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    try {
      await firstValueFrom(
        this.authService.login(this.username.trim(), this.senha.trim()),
      );

      this.financeiroService.loadExpenses();
      await this.router.navigate(['/relatorios']);
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Falha no login. Verifique usuário e senha.',
        duration: 2200,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
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
