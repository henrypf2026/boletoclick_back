import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  UseInterceptors,
  Patch,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersInterceptor } from '../interceptors/user.interceptor';
import { UpdateUserDto } from './dto/updateUser.dto';

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

  @ApiBearerAuth()
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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates the user information' })
  @ApiResponse({
    status: 200,
    description: 'User information updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Update failed. Trying to update an invalid parameter',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @UseInterceptors(UsersInterceptor)
  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() newUserData: UpdateUserDto,
  ) {
    return this.usersService.updateUserInfo(id, newUserData);
  }
}
