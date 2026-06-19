import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, LessThan } from 'typeorm';
import { TicketLocksRepository } from './ticket-locks.repository';
import { TicketLock } from './entities/ticket-lock.entity';
import { TicketLockStatus } from '../common/enums/ticket-lock-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TicketLocksService {
  // Usamos el Logger nativo de NestJS para ver la limpieza en la terminal en tiempo real
  private readonly logger = new Logger(TicketLocksService.name);

  constructor(
    private readonly ticketLocksRepo: TicketLocksRepository,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 🔒 Solicita una reserva de entradas al repositorio con bloqueo de fila
   */
  async reserveTickets(
    ticketTypeId: string,
    userId: string,
    quantity: number,
    expiresAt: Date,
  ): Promise<TicketLock> {
    this.logger.log(
      `Solicitando reserva de ${quantity} tiquetes para el usuario ${userId}`,
    );
    return await this.ticketLocksRepo.reserveTickets(
      ticketTypeId,
      userId,
      quantity,
      expiresAt,
    );
  }

  async linkStripeSession(lockId: string, sessionId: string): Promise<void> {
    await this.ticketLocksRepo.linkStripeSession(lockId, sessionId);
  }

  async releaseLockByStripeSessionId(sessionId: string): Promise<void> {
    return await this.ticketLocksRepo.releaseLockByStripeSessionId(sessionId);
  }

  async confirmLockByStripeSessionId(sessionId: string): Promise<boolean> {
    return await this.ticketLocksRepo.confirmLockByStripeSessionId(sessionId);
  }

  /**
   * 🟢 Libera manualmente un candado (por ejemplo, si el usuario cancela en el Front)
   */
  async releaseLock(lockId: string): Promise<void> {
    this.logger.log(`Liberando manualmente el bloqueo ID: ${lockId}`);
    return await this.ticketLocksRepo.releaseLock(lockId);
  }

  /**
   * 🏆 Confirma el candado pasando su estado a COMPLETED tras un pago exitoso
   */
  async confirmLock(lockId: string): Promise<void> {
    this.logger.log(`Confirmando y consolidando el bloqueo ID: ${lockId}`);
    return await this.ticketLocksRepo.confirmLock(lockId);
  }

  /**
   * ⏰ Tarea programada (Cron Job) que corre automáticamente cada minuto.
   * Busca candados en estado 'LOCKED' cuya fecha 'expiresAt' sea menor a la hora actual.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleReleaseExpiredLocks(): Promise<void> {
    const ahora = new Date();

    // 1. Buscar todos los candados vencidos que sigan reteniendo stock
    const expiredLocks = await this.dataSource.manager.find(TicketLock, {
      where: {
        status: TicketLockStatus.LOCKED,
        expiresAt: LessThan(ahora), // 👈 Filtra: expiresAt < ahora
      },
    });

    if (expiredLocks.length === 0) {
      return; // Si no hay nada que limpiar, salimos rápido para no saturar el log
    }

    this.logger.warn(
      `⏱️ Cron Job: Se encontraron ${expiredLocks.length} bloqueos de tiquetes expirados. Iniciando liberación...`,
    );

    // 2. Procesar la liberación de cada candado de forma aislada
    // Lo hacemos en un bucle para que cada uno corra en su propia transacción y devuelva su stock de forma segura
    for (const lock of expiredLocks) {
      try {
        // 🎯 SI EL CANDADO TIENE UNA SESIÓN DE STRIPE ASOCIADA:
        // Le avisamos a StripeService por medio de un evento para que cancele la sesión en los servidores de Stripe
        if (lock.stripeSessionId) {
          this.logger.log(
            `📢 Emitiendo orden de cancelación a Stripe para la sesión: ${lock.stripeSessionId}`,
          );
          this.eventEmitter.emit('stripe.expire-session', lock.stripeSessionId);
          this.eventEmitter.emit('order.failed', lock.stripeSessionId);
        }
        // Procedemos a liberar el stock localmente de inmediato
        await this.ticketLocksRepo.releaseLock(lock.id);
        this.logger.log(
          `✅ Bloqueo ${lock.id} expirado correctamente. Stock devuelto.`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Error al intentar liberar el bloqueo expirado ${lock.id}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    this.logger.log(`🏁 Cron Job: Limpieza de bloqueos temporales finalizada.`);
  }
}
