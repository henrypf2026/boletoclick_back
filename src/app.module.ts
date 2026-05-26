import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { UploadImagesModule } from './upload-images/upload-images.module';
import { VenuesModule } from './venues/venues.module';
import { MapsModule } from './maps/maps.module';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [UsersModule, AuthModule, EventsModule, TicketsModule, UploadImagesModule, VenuesModule, MapsModule, ChatbotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
