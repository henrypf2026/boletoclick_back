import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')!;
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY')!;
    const supabaseServiceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    )!;

    // Cliente estándar para operaciones comunes
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Cliente maestro para operaciones críticas de administración (como crear usuarios)
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Método nuevo que usaremos para crear la cuenta de Staff de raíz
  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  testConnection() {
    return {
      message: 'Supabase conectado correctamente',
      url: this.configService.get<string>('SUPABASE_URL'),
    };
  }
}
