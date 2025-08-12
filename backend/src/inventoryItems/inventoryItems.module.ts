import { Module } from '@nestjs/common';
import { InventoryItem } from './inventoryItem.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItemsController } from './inventoryItems.controller';
import { InventoryItemsService } from './inventoryItems.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem]), UsersModule],
  controllers: [InventoryItemsController],
  providers: [InventoryItemsService],
})
export class InventoryItemsModule {}
