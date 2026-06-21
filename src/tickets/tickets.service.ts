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

  // ADMIN — sin filtro de producer
  async findAllTickets(orderId?: string): Promise<Ticket[]> {
    return await this.ticketsRepository.findAllTickets(orderId);
  }

  async createBulkTickets(createTicketsDto: {
    orderId: string;
    ticketTypeId: string;
    quantity: string;
  }): Promise<Ticket[]> {
    const ticketsToCreate: Partial<Ticket>[] = [];
    const quantityNumber = Number(createTicketsDto.quantity);

    for (let i = 1; i <= quantityNumber; i++) {
      // 🚧 PLACEHOLDER TEMPORAL PARA EL QR
      // 💸 CUANDO SE IMPLEMENTE: Aquí llamarás a la librería de QR (ej: qrcode)
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

  // Lógica de escaneo — solo modifica allowEntrance y usedAt
  async scanTicket(qrCode: string): Promise<{ message: string; ticket: Ticket }> {
    const ticket = await this.ticketsRepository.findByQrCode(qrCode);

    if (!ticket) {
      throw new NotFoundException(`Ticket con QR '${qrCode}' no encontrado`);
    }

    if (!ticket.allowEntrance) {
      throw new BadRequestException(
        `Ticket ya utilizado el ${ticket.usedAt?.toLocaleString('es-AR')}`,
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
}