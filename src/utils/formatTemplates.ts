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

function formatWelcomeTemplate(userName: string) {
  const html = welcomeTemplate.replace('{userName}', userName);
  return html;
}

function formatNewsletterTemplate(userName: string, eventsInfo: string) {
  let html = newsletterTemplate.replace('{userName}', userName);
  html = html.replace('{newsletterContent}', eventsInfo);
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

export { formatWelcomeTemplate, formatNewsletterTemplate, buildEventCard };
