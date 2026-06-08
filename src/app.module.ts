import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { VenuesModule } from './venues/venues.module';
import { MapsModule } from './maps/maps.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { typeOrmConfig } from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileUploadModule } from './file-upload/file-upload.module';
import { TicketTypesModule } from './ticket-types/ticket-types.module';
import { ProvinceModule } from './province/province.module';
import { MunicipalitiesModule } from './municipalities/municipalities.module';
import { CategoriesModule } from './categories/categories.module';
import { SeedModule } from './utils/seed.module';
import { ProvinceService } from './province/province.service';
import { MunicipalitiesService } from './municipalities/municipalities.service';
import { StripeModule } from './stripe/stripe.module';
import { SeedService } from './utils/seed.service';
import { ScheduleModule } from '@nestjs/schedule';
import { OrdersModule } from './orders/orders.module';
import { EmailModule } from './email/email.module';
import { CouponsModule } from './coupons/coupons.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [typeOrmConfig] }),EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm')!,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    EventsModule,
    TicketsModule,
    VenuesModule,
    MapsModule,
    ChatbotModule,
    BankAccountsModule,
    FileUploadModule,
    TicketTypesModule,
    ProvinceModule,
    MunicipalitiesModule,
    CategoriesModule,
    SeedModule,
    StripeModule,
    OrdersModule,
    EmailModule,
    CouponsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(
    private readonly seedService: SeedService,
    private readonly provinceService: ProvinceService,
    private readonly municipalityService: MunicipalitiesService,
  ) {}

  // async onApplicationBootstrap() {
  //   await this.provinceService.addSedder();
  //   console.log('Provincias Agregadas');
  //   await this.municipalityService.addSedder();
  //   console.log('Municipios Agregados');
  // }
}