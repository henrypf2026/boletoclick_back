import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly ormCategoryRepository: Repository<Category>,
  ) {}

  async createCategory(newCategoryData: CreateCategoryDto): Promise<Category> {
    const newCategory = this.ormCategoryRepository.create(newCategoryData);
    return await this.ormCategoryRepository.save(newCategory);
  }

  async findAllCategories(): Promise<Category[]> {
    return await this.ormCategoryRepository.find();
  }

  async findCategoryById(id: string): Promise<Category | null> {
    return await this.ormCategoryRepository.findOne({
      where: { id },
    });
  }

  async findByNameOrSlug(name: string, slug: string): Promise<Category | null> {
    return await this.ormCategoryRepository.findOne({
      where: [{ name }, { slug }], // 💡 Esto ejecuta un "WHERE name = $1 OR slug = $2"
    });
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findCategoryById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updatedCategory = this.ormCategoryRepository.merge(
      category,
      updateCategoryDto,
    );
    return await this.ormCategoryRepository.save(updatedCategory);
  }

  async deactivateCategory(id: string): Promise<void> {
    const result = await this.ormCategoryRepository.softDelete({ id });

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException('Category not found or already deactivated');
    }
  }
}
