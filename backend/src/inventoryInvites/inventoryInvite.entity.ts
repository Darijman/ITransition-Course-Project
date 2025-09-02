import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inventory } from 'src/inventories/inventory.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { InventoryInviteStatuses } from './inventoryInviteStatuses.enum';
import { InventoryUserRoles } from 'src/inventoryUsers/inventoryUserRoles.enum';
import { User } from 'src/users/user.entity';

@Entity('inventory_invites')
export class InventoryInvite {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToOne(() => Inventory, (inventory) => inventory.invites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  @Column()
  inventoryId: number;

  @ManyToOne(() => InventoryUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inviterInventoryUserId' })
  inviter: InventoryUser;

  @Column()
  inviterInventoryUserId: number;

  @ManyToOne(() => InventoryUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'inviteeInventoryUserId' })
  invitee?: InventoryUser;

  @Column({ nullable: true })
  inviteeInventoryUserId?: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'inviteeUserId' })
  inviteeUser?: User;

  @Column({ nullable: true })
  inviteeUserId?: number;

  @Column({ type: 'varchar', length: 255 })
  inviteeEmail: string;

  @Column({ type: 'enum', enum: InventoryUserRoles, default: InventoryUserRoles.VIEWER })
  role: InventoryUserRoles;

  @Column({ type: 'enum', enum: InventoryInviteStatuses, default: InventoryInviteStatuses.PENDING })
  status: InventoryInviteStatuses;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date | null;
}
