import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailCron } from './email.cron';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';
import { VenuesModule } from '../venues/venues.module';

@Module({
  imports: [UsersModule, EventsModule, VenuesModule, EventsModule],
  controllers: [EmailController],
  providers: [EmailService, EmailCron],
  exports: [EmailService],
})
export class EmailModule {}
