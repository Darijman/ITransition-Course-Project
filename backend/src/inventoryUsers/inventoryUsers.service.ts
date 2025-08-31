import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InventoryUser } from './inventoryUser.entity';
import { CreateInventoryUserDto } from './createInventoryUser.dto';
import { InventoriesService } from 'src/inventories/inventories.service';
import { UsersService } from 'src/users/users.service';
import { Inventory } from 'src/inventories/inventory.entity';
import { ReqUser } from 'src/interfaces/ReqUser';

@Injectable()
export class InventoryUsersService {
  constructor(
    @InjectRepository(InventoryUser)
    private readonly inventoryUsersRepository: Repository<InventoryUser>,
    private readonly inventoriesService: InventoriesService,

    @InjectRepository(Inventory)
    private readonly inventoriesRepository: Repository<Inventory>,

    private readonly usersService: UsersService,
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

  async deleteInventoryUserById(itemId: number): Promise<{ success: boolean }> {
    if (!itemId || isNaN(itemId)) {
      throw new BadRequestException({ error: 'Invalid Inventory User ID!' });
    }

    const inventoryUser = await this.inventoryUsersRepository.findOne({ where: { id: itemId } });
    if (!inventoryUser) {
      throw new NotFoundException({ error: 'Inventory User not found!' });
    }

    await this.inventoryUsersRepository.delete(itemId);
    return { success: true };
  }

  async leaveManyInventories(inventoryIds: number[], reqUser: ReqUser): Promise<{ success: boolean }> {
    if (!inventoryIds || !inventoryIds.length) {
      throw new BadRequestException({ error: 'No inventory IDs provided!' });
    }

    const validIds = inventoryIds.some((id) => isNaN(id));
    if (validIds) {
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

    return { success: true };
  }
}
