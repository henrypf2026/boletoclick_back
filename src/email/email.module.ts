import { forwardRef, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailCron } from './email.cron';
import { UsersModule } from '../users/users.module';
import { VenuesModule } from '../venues/venues.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [UsersModule, VenuesModule, forwardRef(() => EventsModule)],
  controllers: [EmailController],
  providers: [EmailService, EmailCron],
  exports: [EmailService],
})
export class EmailModule {}
