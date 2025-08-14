import { Module } from '@nestjs/common';
import { InventoriesController } from './inventories.controller';
import { InventoriesService } from './inventories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { Inventory } from './inventory.entity';
import { UsersModule } from 'src/users/users.module';
import { InventoryTag } from 'src/inventoryTags/inventoryTag.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, InventoryTag, InventoryUser]), CloudinaryModule, UsersModule],
  controllers: [InventoriesController],
  providers: [InventoriesService],
  exports: [InventoriesService],
})
export class InventoriesModule {}
