import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { InventoryItemLike } from './inventoryItemLike.entity';
import { InventoryItemLikesController } from './inventoryItemLikes.controller';
import { InventoryItemLikesService } from './inventoryItemLikes.service';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItemLike]), UsersModule],
  controllers: [InventoryItemLikesController],
  providers: [InventoryItemLikesService],
})
export class InventoryItemLikesModule {}
