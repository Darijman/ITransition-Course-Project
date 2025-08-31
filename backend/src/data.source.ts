import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Inventory } from './inventories/inventory.entity';
import { InventoryItem } from './inventoryItems/inventoryItem.entity';
import { InventoryCategory } from './inventoryCategories/inventoryCategory.entity';
import { InventoryTag } from './inventoryTags/inventoryTag.entity';
import { InventoryUser } from './inventoryUsers/inventoryUser.entity';
import { InventoryComment } from './inventoryComments/inventoryComment.entity';
import { InventoryItemLike } from './inventoryItemLikes/inventoryItemLike.entity';
import { InventoryInvite } from './inventoryInvites/inventoryInvite.entity';
import * as dotenv from 'dotenv';
import { Notification } from './notifications/notification.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
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
  synchronize: false,
  timezone: 'Z',
});
