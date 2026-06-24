import { BrevoClient } from '@getbrevo/brevo';
import { Injectable } from '@nestjs/common';
import { environment } from '../config/environment';
import {
  buildEventCard,
  formatNewsletterTemplate,
  formatWelcomeTemplate,
  formatPurchaseTemplate,
  formatCancelTemplate,
} from '../utils/formatTemplates';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { EventsService } from '../events/events.service';
import { Event } from '../events/entities/event.entity';
import { Console } from 'console';
import { VenuesService } from '../venues/venues.service';

@Injectable()
export class EmailService {
  private readonly brevo: BrevoClient;

  constructor(
    private readonly userService: UsersService,
    private readonly eventsService: EventsService,
    private readonly venuesService: VenuesService,
  ) {
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
    console.log('sendNewsLetterEmail');
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(
      endDate.getDate() + 7 /* Proximos eventos en los siguientes 7 dias*/,
    );
    const events: Event[] = await this.eventsService.findUpcomingEvents(
      now,
      endDate,
      3 /* Los siguientes 3 eventos */,
    );
    console.log('sendNewsLetterEmail, total de evebtos = ' + events.length);
    const eventsHTML: string = events
      .map((eve: Event) => buildEventCard(eve))
      .join('');

    const users = await this.userService.getUsersToNotify();
    for (const user of users) {
      const html = formatNewsletterTemplate(user.name, eventsHTML);
      const subject = 'Newsletter Boleto Click';
      await this.sendEmail(user.email, subject, html);
    }
  }

  async sendPurchaseEmail(purchaseData) {
    const user = await this.userService.findUserById(purchaseData.userId);
    const event = await this.eventsService.getEventById(purchaseData.eventId);
    const venue = await this.venuesService.findVenueById(event.venueId);

    const html = formatPurchaseTemplate({
      userName: user.name,
      eventName: event.title,
      eventDate: event.eventDate,
      venueName: venue.name,
      quantity: purchaseData.quantity,
    });

    const subject = 'Gracias por tu compra en Boleto Click';
    await this.sendEmail(user.email, subject, html);
    return;
  }

  async sendOrderCancellationEmail(
    userEmail: string,
    userName: string,
    eventName: string,
    orderId: string,
    eventDate: string,
    venue: string,
    totalAmount: number,
  ) {
    const html = formatCancelTemplate(
      userName,
      eventName,
      orderId,
      eventDate,
      venue,
      totalAmount.toFixed(2),
    );
    const subject = `Cancelación de tu orden #${orderId} - BoletoClick`;
    return this.sendEmail(userEmail, subject, html);
  }
}
