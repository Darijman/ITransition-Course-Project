import { Controller, Get, Param, UseInterceptors, Delete, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryCategory } from './inventoryCategory.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { Admin, Public } from 'src/auth/auth.decorators';
import { InventoryCategoriesService } from './inventoryCategories.service';
import { CreateInventoryCategoryDto } from './createInventoryCategory.dto';
import { AuthGuard } from 'src/auth/auth.guard';

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
  @UseGuards(AuthGuard)
  @Post()
  async createNewCategory(@Body() createInventoryCategoryDto: CreateInventoryCategoryDto): Promise<InventoryCategory> {
    return await this.inventoryCategoriesService.createNewCategory(createInventoryCategoryDto);
  }

  @Admin()
  @UseGuards(AuthGuard)
  @Get(':inventoryCategoryId')
  async getCategoryById(
    @Param('inventoryCategoryId', new CustomParseIntPipe('Category ID')) inventoryCategoryId: number,
  ): Promise<InventoryCategory> {
    return await this.inventoryCategoriesService.getCategoryById(inventoryCategoryId);
  }

  @Admin()
  @UseGuards(AuthGuard)
  @Delete(':inventoryCategoryId')
  async deleteInventoryById(
    @Param('inventoryCategoryId', new CustomParseIntPipe('Category ID')) inventoryCategoryId: number,
  ): Promise<{ success: boolean }> {
    return await this.inventoryCategoriesService.deleteCategoryById(inventoryCategoryId);
  }
}
