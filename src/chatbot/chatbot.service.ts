import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class ChatbotService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async ask(message: string) {
    const response = await this.openai.responses.create({
      model: 'gpt-4.1-mini',
      input: `
Eres el asistente oficial de BoletoClick.

Ayudas a usuarios y organizadores con:
- compra de boletos
- recuperación de boletos
- dudas sobre QR
- creación de eventos
- ventas
- reportes
- validación de boletos

No inventes información.
Si no sabes algo, pide contactar soporte.

Pregunta del usuario:
${message}
      `,
    });

    return {
      answer: response.output_text,
    };
  }
}
