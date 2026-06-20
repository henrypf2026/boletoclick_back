import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TicketsRepository } from './tickets.repository';
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

  async findAllTickets(orderId?: string): Promise<Ticket[]> {
    return await this.ticketsRepository.findAllTickets(orderId);
  }

  async createBulkTickets(createTicketsDto: {
    orderId: string;
    ticketTypeId: string;
    quantity: number;
  }): Promise<Ticket[]> {
    const ticketsToCreate: Partial<Ticket>[] = [];

    for (let i = 1; i <= createTicketsDto.quantity; i++) {
      const qrPlaceholder = `CLICK-TICKET-${createTicketsDto.orderId}-${i}-${Math.floor(1000 + Math.random() * 9000)}`;

      ticketsToCreate.push({
        qrCode: qrPlaceholder,
        orderId: createTicketsDto.orderId,
        ticketTypeId: createTicketsDto.ticketTypeId,
      });
    }

    return await this.ticketsRepository.createBulkTickets(
      ticketsToCreate,
      createTicketsDto.ticketTypeId,
    );
  }

  async countActiveTicketsByUser(userId: string): Promise<number> {
    return await this.ticketsRepository.countActiveTicketsByUser(userId);
  }

  async scanTicket(qrCode: string): Promise<{ message: string; ticket: Ticket }> {
    const ticket = await this.ticketsRepository.findByQrCode(qrCode);

    if (!ticket) {
      throw new NotFoundException(
        `QR no reconocido — ticket no encontrado o posiblemente falsificado`,
      );
    }

    if (!ticket.allowEntrance) {
      throw new BadRequestException(
        `Ticket ya utilizado el ${ticket.usedAt?.toLocaleString('es-AR')} — posible uso duplicado`,
      );
    }

    ticket.allowEntrance = false;
    ticket.usedAt = new Date();

    const updated = await this.ticketsRepository.save(ticket);

    return {
      message: 'Acceso permitido — ticket validado correctamente',
      ticket: updated,
    };
  }

  async getEventStats(eventId: string): Promise<{
    total: number;
    arrived: number;
    pending: number;
    percentage: number;
  }> {
    const { total, arrived, pending } =
      await this.ticketsRepository.getEventStats(eventId);

    const percentage =
      total === 0 ? 0 : Math.round((arrived / total) * 1000) / 10;

    return { total, arrived, pending, percentage };
  }
}