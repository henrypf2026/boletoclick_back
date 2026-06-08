import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailCron } from './email.cron';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [EmailController],
  providers: [EmailService, EmailCron],
  exports: [EmailService],
})
export class EmailModule {}
