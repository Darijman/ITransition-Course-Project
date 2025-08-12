import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryUser } from './inventoryUser.entity';
import { CreateInventoryUserDto } from './createInventoryUser.dto';
import { InventoriesService } from 'src/inventories/inventories.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class InventoryUsersService {
  constructor(
    @InjectRepository(InventoryUser)
    private readonly inventoryUsersRepository: Repository<InventoryUser>,
    private readonly inventoriesService: InventoriesService,
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
    await this.inventoriesService.getInventoryById(inventoryId);

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
}
