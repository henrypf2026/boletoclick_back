import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { BOLETOCLICK_KNOWLEDGE_BASE } from './knowledge-base';

@Injectable()
export class ChatbotService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async ask(message: string) {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return {
        answer: 'Por favor escribe una pregunta para poder ayudarte.',
      };
    }

    const response = await this.openai.responses.create({
      model: 'gpt-4.1-mini',
      input: `
Eres el asistente oficial de BoletoClick.

INFORMACIÓN GENERAL DE BOLETOCLICK:
${BOLETOCLICK_KNOWLEDGE_BASE}

REGLAS:
- Usa únicamente la información general de BoletoClick incluida arriba.
- No consultes base de datos.
- No inventes eventos, precios, lugares ni fechas.
- Si el usuario pregunta por eventos específicos o disponibilidad real, responde: "Por ahora no puedo consultar eventos disponibles en tiempo real."
- Responde breve, claro y amable.

PREGUNTA DEL USUARIO:
${cleanMessage}
      `,
    });

    return {
      answer: response.output_text,
    };
  }
}
