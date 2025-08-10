import { Inventory } from 'src/inventories/inventory.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('inventory_categories')
export class InventoryCategory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  description?: string;

  @OneToMany(() => Inventory, (inventory) => inventory.inventoryCategory)
  inventories: Inventory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
