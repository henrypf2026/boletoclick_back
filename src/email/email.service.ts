import { BrevoClient } from '@getbrevo/brevo';
import { Injectable } from '@nestjs/common';
import { environment } from '../config/environment';
import {
  formatNewsletterTemplate,
  formatWelcomeTemplate,
} from '../utils/formatTemplates';
import { UsersService } from '../users/users.service';

@Injectable()
export class EmailService {
  private readonly brevo: BrevoClient;

  constructor(private readonly userService: UsersService) {
    this.brevo = new BrevoClient({
      apiKey: environment.BREVO_API_KEY!,
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<unknown> {
    try {
      return await this.brevo.transactionalEmails.sendTransacEmail({
        sender: {
          name: 'BoletoClick',
          email: environment.BREVO_SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      });
    } catch (error) {
      console.log(`No se pudo enviar email a ${to}. Error ${error}`);
    }
  }

  async sendWelcomeEmail(userName: string, to: string): Promise<unknown> {
    const html = formatWelcomeTemplate(userName);
    const subject = 'Bienvenido a Boleto Click';

    return this.sendEmail(to, subject, html);
  }

  async sendNewsLetterEmail() {
    const users = await this.userService.getUsersToNotify();
    for (const user of users) {
      const html = formatNewsletterTemplate(user.name);
      const subject = 'Newsletter Boleto Click';
      await this.sendEmail(user.email, subject, html);
    }
  }
}
