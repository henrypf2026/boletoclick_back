import * as fs from 'fs';
import * as path from 'path';
import { Event } from '../events/entities/event.entity';

const newsletterTemplate = fs.readFileSync(
  path.join(process.cwd(), 'src/email/templates/newsletter_template.html'),
  'utf-8',
);

const welcomeTemplate = fs.readFileSync(
  path.join(process.cwd(), 'src/email/templates/bienvenida_template.html'),
  'utf-8',
);

const purchaseTemplate = fs.readFileSync(
  path.join(process.cwd(), 'src/email/templates/compra_template.html'),
  'utf-8',
);

const cancelTemplate = fs.readFileSync(
  path.join(process.cwd(), 'src/email/templates/cancelacion_template.html'),
  'utf-8',
);

function formatWelcomeTemplate(userName: string) {
  const html = welcomeTemplate.replace('{userName}', userName);
  return html;
}

function formatNewsletterTemplate(userName: string, eventsInfo: string) {
  let html = newsletterTemplate.replace('{userName}', userName);
  html = html.replace('{newsletterContent}', eventsInfo);
  return html;
}

function formatPurchaseTemplate(purchaseInfo) {
  const { userName, eventName, eventDate, venueName, quantity } = purchaseInfo;
  const html = purchaseTemplate
    .replace('{userName}', userName)
    .replace('{eventName}', eventName)
    .replace('{eventDate}', eventDate)
    .replace('{venue}', venueName)
    .replace('{ticketQuantity}', quantity);

  return html;
}

function formatCancelTemplate(
  userName: string,
  eventName: string,
  orderId: string,
  eventDate: string,
  venue: string,
  totalAmount: string,
) {
  let html = cancelTemplate.replace('{userName}', userName);
  html = html.replace('{eventName}', eventName);
  html = html.replace('{orderId}', orderId);
  html = html.replace('{eventDate}', eventDate);
  html = html.replace('{venue}', venue);
  html = html.replace('{totalAmount}', totalAmount);
  return html;
}

function buildEventCard(event: Event): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <h2>${event.title}</h2>
          <p>${event.description}</p>
          <p>📅 Fecha: ${event.eventDate}</p>
          <p>📍 Lugar:  ${event.venue.name}</p>
          <p><img src="${event.posterUrl}" width="200" height="200"></p>
        </td>
      </tr>
    </table>
  `;
}

export {
  formatWelcomeTemplate,
  formatNewsletterTemplate,
  buildEventCard,
  formatPurchaseTemplate,
};
