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
import { InventoryCategoriesModule } from './inventoryCategories/inventoryCategories.module';
import { InventoryTagsModule } from './inventoryTags/inventoryTags.module';
import { InventoryItemsModule } from './inventoryItems/inventoryItems.module';
import { InventoryUsersModule } from './inventoryUsers/inventoryUsers.module';
import { InventoryCommentsModule } from './inventoryComments/inventoryComments.module';
import { InventoryItemLikesModule } from './inventoryItemLikes/inventoryItemLikes.module';
import { InventoryItemLike } from './inventoryItemLikes/inventoryItemLike.entity';
import { InventoryInvite } from './inventoryInvites/inventoryInvite.entity';
import { InventoryInvitesModule } from './inventoryInvites/inventoryInvites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/notification.entity';

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
        entities: [
          User,
          Inventory,
          InventoryItem,
          InventoryCategory,
          InventoryTag,
          InventoryUser,
          InventoryComment,
          InventoryItemLike,
          InventoryInvite,
          Notification,
        ],
        synchronize: true,
        timezone: 'Z',
      }),
    }),
    UsersModule,
    CloudinaryModule,
    InventoriesModule,
    AuthModule,
    InventoryCategoriesModule,
    InventoryTagsModule,
    InventoryItemsModule,
    InventoryUsersModule,
    InventoryCommentsModule,
    InventoryItemLikesModule,
    InventoryInvitesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
