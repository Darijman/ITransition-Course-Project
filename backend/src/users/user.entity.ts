import { Exclude } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import { UserRoles } from './userRoles.enum';
import { Inventory } from 'src/inventories/inventory.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  constructor(partial?: Partial<User>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', unique: true, length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ type: 'varchar', length: 100 })
  @Exclude()
  password: string;

  @OneToMany(() => Inventory, (inventory) => inventory.creator)
  inventories: Inventory[];

  @OneToMany(() => InventoryUser, (inventoryUser) => inventoryUser.user)
  inventoryUsers: InventoryUser[];

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.USER })
  role: UserRoles;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
}
