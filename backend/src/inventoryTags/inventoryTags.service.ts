import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryTag } from './inventoryTag.entity';
import { CreateInventoryTagDto } from './createInventoryTag.dto';

@Injectable()
export class InventoryTagsService {
  constructor(
    @InjectRepository(InventoryTag)
    private readonly inventoryTagsRepository: Repository<InventoryTag>,
  ) {}

  async getAllTags(): Promise<InventoryTag[]> {
    return await this.inventoryTagsRepository.find();
  }

  async createNewTag(createInventoryTagDto: CreateInventoryTagDto): Promise<InventoryTag> {
    const inventoryTag = this.inventoryTagsRepository.create(createInventoryTagDto);
    return await this.inventoryTagsRepository.save(inventoryTag);
  }

  async getTagByID(tagId: number): Promise<InventoryTag> {
    if (!tagId || isNaN(tagId)) {
      throw new BadRequestException({ error: 'Invalid tag ID!' });
    }

    const inventoryTag = await this.inventoryTagsRepository.findOne({ where: { id: tagId } });
    if (!inventoryTag) {
      throw new NotFoundException({ error: 'Tag not found!' });
    }
    return inventoryTag;
  }

  async deleteTagById(tagId: number): Promise<{ success: boolean }> {
    if (!tagId || isNaN(tagId)) {
      throw new BadRequestException({ error: 'Invalid tag ID!' });
    }

    const inventoryTag = await this.inventoryTagsRepository.findOne({ where: { id: tagId } });
    if (!inventoryTag) {
      throw new NotFoundException({ error: 'Tag not found!' });
    }

    await this.inventoryTagsRepository.delete(tagId);
    return { success: true };
  }
}
