import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inventory } from 'src/inventories/inventory.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';

@Entity('inventory_comments')
export class InventoryComment {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'text' })
  text: string;

  @Column()
  inventoryId: number;

  @ManyToOne(() => Inventory, (inventory) => inventory.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  @Column()
  authorId: number;

  @ManyToOne(() => InventoryUser, (inventoryUser) => inventoryUser.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: InventoryUser;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
