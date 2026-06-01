import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UseGuards, Get } from '@nestjs/common';
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
import { ForgotPasswordDto } from './dto/forgotpassword.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and create their profile' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully and profile saved in database.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed or email already exists.',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user credentials via Supabase' })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns access token and user session.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid email or password.',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user session data' })
  @ApiResponse({
    status: 200,
    description:
      'Returns token payload data extracted from the current session.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Token missing or invalid.',
  })
  getMe(@CurrentUser() user) {
    return user;
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset email link' })
  @ApiResponse({
    status: 200,
    description: 'Recovery email process handled successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid email format or provider error.',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  //---- Compañeros de equipo pueden probar estas rutas para verificar los roles y permisos :) ---//
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin-test')
  @ApiOperation({ summary: 'Test endpoint restricted strictly to ADMIN role' })
  @ApiResponse({ status: 200, description: 'Access granted for Admin.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have Admin permissions.',
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
    summary: 'Test endpoint restricted to PRODUCER or ADMIN roles',
  })
  @ApiResponse({
    status: 200,
    description: 'Access granted for Producer or Admin.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Insufficient permissions.',
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
    summary: 'Test endpoint accessible by any authenticated user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Access granted for any valid database profile.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Active profile not found.',
  })
  userTest() {
    return {
      message: 'Esta ruta está disponible para cualquier usuario autenticado',
    };
  }
}
