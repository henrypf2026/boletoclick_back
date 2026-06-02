import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PRODUCER)
  @Post()
  @ApiOperation({
    summary: 'Create a new event category (Admin/Producer only)',
  })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation failed.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Token missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Insufficient role permissions.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Name or slug already exists.',
  })
  async createCategory(@Body() newCategoryData: CreateCategoryDto) {
    return await this.categoriesService.createCategory(newCategoryData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active event categories (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all active categories.',
  })
  async findAllCategories() {
    return await this.categoriesService.findAllCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific category by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Returns the category data.' })
  @ApiResponse({
    status: 404,
    description: 'Not Found. Category does not exist.',
  })
  async findCategoryById(@Param('id') id: string) {
    return await this.categoriesService.findCategoryById(id);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PRODUCER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category by ID (Admin/Producer only)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. New name or slug already in use.',
  })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PRODUCER)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate a category by ID (Admin/Producer only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Category deactivated successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async deactivateCategory(@Param('id') id: string) {
    return await this.categoriesService.deactivateCategory(id);
  }
}
