import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { BOLETOCLICK_KNOWLEDGE_BASE } from './knowledge-base';
import { EventsService } from '../events/events.service';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class ChatbotService {
  constructor(private readonly eventsService: EventsService) {}

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

    const activeEvents = await this.getEventsForUserMessage(cleanMessage);
    const eventsText = this.formatEventsForChatbot(activeEvents);

    const response = await this.openai.responses.create({
      model: 'gpt-4.1-mini',
      input: `
Eres el asistente oficial de BoletoClick.

INFORMACIÓN GENERAL DE BOLETOCLICK:
${BOLETOCLICK_KNOWLEDGE_BASE}

EVENTOS ACTIVOS DISPONIBLES:
${eventsText || 'Actualmente no hay eventos activos disponibles que coincidan con la consulta.'}

REGLAS:
- Usa la información general de BoletoClick incluida arriba.
- Para eventos, usa únicamente la lista de EVENTOS ACTIVOS DISPONIBLES.
- Solo puedes mencionar eventos con status ACTIVE.
- No muestres eventos DRAFT, SOLDOUT, CANCELLED ni INACTIVE.
- No inventes eventos, precios, lugares ni fechas.
- Si el usuario pregunta por eventos y no hay coincidencias, responde que por ahora no encuentras eventos activos disponibles para esa consulta.
- Responde breve, claro y amable.

PREGUNTA DEL USUARIO:
${cleanMessage}
      `,
    });

    return {
      answer: response.output_text,
    };
  }

  private async getEventsForUserMessage(message: string): Promise<Event[]> {
    const lowerMessage = message.toLowerCase();

    const isGeneralEventsQuestion =
      lowerMessage.includes('evento') ||
      lowerMessage.includes('eventos') ||
      lowerMessage.includes('cartelera') ||
      lowerMessage.includes('proximo') ||
      lowerMessage.includes('próximo') ||
      lowerMessage.includes('proximos') ||
      lowerMessage.includes('próximos') ||
      lowerMessage.includes('pronto') ||
      lowerMessage.includes('qué hay') ||
      lowerMessage.includes('que hay');

    const isLocationQuestion =
      lowerMessage.includes(' en ') ||
      lowerMessage.includes(' cerca de ') ||
      lowerMessage.includes(' ciudad ') ||
      lowerMessage.includes(' país ') ||
      lowerMessage.includes(' pais ') ||
      lowerMessage.includes(' dónde ') ||
      lowerMessage.includes(' donde ');

    if (isLocationQuestion) {
      const location = this.extractLocationFromMessage(message);

      if (location.length > 1) {
        return await this.eventsService.searchActiveEventsByLocationForChatbot(
          location,
        );
      }
    }

    if (isGeneralEventsQuestion) {
      return await this.eventsService.getActiveEventsForChatbot();
    }

    return await this.eventsService.searchActiveEventsForChatbot(message);
  }

  private extractLocationFromMessage(message: string): string {
    return message
      .toLowerCase()
      .replace('¿', '')
      .replace('?', '')
      .replace('qué eventos hay en', '')
      .replace('que eventos hay en', '')
      .replace('eventos disponibles en', '')
      .replace('eventos en', '')
      .replace('eventos cerca de', '')
      .replace('cerca de', '')
      .replace('dónde hay eventos en', '')
      .replace('donde hay eventos en', '')
      .replace('hay eventos en', '')
      .replace('en la ciudad de', '')
      .replace('en el país de', '')
      .replace('en el pais de', '')
      .replace('en', '')
      .trim();
  }

  private formatEventsForChatbot(events: Event[]): string {
    return events
      .map((event) => {
        const venueName = event.venue?.name ?? 'Lugar no especificado';
        const venueAddress =
          event.venue?.address ?? 'Dirección no especificada';

        const municipalityName =
          event.venue?.municipality?.name ?? 'Ciudad no especificada';

        const provinceName =
          event.venue?.municipality?.province?.name ??
          'Estado o provincia no especificada';

        const categoryName =
          event.category?.name ?? 'Categoría no especificada';

        const ticketTypesText =
          event.ticketTypes?.length > 0
            ? event.ticketTypes
                .map(
                  (ticket) =>
                    `${ticket.name} - $${ticket.price} - stock: ${ticket.stock}`,
                )
                .join(', ')
            : 'Boletos no especificados';

        return `
Título: ${event.title}
Fecha: ${event.eventDate}
Lugar: ${venueName}
Dirección: ${venueAddress}
Ciudad/Municipio: ${municipalityName}
Estado/Provincia: ${provinceName}
Categoría: ${categoryName}
Descripción: ${event.description}
Boletos: ${ticketTypesText}
`;
      })
      .join('\n');
  }
}
