import { BrevoClient } from '@getbrevo/brevo';
import { Injectable } from '@nestjs/common';
import { environment } from '../config/environment';
import {
  buildEventCard,
  formatNewsletterTemplate,
  formatWelcomeTemplate,
  formatPurchaseTemplate,
  formatCancelTemplate,
  buildQRImage,
  formatEventNameForQRName,
  formatNewEventTemplate,
} from '../utils/formatTemplates';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { Event } from '../events/entities/event.entity';
import { VenuesService } from '../venues/venues.service';
import { Ticket } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';

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

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    attachments?: {
      name: string;
      content: string;
    }[],
  ): Promise<unknown> {
    try {
      return await this.brevo.transactionalEmails.sendTransacEmail({
        sender: {
          name: 'BoletoClick',
          email: environment.BREVO_SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        ...(attachments?.length ? { attachment: attachments } : {}),
      });
    } catch (error) {
      console.log(`No se pudo enviar email a ${to}. Error ${error}`);
    }
  }

  async sendWelcomeEmail(
    userName: string,
    to: string,
    role: Role,
  ): Promise<unknown> {
    const html = formatWelcomeTemplate(userName, role);
    const subject = 'Bienvenido a Boleto Click';

    return this.sendEmail(to, subject, html);
  }

  async sendNewsLetterEmail() {
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

  async sendPurchaseEmail(purchaseData, tickets: Ticket[]) {
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

    const attachments = await Promise.all(
      tickets.map(async (ticket, index) => {
        const qrBuffer = await buildQRImage(ticket.qrCode);

        return {
          name: `${formatEventNameForQRName(event.title)}-ticket-${index + 1}.png`,
          content: qrBuffer.toString('base64'),
        };
      }),
    );
    const subject = 'Gracias por tu compra en Boleto Click';
    await this.sendEmail(user.email, subject, html, attachments);
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

  async sendNewEventEmail(
    producer: User,
    eventInfo: Event,
    totalStock: number,
  ) {
    const html = formatNewEventTemplate(producer.name, eventInfo, totalStock);
    const subject = `Nuevo evento creado: ${eventInfo.title} - BoletoClick`;
    return this.sendEmail(producer.email, subject, html);
  }
}
