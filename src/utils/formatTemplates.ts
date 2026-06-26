import fs from 'fs';
import path from 'path';
import { Event } from '../events/entities/event.entity';
import QRCode from 'qrcode';
import { Role } from '../common/enums/role.enum';

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

const newEventTemplate = fs.readFileSync(
  path.join(process.cwd(), 'src/email/templates/newEvent_template.html'),
  'utf-8',
);

const eventCancelledTemplate = fs.readFileSync(
  path.join(process.cwd(), 'src/email/templates/eventCancelled_template.html'),
  'utf-8',
);

const welcomeTextUser =
  'Gracias por registrarte en Boletoclick. Ya puedes descubrir eventos, comprar boletos y administrar tus compras desde tu cuenta.';

const welcomeTextProducer =
  'Gracias por unirte a Boletoclick. El espacio ideal para tus eventos ya está listo. Inicia sesión ahora para publicar tu primer evento y empezar a vender tus boletos.';

function formatWelcomeTemplate(userName: string, role: Role) {
  const html = welcomeTemplate
    .replace('{userName}', userName)
    .replace(
      '{WelcomeText}',
      role == Role.USER ? welcomeTextUser : welcomeTextProducer,
    );

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

async function buildQRImage(encryptedQR: string) {
  const qrBuffer = await QRCode.toBuffer(encryptedQR);
  return qrBuffer;
}

function formatEventNameForQRName(eventName: string) {
  return eventName
    .normalize('NFD') // Separa acentos
    .replace(/[\u0300-\u036f]/g, '') // remueve acentos
    .replace(/\s+/g, '') // elimina espacios
    .toLocaleLowerCase()
    .slice(0, 8); // Se limitara a 8 caracteres para evitar nombres largos
}

function formatNewEventTemplate(
  userName: string,
  eventInfo: Event,
  totalStock: number,
) {
  return newEventTemplate
    .replace('{userName}', userName)
    .replace('{eventName}', eventInfo.title)
    .replace('{eventDate}', eventInfo.eventDate)
    .replace('{category}', eventInfo.category.name)
    .replace('{venue}', eventInfo.venue.name)
    .replace('{eventId}', eventInfo.id)
    .replace('{totalTickets}', String(totalStock));
}

function formatEventCancelledTemplate(
  username: string,
  eventName: string,
  eventDate: string,
  venueName: string,
) {
  return eventCancelledTemplate
    .replace('{userName}', username)
    .replace('{eventName}', eventName)
    .replace('{eventDate}', eventDate)
    .replace('{venue}', venueName);
}

export {
  formatWelcomeTemplate,
  formatNewsletterTemplate,
  buildEventCard,
  formatPurchaseTemplate,
  formatCancelTemplate,
  buildQRImage,
  formatEventNameForQRName,
  formatNewEventTemplate,
  formatEventCancelledTemplate,
};
