import { Controller } from '@nestjs/common';
import { TicketTypesService } from './ticket-types.service';

@Controller('ticket-types')
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}
}
