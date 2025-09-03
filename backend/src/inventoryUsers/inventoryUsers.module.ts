import { forwardRef, Module } from '@nestjs/common';
import { InventoryUser } from './inventoryUser.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryUsersController } from './inventoryUsers.controller';
import { InventoryUsersService } from './inventoryUsers.service';
import { InventoriesModule } from 'src/inventories/inventories.module';
import { UsersModule } from 'src/users/users.module';
import { Inventory } from 'src/inventories/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryUser, Inventory]), forwardRef(() => InventoriesModule), UsersModule],
  controllers: [InventoryUsersController],
  providers: [InventoryUsersService],
  exports: [InventoryUsersService],
})
export class InventoryUsersModule {}
