import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async createCategory(newCategoryData: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoriesRepository.findByNameOrSlug(
      newCategoryData.name,
      newCategoryData.slug,
    );

    if (existingCategory) {
      throw new ConflictException(
        'A category with this name or slug already exists',
      );
    }

    return await this.categoriesRepository.createCategory(newCategoryData);
  }

  async findAllCategories(): Promise<Category[]> {
    return await this.categoriesRepository.findAllCategories();
  }

  async findCategoryById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findCategoryById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.findCategoryById(id);

    if (updateCategoryDto.name || updateCategoryDto.slug) {
      const conflictingCategory =
        await this.categoriesRepository.findByNameOrSlug(
          updateCategoryDto.name ?? '',
          updateCategoryDto.slug ?? '',
        );

      if (conflictingCategory && conflictingCategory.id !== id) {
        throw new ConflictException(
          'Another category with this name or slug already exists',
        );
      }
    }

    return await this.categoriesRepository.updateCategory(
      id,
      updateCategoryDto,
    );
  }

  async deactivateCategory(id: string): Promise<void> {
    await this.findCategoryById(id);

    return await this.categoriesRepository.deactivateCategory(id);
  }
}
