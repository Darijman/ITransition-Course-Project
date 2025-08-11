import { Inventory } from 'src/inventories/inventory.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { InventoryUserRoles } from './inventoryUserRoles.enum';
import { User } from 'src/users/user.entity';
import { InventoryComment } from 'src/inventoryComments/inventoryComment.entity';

@Entity('inventory_users')
export class InventoryUser {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @ManyToOne(() => User, (user) => user.inventoryUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Inventory, (inventory) => inventory.inventoryUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  @Column()
  inventoryId: number;

  @OneToMany(() => InventoryComment, (comment) => comment.author)
  comments: InventoryComment[];

  @Column({ type: 'enum', enum: InventoryUserRoles, default: InventoryUserRoles.VIEWER })
  role: InventoryUserRoles;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
