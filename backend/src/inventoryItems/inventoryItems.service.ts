import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './inventoryItem.entity';
import { CreateInventoryItemDto } from './createInventoryItem.dto';
import { InventoryUserRoles } from 'src/inventoryUsers/inventoryUserRoles.enum';
import { UserRoles } from 'src/users/userRoles.enum';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { Inventory } from 'src/inventories/inventory.entity';

@Injectable()
export class InventoryItemsService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryItemsRepository: Repository<InventoryItem>,

    @InjectRepository(InventoryUser)
    private readonly inventoryUsersRepository: Repository<InventoryUser>,

    @InjectRepository(Inventory)
    private readonly inventoriesRepository: Repository<Inventory>,
  ) {}

  async getAllItems(): Promise<InventoryItem[]> {
    return await this.inventoryItemsRepository.find();
  }

  async getItemsByInventoryIdWithLikes(inventoryId: number) {
    if (!inventoryId || isNaN(inventoryId)) {
      throw new BadRequestException({ error: 'Invalid inventory ID!' });
    }

    return await this.inventoryItemsRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.likes', 'like')
      .where('item.inventoryId = :inventoryId', { inventoryId })
      .loadRelationCountAndMap('item.likeCount', 'item.likes')
      .getMany();
  }

  async createNewItem(createInventoryItemDto: CreateInventoryItemDto, userId: number): Promise<InventoryItem> {
    const { inventoryId } = createInventoryItemDto;

    const inventory = await this.inventoriesRepository.findOneBy({ id: inventoryId });
    if (!inventory) {
      throw new BadRequestException({ error: 'Invalid Inventory ID' });
    }

    const inventoryUser = await this.inventoryUsersRepository.findOne({ where: { inventoryId, userId }, relations: ['user'] });
    if (!inventoryUser) {
      throw new ForbiddenException({ error: 'You do not have access to this inventory!' });
    }

    if (inventoryUser.user.role === UserRoles.ADMIN) {
      return await this.inventoryItemsRepository.save(this.inventoryItemsRepository.create(createInventoryItemDto));
    }

    if (inventoryUser.role !== InventoryUserRoles.CREATOR && inventoryUser.role !== InventoryUserRoles.EDITOR) {
      throw new ForbiddenException({ error: 'You do not have permission to create items!' });
    }

    const item = this.inventoryItemsRepository.create(createInventoryItemDto);
    return await this.inventoryItemsRepository.save(item);
  }

  async getItemById(itemId: number): Promise<InventoryItem> {
    if (!itemId || isNaN(itemId)) {
      throw new BadRequestException({ error: 'Invalid item ID!' });
    }

    const item = await this.inventoryItemsRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException({ error: 'Item not found!' });
    }
    return item;
  }

  async deleteItemById(itemId: number): Promise<{ success: boolean }> {
    if (!itemId || isNaN(itemId)) {
      throw new BadRequestException({ error: 'Invalid item ID!' });
    }

    const item = await this.inventoryItemsRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException({ error: 'Item not found!' });
    }

    await this.inventoryItemsRepository.delete(itemId);
    return { success: true };
  }
}
