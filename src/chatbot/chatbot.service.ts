import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { BOLETOCLICK_KNOWLEDGE_BASE } from './knowledge-base';
import { EventsService } from '../events/events.service';

@Injectable()
export class ChatbotService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor(private readonly eventsService: EventsService) {}

  async ask(message: string) {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return {
        answer: 'Por favor escribe una pregunta para poder ayudarte.',
      };
    }

    const now = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(now.getMonth() + 6);

    const events = await this.eventsService.findUpcomingEvents(
      now,
      sixMonthsLater,
      20,
    );

    const eventsText = events
      .map((event) => {
        const tickets =
          event.ticketTypes
            ?.map(
              (ticket) =>
                `- ${ticket.name}: $${ticket.price} | stock: ${ticket.stock} | zona: ${ticket.zone ?? 'sin zona'}`,
            )
            .join('\n') || 'Sin boletos registrados';

        return `
ID: ${event.id}
Evento: ${event.title}
Descripción: ${event.description}
Fecha: ${event.eventDate}
Estado: ${event.status}
Lugar: ${event.venue?.name ?? 'Sin lugar registrado'}
Dirección: ${event.venue?.address ?? 'Sin dirección registrada'}
Categoría: ${event.category?.name ?? 'Sin categoría'}
Boletos:
${tickets}
`;
      })
      .join('\n----------------\n');

    const response = await this.openai.responses.create({
      model: 'gpt-4.1-mini',
      input: `
Eres el asistente oficial de BoletoClick.

INFORMACIÓN GENERAL DE BOLETOCLICK:
${BOLETOCLICK_KNOWLEDGE_BASE}

EVENTOS REALES DISPONIBLES EN LA BASE DE DATOS:
${eventsText || 'No hay eventos próximos registrados.'}

REGLAS:
- Si el usuario pregunta por eventos, responde usando directamente la información de EVENTOS REALES.
- Si pregunta por un evento específico, busca coincidencias por nombre, fecha, lugar o categoría.
- No inventes eventos, precios, lugares ni fechas.
- Si no encuentras el evento, di: "No encontré ese evento disponible en BoletoClick."
- Para dudas generales, usa la información general de BoletoClick.
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
