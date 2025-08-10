import { InventoryCategory } from 'src/inventoryCategories/inventoryCategory.entity';
import { InventoryItem } from 'src/inventoryItems/inventoryItem.entity';
import { InventoryTag } from 'src/inventoryTags/inventoryTag.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { User } from 'src/users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => InventoryTag, (tag) => tag.inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tagId' })
  tag: InventoryTag;

  @Column()
  tagId: number;

  @ManyToOne(() => InventoryCategory, (category) => category.inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryCategoryId' })
  inventoryCategory: InventoryCategory;

  @Column()
  inventoryCategoryId: number;

  @ManyToOne(() => User, (user) => user.inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: number;

  @OneToMany(() => InventoryItem, (item) => item.inventory)
  items: InventoryItem[];

  @OneToMany(() => InventoryUser, (invUser) => invUser.inventory)
  inventoryUsers: InventoryUser[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
