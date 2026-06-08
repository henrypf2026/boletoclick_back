import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketsRepository } from './tickets.repository'; // 💡 Importamos tu repo personalizado
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(private readonly ticketsRepository: TicketsRepository) {}

  async findTicketsByUser(userId: string): Promise<Ticket[]> {
    return await this.ticketsRepository.findTicketsByUser(userId);
  }

  async findTicketByIdAndUser(id: string, userId: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findTicketByIdAndUser(
      id,
      userId,
    );

    if (!ticket) {
      throw new NotFoundException(
        `Ticket con ID '${id}' no encontrado o no tienes permisos para verlo.`,
      );
    }

    return ticket;
  }

  async findAllTicketsByProducer(
    producerId: string,
    orderId?: string,
  ): Promise<Ticket[]> {
    return await this.ticketsRepository.findAllTicketsByProducer(
      producerId,
      orderId,
    );
  }

  async createBulkTickets(
    orderId: string,
    ticketTypeId: string,
    quantity: number,
  ): Promise<Ticket[]> {
    const ticketsToCreate: Partial<Ticket>[] = [];

    for (let i = 1; i <= quantity; i++) {
      // 🚧 PLACEHOLDER TEMPORAL PARA EL QR
      // 💸 CUANDO SE IMPLEMENTE: Aquí llamarás a la librería de QR (ej: qrcode)
      const qrPlaceholder = `CLICK-TICKET-${orderId}-${i}-${Math.floor(1000 + Math.random() * 9000)}`;

      ticketsToCreate.push({
        qrCode: qrPlaceholder, // Usamos el string plano temporal que el Front puede leer
        order: { id: orderId } as any,
        ticketType: { id: ticketTypeId } as any,
      });
    }

    return await this.ticketsRepository.createBulkTickets(ticketsToCreate);
  }


    async countActiveTicketsByUser(userId: string): Promise<number> {
    return await this.countActiveTicketsByUser(userId);
  }
}
