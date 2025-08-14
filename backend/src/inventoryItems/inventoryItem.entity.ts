import { Inventory } from 'src/inventories/inventory.entity';
import { InventoryItemLike } from 'src/inventoryItemLikes/inventoryItemLike.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column()
  inventoryId: number;

  @ManyToOne(() => Inventory, (inventory) => inventory.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  @Column()
  creatorId: number;

  @ManyToOne(() => InventoryUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: InventoryUser;

  @OneToMany(() => InventoryItemLike, (like) => like.item)
  likes: InventoryItemLike[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
