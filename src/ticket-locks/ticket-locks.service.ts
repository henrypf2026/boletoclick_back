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

    // 1. Buscar todos los candados vencidos que sigan en estado LOCKED
    const expiredLocks = await this.dataSource.manager.find(TicketLock, {
      where: {
        status: TicketLockStatus.LOCKED,
        expiresAt: LessThan(ahora),
      },
    });

    if (expiredLocks.length === 0) {
      return;
    }

    this.logger.warn(
      `⏱️ Cron Job: Se encontraron ${expiredLocks.length} bloqueos de tiquetes expirados. Iniciando verificación...`,
    );

    for (const lock of expiredLocks) {
      try {
        if (lock.stripeSessionId) {
          // 🔍 VALIDACIÓN DE SEGURIDAD CRÍTICA:
          // Buscamos la orden asociada en la base de datos para ver si ya fue pagada
          const order = await this.dataSource.manager.findOne('Order', {
            where: { transactionId: lock.stripeSessionId },
          } as any);

          // Si la orden ya está pagada (debido al Webhook o verifySession),
          // confirmamos el candado local en vez de destruirlo y saltamos al siguiente.
          if (order && (order as any).status === 'PAID') {
            await this.ticketLocksRepo.confirmLock(lock.id);
            this.logger.log(
              `ℹ️ El candado ${lock.id} pertenecía a una orden ya PAGADA. Se consolidó localmente de forma segura.`,
            );
            continue;
          }

          // 🚨 Si la orden NO está pagada, procedemos a expirar de forma segura
          this.logger.log(
            `📢 Emitiendo orden de cancelación a Stripe para la sesión: ${lock.stripeSessionId}`,
          );
          this.eventEmitter.emit('stripe.expire-session', lock.stripeSessionId);
          this.eventEmitter.emit('order.failed', lock.stripeSessionId);
        }

        // Procedemos a liberar el stock localmente si realmente era una compra abandonada
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
