import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Venue } from '../venues/entities/venue.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum'; // 👈 Importamos tu Enum oficial de roles
import { mockCategories } from './mockCategories';
import { mockVenues } from './mockVenues';
import { mockEvents } from './mockEvents';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    console.log('🌱 [Seeder] Verificando si es necesario sembrar datos...');

    const categoriesCount = await this.categoryRepo.count();

    if (categoriesCount > 0) {
      console.log('🌱 [Seeder] La base ya contiene datos. Seeder omitido.');
      return;
    }

    console.log('🌱 [Seeder] Base vacía detectada. Iniciando seeder...');

    try {
      // 1. INYECTAR UN PRODUCTOR MOCK (Obligatorio para los eventos)
      const mockProducerId = '00000000-0000-0000-0000-000000000000';

      const seedProducer = this.userRepo.create({
        id: mockProducerId, // UUID ficticio para cumplir la PK de Supabase
        email: 'productor.demo@boletoclick.com',
        name: 'Productora Ocesa Demo S.A.S.',
        birthDate: '1990-01-01',
        role: Role.PRODUCER, // 👈 Le asignamos el rol correspondiente
        allowNewsletter: true,
      });

      await this.userRepo.save(seedProducer);
      console.log('✅ [Seeder] Usuario Productor de prueba cargado.');

      // 2. INYECTAR CATEGORÍAS
      const savedCategories = await this.categoryRepo.save(mockCategories);
      console.log(`✅ [Seeder] ${savedCategories.length} Categorías cargadas.`);

      // 3. INYECTAR VENUES
      const savedVenues = await this.venueRepo.save(mockVenues);
      console.log(
        `✅ [Seeder] ${savedVenues.length} Recintos (Venues) cargados.`,
      );

      // 4. VINCULAR E INYECTAR EVENTOS
      console.log(
        '🔄 [Seeder] Mapeando relaciones dinámicas para los eventos...',
      );

      for (const eventData of mockEvents) {
        const dbVenue = await this.venueRepo.findOne({
          where: { name: eventData.venueName },
        });
        const dbCategory = await this.categoryRepo.findOne({
          where: { slug: eventData.categorySlug },
        });

        if (!dbVenue || !dbCategory) {
          console.warn(
            `⚠️ [Seeder] Saltando "${eventData.title}" porque no coincidió su venueName o categorySlug.`,
          );
          continue;
        }

        const newEvent = this.eventRepo.create({
          title: eventData.title,
          description: eventData.description,
          eventDate: eventData.eventDate,
          venueId: dbVenue.id,
          categoryId: dbCategory.id,
          producerId: mockProducerId,
          ticketTypes: eventData.ticketTypes,
        });

        await this.eventRepo.save(newEvent);
      }

      console.log(
        'Usuario productor, Categorías, Venues y Eventos cargados exitosamente',
      );
    } catch (error) {
      console.error('❌ [Seeder] Error crítico durante la siembra:', error);
    }
  }
}
