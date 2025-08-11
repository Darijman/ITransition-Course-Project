import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { User } from './users/user.entity';
import { Inventory } from './inventories/inventory.entity';
import { InventoryItem } from './inventoryItems/inventoryItem.entity';
import { InventoryCategory } from './inventoryCategories/inventoryCategory.entity';
import { InventoryTag } from './inventoryTags/inventoryTag.entity';
import { InventoryUser } from './inventoryUsers/inventoryUser.entity';
import { InventoryComment } from './inventoryComments/inventoryComment.entity';
import { InventoriesModule } from './inventories/inventories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities: [User, Inventory, InventoryItem, InventoryCategory, InventoryTag, InventoryUser, InventoryComment],
        synchronize: false,
        timezone: 'Z',
      }),
    }),
    UsersModule,
    CloudinaryModule,
    InventoriesModule,
    AuthModule,
  ],
})
export class AppModule {}
