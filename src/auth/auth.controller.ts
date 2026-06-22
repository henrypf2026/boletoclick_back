import { Body, Controller, Post, Get, UseGuards, Res } from '@nestjs/common';

import { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotpassword.dto';

import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario y crear su perfil' })
  @ApiResponse({
    status: 201,
    description:
      'Usuario registrado con éxito y perfil guardado en la base de datos.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Solicitud incorrecta (Bad Request). Error de validación o el correo electrónico ya existe.',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Autenticar las credenciales del usuario a través de Supabase',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso.',
  })
  @ApiResponse({
    status: 401,
    description:
      'No autorizado (Unauthorized). Correo electrónico o contraseña inválidos.',
  })
  login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Obtener los datos de sesión del usuario autenticado actual',
  })
  @ApiResponse({
    status: 200,
    description:
      'Devuelve los datos del payload del token extraídos de la sesión actual.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado (Unauthorized). Token ausente o inválido.',
  })
  getMe(@CurrentUser() user) {
    return {
      id: user.id,
      email: user.email,
      provider: user.app_metadata?.provider,
      name: user.user_metadata?.full_name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    };
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Enviar correo electrónico de recuperación de contraseña',
  })
  @ApiResponse({
    status: 200,
    description:
      'Correo electrónico de recuperación de contraseña enviado con éxito.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dirección de correo electrónico inválida.',
  })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Cerrar sesión',
  })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');

    return {
      message: 'Sesión cerrada correctamente',
    };
  }

  //---- Compañeros de equipo pueden probar estas rutas para verificar los roles y permisos :) ---//
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin-test')
  @ApiOperation({
    summary: 'Endpoint de prueba restringido estrictamente al rol ADMIN',
  })
  @ApiResponse({
    status: 200,
    description: 'Acceso concedido para Administrador.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido (Forbidden). El usuario no tiene permisos de Administrador.',
  })
  adminTest() {
    return {
      message: 'Ruta exclusiva para ADMIN',
    };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER, Role.ADMIN)
  @Get('producer-test')
  @ApiOperation({
    summary: 'Endpoint de prueba restringido a los roles PRODUCER o ADMIN',
  })
  @ApiResponse({
    status: 200,
    description: 'Acceso concedido para Productor o Administrador.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (Forbidden). Permisos insuficientes.',
  })
  producerTest() {
    return {
      message: 'Ruta para PRODUCER o ADMIN',
    };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.PRODUCER, Role.ADMIN)
  @Get('user-test')
  @ApiOperation({
    summary:
      'Endpoint de prueba accesible por cualquier perfil de usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description:
      'Acceso concedido para cualquier perfil válido en la base de datos.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (Forbidden). Perfil activo no encontrado.',
  })
  userTest() {
    return {
      message: 'Esta ruta está disponible para cualquier usuario autenticado',
    };
  }
}
