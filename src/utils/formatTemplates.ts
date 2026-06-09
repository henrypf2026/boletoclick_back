import * as fs from 'fs';
import * as path from 'path';

function formatWelcomeTemplate(userName: string) {
  const template = fs.readFileSync(
    path.join(process.cwd(), 'src/email/templates/bienvenida_template.html'),
    'utf-8',
  );

  const html = template.replace('{userName}', userName);
  return html;
}

function formatNewsletterTemplate(userName: string) {
  const template = fs.readFileSync(
    path.join(process.cwd(), 'src/email/templates/newsletter_template.html'),
    'utf-8',
  );

  const html = template.replace('{userName}', userName);
  return html;
}

export { formatWelcomeTemplate, formatNewsletterTemplate };
