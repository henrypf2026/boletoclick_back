import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async register(userData: RegisterDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.user) {
      throw new BadRequestException(
        'No se pudo registrar el usuario en el sistema de autenticación.',
      );
    }
    const { password, ...profileData } = userData;

    const savedUserProfile = await this.usersService.createUserProfile(
      data.user.id,
      profileData,
    );

    return {
      message: 'Usuario registrado exitosamente.',
      user: data.user,
      userProfile: savedUserProfile,
      session: data.session,
    };
  }

  async login(loginDto: LoginDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      message: 'Inicio de sesión correcto',
      user: data.user,
      session: data.session,
      access_token: data.session?.access_token,
    };
  }

  async forgotPassword(email: string) {
    const supabase = this.supabaseService.getClient();

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${frontendUrl}/update-password`,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message:
        'Si el correo electrónico está registrado, se enviará un enlace para restablecer la contraseña.',
    };
  }
}
