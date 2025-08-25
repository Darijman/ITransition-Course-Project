import { Module } from '@nestjs/common';
import { InventoryItem } from './inventoryItem.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItemsController } from './inventoryItems.controller';
import { InventoryItemsService } from './inventoryItems.service';
import { UsersModule } from 'src/users/users.module';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { Inventory } from 'src/inventories/inventory.entity';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { InventoriesModule } from 'src/inventories/inventories.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, InventoryUser, Inventory]), CloudinaryModule, UsersModule, InventoriesModule],
  controllers: [InventoryItemsController],
  providers: [InventoryItemsService],
})
export class InventoryItemsModule {}
