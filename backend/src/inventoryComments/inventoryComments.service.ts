import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryComment } from './inventoryComment.entity';
import { CreateInventoryCommentDto } from './createInventoryComment.dto';
import { InventoriesService } from 'src/inventories/inventories.service';

@Injectable()
export class InventoryCommentsService {
  constructor(
    @InjectRepository(InventoryComment)
    private readonly inventoryCommentsRepository: Repository<InventoryComment>,
    private readonly inventoriesService: InventoriesService,
  ) {}

  async getAllInventoryComments(): Promise<InventoryComment[]> {
    return await this.inventoryCommentsRepository.find();
  }

  async getAllCommentsByInventoryId(inventoryId: number): Promise<InventoryComment[]> {
    if (!inventoryId || isNaN(inventoryId)) {
      throw new BadRequestException({ error: 'Invalid Inventory ID!' });
    }

    await this.inventoriesService.getInventoryById(inventoryId);
    return await this.inventoryCommentsRepository.find({ where: { inventoryId } });
  }

  async createNewInventoryComment(createInventoryCommentDto: CreateInventoryCommentDto): Promise<InventoryComment> {
    const inventoryComment = this.inventoryCommentsRepository.create(createInventoryCommentDto);
    return await this.inventoryCommentsRepository.save(inventoryComment);
  }

  async getInventoryCommentByID(commentId: number): Promise<InventoryComment> {
    if (!commentId || isNaN(commentId)) {
      throw new BadRequestException({ error: 'Invalid Inventory Comment ID!' });
    }

    const inventoryComment = await this.inventoryCommentsRepository.findOne({ where: { id: commentId } });
    if (!inventoryComment) {
      throw new NotFoundException({ error: 'Inventory Comment not found!' });
    }
    return inventoryComment;
  }

  async deleteInventoryCommentById(commentId: number): Promise<{ success: boolean }> {
    if (!commentId || isNaN(commentId)) {
      throw new BadRequestException({ error: 'Invalid Inventory Comment ID!' });
    }

    const inventoryComment = await this.inventoryCommentsRepository.findOne({ where: { id: commentId } });
    if (!inventoryComment) {
      throw new NotFoundException({ error: 'Inventory Comment not found!' });
    }

    await this.inventoryCommentsRepository.delete(commentId);
    return { success: true };
  }
}
