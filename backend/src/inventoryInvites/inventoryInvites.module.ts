import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoriesModule } from 'src/inventories/inventories.module';
import { InventoryInvite } from './inventoryInvite.entity';
import { InventoryInvitesController } from './inventoryInvites.controller';
import { InventoryInvitesService } from './inventoryInvites.service';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/user.entity';
import { InventoryUsersModule } from 'src/inventoryUsers/inventoryUsers.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryInvite, User]), InventoriesModule, UsersModule, InventoryUsersModule, NotificationsModule],
  controllers: [InventoryInvitesController],
  providers: [InventoryInvitesService],
})
export class InventoryInvitesModule {}
