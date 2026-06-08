import { BrevoClient } from '@getbrevo/brevo';
import { environment } from './environment';

const apiKey = environment.BREVO_API_KEY as string;

if (!apiKey) {
  throw new Error('BREVO_API_KEY is not defined in environment variables');
}

const brevoInstance = new BrevoClient({
  apiKey,
});

export default brevoInstance;
