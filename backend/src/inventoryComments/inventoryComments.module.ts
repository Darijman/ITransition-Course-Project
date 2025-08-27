import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryCommentsService } from './inventoryComments.service';
import { InventoryCommentsController } from './inventoryComments.controller';
import { InventoryComment } from './inventoryComment.entity';
import { UsersModule } from 'src/users/users.module';
import { Inventory } from 'src/inventories/inventory.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { InventoriesModule } from 'src/inventories/inventories.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryComment, Inventory, InventoryUser]), UsersModule, InventoriesModule],
  providers: [InventoryCommentsService],
  controllers: [InventoryCommentsController],
})
export class InventoryCommentsModule {}
