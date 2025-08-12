import { Module } from '@nestjs/common';
import { InventoryCategory } from './inventoryCategory.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryCategoriesController } from './inventoryCategories.controller';
import { InventoryCategoriesService } from './inventoryCategories.service';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryCategory])],
  controllers: [InventoryCategoriesController],
  providers: [InventoryCategoriesService],
})
export class InventoryCategoriesModule {}
