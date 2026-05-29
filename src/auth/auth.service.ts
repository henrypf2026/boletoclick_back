import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/users.entity';
import { Role } from './enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signUp({
      email: registerDto.email,
      password: registerDto.password,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.user) {
      throw new BadRequestException('No se pudo crear el usuario');
    }

    const user = this.userRepository.create({
      supabaseUserId: data.user.id,
      email: registerDto.email,
      name: registerDto.name,
      birthDate: registerDto.birthDate,
      documentNumber: registerDto.documentNumber,
      profileImageUrl: registerDto.profileImageUrl,
      allowNewsletter: registerDto.allowNewsletter,
      businessName: registerDto.businessName,
      role: Role.USER,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      message: 'Usuario registrado correctamente',
      user: data.user,
      userProfile: savedUser,
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
      message: 'Login correcto',
      user: data.user,
      session: data.session,
      access_token: data.session?.access_token,
    };
  }
  async forgotPassword(email: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/update-password',
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Si el correo existe, se enviará un enlace de recuperación',
    };
  }
}
