import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { ErrorTranslatorService } from '../common/services/error-translator.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly errorTranslator: ErrorTranslatorService,
  ) {}

  async register(userData: RegisterDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      throw new BadRequestException(
        this.errorTranslator.translateSupabaseError(error.message),
      );
    }

    if (!data.user) {
      throw new BadRequestException(
        'No se pudo registrar el usuario en el sistema de autenticación.',
      );
    }

    const { password, role, ...profileData } = userData;

    if (role === Role.ADMIN) {
      throw new BadRequestException(
        'No está permitido crear usuarios ADMIN desde este endpoint.',
      );
    }

    const assignedRole = role === Role.PRODUCER ? Role.PRODUCER : Role.USER;

    const savedUserProfile = await this.usersService.upsertProfile(
      data.user.id,
      {
        ...profileData,
        role: assignedRole,
      },
    );

    await this.emailService.sendWelcomeEmail(
      userData.name,
      userData.email,
      assignedRole,
    );

    return {
      message: 'Usuario registrado exitosamente.',
      user: data.user,
      userProfile: savedUserProfile,
      session: data.session,
    };
  }

  async login(loginDto: LoginDto, res: Response) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error) {
      throw new UnauthorizedException(
        this.errorTranslator.translateSupabaseError(error.message),
      );
    }

    const token = data.session?.access_token;

    if (!token) {
      throw new UnauthorizedException('No se pudo generar la sesión.');
    }

    res.cookie('access_token', token, {
      httpOnly: true,
      signed: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return {
      message: 'Inicio de sesión correcto',
      user: data.user,
      accessToken: token,
      refreshToken: data.session?.refresh_token,
    };
  }

  async setSession(accessToken: string, res: Response) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      signed: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return {
      ok: true,
      user: data.user,
      accessToken,
      refreshToken: undefined,
    };
  }

  async forgotPassword(email: string) {
    const supabase = this.supabaseService.getClient();

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3002';

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
