import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { InventoryItemLike } from './inventoryItemLike.entity';
import { InventoryItemLikesController } from './inventoryItemLikes.controller';
import { InventoryItemLikesService } from './inventoryItemLikes.service';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { InventoryItem } from 'src/inventoryItems/inventoryItem.entity';
import { InventoriesModule } from 'src/inventories/inventories.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItemLike, InventoryUser, InventoryItem]), UsersModule, InventoriesModule],
  controllers: [InventoryItemLikesController],
  providers: [InventoryItemLikesService],
})
export class InventoryItemLikesModule {}
