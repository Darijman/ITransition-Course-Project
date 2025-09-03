import { forwardRef, Module } from '@nestjs/common';
import { InventoriesController } from './inventories.controller';
import { InventoriesService } from './inventories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { Inventory } from './inventory.entity';
import { UsersModule } from 'src/users/users.module';
import { InventoryTag } from 'src/inventoryTags/inventoryTag.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { InventoriesGateway } from './inventories.gateway';
import { InventoryInvite } from 'src/inventoryInvites/inventoryInvite.entity';
import { InventoryInvitesModule } from 'src/inventoryInvites/inventoryInvites.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, InventoryTag, InventoryUser, InventoryInvite]),
    CloudinaryModule,
    UsersModule,
    forwardRef(() => InventoryInvitesModule),
  ],
  controllers: [InventoriesController],
  providers: [InventoriesService, InventoriesGateway],
  exports: [InventoriesService, InventoriesGateway],
})
export class InventoriesModule {}
