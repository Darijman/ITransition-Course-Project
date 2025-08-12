import { Controller, Get, Param, UseInterceptors, Delete, Post, Body } from '@nestjs/common';
import { InventoryCategory } from './inventoryCategory.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { Admin, Public } from 'src/auth/auth.decorators';
import { InventoryCategoriesService } from './inventoryCategories.service';
import { CreateInventoryCategoryDto } from './createInventoryCategory.dto';

@Controller('inventory_categories')
@UseInterceptors(ClassSerializerInterceptor)
export class InventoryCategoriesController {
  constructor(private readonly inventoryCategoriesService: InventoryCategoriesService) {}

  @Public()
  @Get()
  async getAllCategories(): Promise<InventoryCategory[]> {
    return await this.inventoryCategoriesService.getAllCategories();
  }

  @Admin()
  @Post()
  async createNewCategory(@Body() createInventoryCategoryDto: CreateInventoryCategoryDto): Promise<InventoryCategory> {
    return await this.inventoryCategoriesService.createNewCategory(createInventoryCategoryDto);
  }

  @Admin()
  @Get(':inventoryCategoryId')
  async getCategoryById(
    @Param('inventoryCategoryId', new CustomParseIntPipe('Category ID')) inventoryCategoryId: number,
  ): Promise<InventoryCategory> {
    return await this.inventoryCategoriesService.getCategoryById(inventoryCategoryId);
  }

  @Admin()
  @Delete(':inventoryCategoryId')
  async deleteInventoryById(
    @Param('inventoryCategoryId', new CustomParseIntPipe('Category ID')) inventoryCategoryId: number,
  ): Promise<{ success: boolean }> {
    return await this.inventoryCategoriesService.deleteCategoryById(inventoryCategoryId);
  }
}
