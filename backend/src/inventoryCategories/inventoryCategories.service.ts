import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryCategory } from './inventoryCategory.entity';
import { CreateInventoryCategoryDto } from './createInventoryCategory.dto';

@Injectable()
export class InventoryCategoriesService {
  constructor(
    @InjectRepository(InventoryCategory)
    private readonly inventoryCategoriesRepository: Repository<InventoryCategory>,
  ) {}

  async getAllCategories(): Promise<InventoryCategory[]> {
    return await this.inventoryCategoriesRepository.find();
  }

  async createNewCategory(createInventoryCategoryDto: CreateInventoryCategoryDto): Promise<InventoryCategory> {
    const category = this.inventoryCategoriesRepository.create(createInventoryCategoryDto);
    return await this.inventoryCategoriesRepository.save(category);
  }

  async getCategoryById(categoryId: number): Promise<InventoryCategory> {
    if (!categoryId || isNaN(categoryId)) {
      throw new BadRequestException({ error: 'Invalid category ID!' });
    }

    const category = await this.inventoryCategoriesRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException({ error: 'Category not found!' });
    }
    return category;
  }

  async deleteCategoryById(categoryId: number): Promise<{ success: boolean }> {
    if (!categoryId || isNaN(categoryId)) {
      throw new BadRequestException({ error: 'Invalid category ID!' });
    }

    const category = await this.inventoryCategoriesRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException({ error: 'Category not found!' });
    }

    await this.inventoryCategoriesRepository.delete(categoryId);
    return { success: true };
  }
}
