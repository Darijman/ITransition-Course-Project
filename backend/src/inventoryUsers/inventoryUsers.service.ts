import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InventoryUser } from './inventoryUser.entity';
import { CreateInventoryUserDto } from './createInventoryUser.dto';
import { InventoriesService } from 'src/inventories/inventories.service';
import { UsersService } from 'src/users/users.service';
import { Inventory } from 'src/inventories/inventory.entity';
import { ReqUser } from 'src/interfaces/ReqUser';
import { InventoryUserRoles } from './inventoryUserRoles.enum';
import { UserRoles } from 'src/users/userRoles.enum';
import { InventoriesGateway } from 'src/inventories/inventories.gateway';

@Injectable()
export class InventoryUsersService {
  constructor(
    @InjectRepository(InventoryUser)
    private readonly inventoryUsersRepository: Repository<InventoryUser>,
    private readonly inventoriesService: InventoriesService,

    @InjectRepository(Inventory)
    private readonly inventoriesRepository: Repository<Inventory>,

    private readonly usersService: UsersService,
    private readonly inventoriesGateway: InventoriesGateway,
  ) {}

  async getAllInventoriesUsers(): Promise<InventoryUser[]> {
    return await this.inventoryUsersRepository.find();
  }

  async getUsersByInventoryId(inventoryId: number): Promise<InventoryUser[]> {
    if (isNaN(inventoryId)) {
      throw new BadRequestException({ error: 'Invalid Inventory ID!' });
    }

    await this.inventoriesService.getInventoryById(inventoryId);
    return await this.inventoryUsersRepository.find({ where: { inventoryId } });
  }

  async createNewInventoryUser(createInventoryUserDto: CreateInventoryUserDto): Promise<InventoryUser> {
    const { userId, inventoryId } = createInventoryUserDto;
    const user = await this.usersService.getUserById(userId);

    const inventoryExists = await this.inventoriesRepository.findOneBy({ id: inventoryId });
    if (!inventoryExists) {
      throw new BadRequestException({ error: 'Inventory not found!' });
    }

    const alreadyExists = await this.inventoryUsersRepository.findOneBy({ userId, inventoryId });
    if (alreadyExists) {
      throw new BadRequestException({ error: 'User already added to this inventory!' });
    }

    const newInventoryUser = { ...createInventoryUserDto, name: user.name };
    const inventoryUser = this.inventoryUsersRepository.create(newInventoryUser);
    return await this.inventoryUsersRepository.save(inventoryUser);
  }

  async getInventoryUserById(itemId: number): Promise<InventoryUser> {
    if (!itemId || isNaN(itemId)) {
      throw new BadRequestException({ error: 'Invalid Inventory User ID!' });
    }

    const inventoryUser = await this.inventoryUsersRepository.findOne({ where: { id: itemId } });
    if (!inventoryUser) {
      throw new NotFoundException({ error: 'Inventory User not found!' });
    }
    return inventoryUser;
  }

  async deleteInventoryUsersByIds(inventoryId: number, inventoryUserIds: number[], reqUser: ReqUser): Promise<{ success: boolean }> {
    if (!Array.isArray(inventoryUserIds) || inventoryUserIds.length === 0) {
      throw new BadRequestException({ error: 'Invalid Inventory User IDs!' });
    }

    const invalidIds = inventoryUserIds.filter((id) => !id || isNaN(id));
    if (invalidIds.length) {
      throw new BadRequestException({ error: `Invalid Inventory User IDs: ${invalidIds.join(', ')}` });
    }

    const inventory = await this.inventoriesRepository.findOne({ where: { id: inventoryId } });
    if (!inventory) {
      throw new NotFoundException({ error: 'Inventory not found!' });
    }

    const existingUsers = await this.inventoryUsersRepository.find({
      where: { id: In(inventoryUserIds), inventoryId },
      relations: ['user'],
    });
    if (!existingUsers.length) {
      throw new NotFoundException({ error: 'No Inventory Users found for the given IDs in this inventory!' });
    }

    if (reqUser.role !== UserRoles.ADMIN) {
      const reqInventoryUser = await this.inventoryUsersRepository.findOne({
        where: { inventoryId, userId: reqUser.id },
      });

      if (!reqInventoryUser || ![InventoryUserRoles.CREATOR, InventoryUserRoles.ADMIN].includes(reqInventoryUser.role)) {
        throw new ForbiddenException({ error: 'You do not have permission to delete users!' });
      }

      if (existingUsers.some((user) => user.role === InventoryUserRoles.CREATOR)) {
        throw new ForbiddenException({ error: 'You cannot delete the creator of the inventory!' });
      }
    }

    const idsToDelete = existingUsers.map((user) => user.id);
    await this.inventoryUsersRepository.delete(idsToDelete);

    this.inventoriesGateway.server.to(inventoryId.toString()).emit('inventory-users-deleted', {
      inventoryId,
      deletedUserIds: idsToDelete,
      deletedBy: reqUser.name,
    });

    for (const deletedUser of existingUsers) {
      if (deletedUser.user?.email) {
        this.inventoriesGateway.server.to(deletedUser.user.email).emit('you-were-removed-from-inventory', {
          inventoryId,
          inventoryName: inventory.title,
          inventoryStatus: inventory.status,
          deletedBy: reqUser.name,
        });
      }
    }

    return { success: true };
  }

  async leaveManyInventories(
    inventoryIds: number[],
    reqUser: ReqUser,
  ): Promise<{ success: boolean; updatedInventories: { id: number; inventoryUsers: number[] }[] }> {
    if (!inventoryIds || !inventoryIds.length) {
      throw new BadRequestException({ error: 'No inventory IDs provided!' });
    }

    const hasInvalidIds = inventoryIds.some((id) => isNaN(id));
    if (hasInvalidIds) {
      throw new BadRequestException({ error: 'Invalid inventory IDs!' });
    }

    const inventoryUsers = await this.inventoryUsersRepository.find({
      where: {
        userId: reqUser.id,
        inventoryId: In(inventoryIds),
      },
      relations: ['inventory', 'inventory.creator'],
    });

    if (!inventoryUsers.length) {
      throw new BadRequestException({ error: 'No matching inventories to leave!' });
    }

    const creatorInventories = inventoryUsers.filter((e) => e.inventory.creatorId === reqUser.id);
    if (creatorInventories.length) {
      throw new BadRequestException({ error: 'Creators cannot leave their own inventories!' });
    }

    await this.inventoryUsersRepository
      .createQueryBuilder()
      .delete()
      .from('inventory_users')
      .where('userId = :userId', { userId: reqUser.id })
      .andWhere('inventoryId IN (:...inventoryIds)', { inventoryIds })
      .execute();

    const updatedInventories = await this.inventoriesRepository.find({
      where: { id: In(inventoryIds) },
      relations: ['inventoryUsers'],
    });

    updatedInventories.forEach((inventory) => {
      this.inventoriesGateway.server.to(`inventory-${inventory.id}`).emit('user-left-inventory', {
        inventoryId: inventory.id,
        userId: reqUser.id,
      });
    });

    return {
      success: true,
      updatedInventories: updatedInventories.map((inv) => ({
        id: inv.id,
        inventoryUsers: inv.inventoryUsers.map((u) => u.userId),
      })),
    };
  }
}
