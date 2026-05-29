import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UseGuards, Get } from '@nestjs/common';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Get('me')
  getMe(@CurrentUser() user) {
    return user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // Compañeros de equipo pueden probar estas rutas para verificar los roles y permisos :)

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin-test')
  adminTest() {
    return {
      message: 'Ruta exclusiva para ADMIN',
    };
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER, Role.ADMIN)
  @Get('producer-test')
  producerTest() {
    return {
      message: 'Ruta para PRODUCER o ADMIN',
    };
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.PRODUCER, Role.ADMIN)
  @Get('user-test')
  userTest() {
    return {
      message: 'Ruta para cualquier usuario autenticado',
    };
  }
}
