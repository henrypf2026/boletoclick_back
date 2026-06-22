import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketLock } from './entities/ticket-lock.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { TicketLockStatus } from '../common/enums/ticket-lock-status.enum';

@Injectable()
export class TicketLocksRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * 🔒 Intenta reservar un número de boletas usando un bloqueo pesimista (FOR UPDATE)
   */
  async reserveTickets(
    ticketTypeId: string,
    userId: string,
    quantity: number,
    expiresAt: Date,
  ): Promise<TicketLock> {
    // 🛡️ Ejecutamos TODO el bloque dentro de una transacción atómica
    return this.dataSource.transaction(async (manager) => {
      // 1. Bloquear y leer la fila específica de la localidad (Pessimistic Write)
      // Esto genera el "SELECT ... FOR UPDATE" en Postgres, haciendo que otras peticiones esperen en fila.
      const ticketType = await manager
        .createQueryBuilder(TicketType, 'ticketType')
        .setLock('pessimistic_write')
        .where('ticketType.id = :id', { id: ticketTypeId })
        .getOne();

      if (!ticketType) {
        throw new BadRequestException(
          'El tipo de entrada solicitado no existe.',
        );
      }

      // 2. Validar stock en tiempo real dentro del bloqueo
      if (ticketType.stock < quantity) {
        throw new BadRequestException(
          `Stock insuficiente para completar la reserva. Disponibles: ${ticketType.stock}`,
        );
      }

      // 3. Descontar temporalmente el stock del TicketType
      ticketType.stock -= quantity;
      await manager.save(TicketType, ticketType);

      // 4. Registrar el candado (Lock) con estado inicial LOCKED
      const lock = manager.create(TicketLock, {
        ticketTypeId,
        userId,
        quantity,
        expiresAt,
        status: TicketLockStatus.LOCKED,
      });

      return await manager.save(TicketLock, lock);
    });
  }

  /**
   * 🔗 Vincula el ID de la sesión de Stripe con el candado local
   */
  async linkStripeSession(lockId: string, sessionId: string): Promise<void> {
    await this.dataSource.manager.update(
      TicketLock,
      { id: lockId },
      { stripeSessionId: sessionId },
    );
  }

  async findByStripeSessionId(sessionId: string): Promise<TicketLock | null> {
    return await this.dataSource.manager.findOne(TicketLock, {
      where: { stripeSessionId: sessionId },
    });
  }

  async releaseLockByStripeSessionId(sessionId: string): Promise<void> {
    const lock = await this.dataSource.manager.findOne(TicketLock, {
      where: { stripeSessionId: sessionId },
    });

    if (!lock) {
      return;
    }

    return this.releaseLock(lock.id);
  }

  async confirmLockByStripeSessionId(sessionId: string): Promise<boolean> {
    const lock = await this.dataSource.manager.findOne(TicketLock, {
      where: {
        stripeSessionId: sessionId,
        status: TicketLockStatus.LOCKED,
      },
    });

    if (!lock) {
      return false;
    }

    await this.dataSource.manager.update(
      TicketLock,
      { id: lock.id },
      { status: TicketLockStatus.COMPLETED },
    );

    return true;
  }

  /**
   * 🟢 Libera las entradas retenidas de un candado expirado o cancelado y devuelve el stock
   */
  async releaseLock(lockId: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      // Buscamos el lock y traemos la relación de TicketType para saber a quién devolverle el stock
      const lock = await manager.findOne(TicketLock, {
        where: { id: lockId },
        relations: { ticketType: true },
      });

      // Si el lock no existe o ya fue procesado antes (COMPLETED/EXPIRED), salimos en silencio
      if (!lock || lock.status !== TicketLockStatus.LOCKED) {
        return;
      }

      // 1. Cambiar el estado a EXPIRED para la auditoría
      lock.status = TicketLockStatus.EXPIRED;
      await manager.save(TicketLock, lock);

      // 2. Devolver las boletas retenidas al stock general de la localidad
      const ticketType = lock.ticketType;
      ticketType.stock += lock.quantity;
      await manager.save(TicketType, ticketType);
    });
  }

  /**
   * 🏆 Confirma el lock cuando el pago de Stripe entra con éxito
   */
  async confirmLock(lockId: string): Promise<void> {
    // Aquí el stock ya se descontó al inicio, así que solo actualizamos el estado para cerrar el ciclo
    await this.dataSource.manager.update(
      TicketLock,
      { id: lockId, status: TicketLockStatus.LOCKED },
      { status: TicketLockStatus.COMPLETED },
    );
  }
}
