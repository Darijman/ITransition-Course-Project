import { InventoryCategory } from 'src/inventoryCategories/inventoryCategory.entity';
import { InventoryComment } from 'src/inventoryComments/inventoryComment.entity';
import { InventoryItem } from 'src/inventoryItems/inventoryItem.entity';
import { InventoryTag } from 'src/inventoryTags/inventoryTag.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { User } from 'src/users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255 })
  imageUrl: string;

  @ManyToOne(() => InventoryCategory, (category) => category.inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: InventoryCategory;

  @Column()
  categoryId: number;

  @ManyToOne(() => User, (user) => user.inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: number;

  @OneToMany(() => InventoryComment, (comment) => comment.inventory)
  comments: InventoryComment[];

  @OneToMany(() => InventoryItem, (item) => item.inventory)
  items: InventoryItem[];

  @ManyToMany(() => InventoryTag, (tag) => tag.inventories, { cascade: true })
  @JoinTable({
    name: 'inventory_tags_relation',
    joinColumn: { name: 'inventoryId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: InventoryTag[];

  @OneToMany(() => InventoryUser, (invUser) => invUser.inventory)
  inventoryUsers: InventoryUser[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
