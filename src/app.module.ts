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
import { SeedService } from './utils/seed.service';

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
  async onApplicationBootstrap() {
    console.log(
      '🌱 [Seeder] Detectada base de datos limpia por TypeORM. Sembrando datos...',
    );

    await this.provinceService.addSedder();
    console.log('✅ [Seeder]  Provincias cargadas.');
    await this.municipalityService.addSedder();
    console.log('✅ [Seeder]  Municipios cargadas.');
    await this.seedService.addSedder();
  }
}
