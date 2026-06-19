import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TicketLocksService } from './ticket-locks.service';

@Controller('ticket-locks')
export class TicketLocksController {
  constructor(private readonly ticketLocksService: TicketLocksService) {}
}
