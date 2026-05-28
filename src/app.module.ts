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
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { typeOrmConfig } from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [typeOrmConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm')!,
    }),
    UsersModule,
    AuthModule,
    EventsModule,
    TicketsModule,
    UploadImagesModule,
    VenuesModule,
    MapsModule,
    ChatbotModule,
    BankAccountsModule,
    FileUploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
