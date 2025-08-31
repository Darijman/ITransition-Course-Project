import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryTagsService } from './inventoryTags.service';
import { InventoryTagsController } from './inventoryTags.controller';
import { InventoryTag } from './inventoryTag.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryTag]), UsersModule],
  providers: [InventoryTagsService],
  controllers: [InventoryTagsController],
})
export class InventoryTagsModule {}
