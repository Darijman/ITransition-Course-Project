import { Inventory } from 'src/inventories/inventory.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';

@Entity('inventory_tags')
export class InventoryTag {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description?: string;

  @ManyToMany(() => Inventory, (inventory) => inventory.tags)
  inventories: Inventory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
