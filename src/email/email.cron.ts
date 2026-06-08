import { Cron } from '@nestjs/schedule';
import { EmailService } from './email.service';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class EmailCron {
  constructor(
    private readonly emailService: EmailService,
    private readonly userService: UsersService,
  ) {}

  @Cron('15 17 * * 1', {
    timeZone: 'America/Mexico_City',
  })
  async processPendingNotifications() {
    await this.emailService.sendNewsLetterEmail();
  }
}
