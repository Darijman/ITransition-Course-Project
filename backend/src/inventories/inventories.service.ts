import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { CreateInventoryDto } from './createInventory.dto';
import { extractPublicIdFromUrl } from 'src/common/cloudinary/cloudinary.helpers';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { InventoryTag } from 'src/inventoryTags/inventoryTag.entity';

@Injectable()
export class InventoriesService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoriesRepository: Repository<Inventory>,
    private readonly cloudinaryService: CloudinaryService,

    @InjectRepository(InventoryTag)
    private readonly tagsRepository: Repository<InventoryTag>,
  ) {}

  async getAllInventories(): Promise<Inventory[]> {
    return await this.inventoriesRepository.find();
  }

  async createNewInventory(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const tags = await this.tagsRepository.findBy({ id: In(createInventoryDto.tagIds) });
    const inventory = this.inventoriesRepository.create({
      ...createInventoryDto,
      tags,
    });
    return await this.inventoriesRepository.save(inventory);
  }

  async getInventoryById(inventoryId: number): Promise<Inventory> {
    if (!inventoryId || isNaN(inventoryId)) {
      throw new BadRequestException({ error: 'Invalid Inventory ID!' });
    }

    const inventory = await this.inventoriesRepository.findOne({ where: { id: inventoryId } });
    if (!inventory) {
      throw new NotFoundException({ error: 'Inventory not found!' });
    }
    return inventory;
  }

  async deleteInventoryById(inventoryId: number): Promise<{ success: boolean }> {
    if (!inventoryId || isNaN(inventoryId)) {
      throw new BadRequestException({ error: 'Invalid Inventory ID!' });
    }

    const inventory = await this.inventoriesRepository.findOne({ where: { id: inventoryId } });
    if (!inventory) {
      throw new NotFoundException({ error: 'Inventory not found!' });
    }

    if (inventory.imageUrl) {
      const publicId = extractPublicIdFromUrl(inventory.imageUrl);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    await this.inventoriesRepository.delete(inventoryId);
    return { success: true };
  }
}
