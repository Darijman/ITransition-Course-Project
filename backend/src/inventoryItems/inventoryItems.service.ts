import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './inventoryItem.entity';
import { CreateInventoryItemDto } from './createInventoryItem.dto';

@Injectable()
export class InventoryItemsService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryItemsRepository: Repository<InventoryItem>,
  ) {}

  async getAllItems(): Promise<InventoryItem[]> {
    return await this.inventoryItemsRepository.find();
  }

  async createNewItem(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
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
