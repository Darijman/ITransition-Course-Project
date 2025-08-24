import { InventoryItem } from 'src/inventoryItems/inventoryItem.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('inventory_item_likes')
export class InventoryItemLike {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column()
  itemId: number;

  @ManyToOne(() => InventoryItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: InventoryItem;

  @Column()
  inventoryUserId: number;

  @ManyToOne(() => InventoryUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryUserId' })
  inventoryUser: InventoryUser;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
