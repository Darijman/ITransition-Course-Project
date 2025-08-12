import { Module } from '@nestjs/common';
import { InventoryUser } from './inventoryUser.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryUsersController } from './inventoryUsers.controller';
import { InventoryUsersService } from './inventoryUsers.service';
import { InventoriesModule } from 'src/inventories/inventories.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryUser]), InventoriesModule, UsersModule],
  controllers: [InventoryUsersController],
  providers: [InventoryUsersService],
})
export class InventoryUsersModule {}
