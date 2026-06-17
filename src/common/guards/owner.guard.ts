import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EventsRepository } from '../../events/events.repository';
import { Role } from '../enums/role.enum';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Login required');
    }

    // Admins bypass ownership checks
    if (user.role === Role.ADMIN) {
      return true;
    }

    const eventId = request.params?.id;
    if (!eventId) {
      throw new ForbiddenException('Missing resource identifier');
    }

    const event = await this.eventsRepository.getEventById(eventId);

    if (event.producerId !== user.id) {
      throw new ForbiddenException('You do not own this resource');
    }

    return true;
  }
}
