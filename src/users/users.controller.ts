import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersInterceptor } from '../interceptors/user.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Get the profile of the currently authenticated user',
  })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMe(@CurrentUser() user): Promise<User> {
    const userProfile = await this.usersService.findUserById(user.id);

    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    return userProfile;
  }

  @Get(':id')
  @UseInterceptors(UsersInterceptor)
  @ApiOperation({ summary: 'Get a user profile by ID' })
  async findUserById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findUserById(id);

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }
}
