import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItemLike } from './inventoryItemLike.entity';
import { CreateInventoryItemLikeDto } from './createInventoryItemLike.dto';

@Injectable()
export class InventoryItemLikesService {
  constructor(
    @InjectRepository(InventoryItemLike)
    private readonly inventoryItemLikesRepository: Repository<InventoryItemLike>,
  ) {}

  async getAllLikes(): Promise<InventoryItemLike[]> {
    return await this.inventoryItemLikesRepository.find();
  }

  async createNewLike(createInventoryItemLikeDto: CreateInventoryItemLikeDto): Promise<InventoryItemLike> {
    const { userId, itemId } = createInventoryItemLikeDto;

    const existingLike = await this.inventoryItemLikesRepository.findOne({
      where: { itemId: itemId, userId },
    });

    if (existingLike) {
      throw new BadRequestException({ error: 'User already liked this item!' });
    }

    const like = this.inventoryItemLikesRepository.create(createInventoryItemLikeDto);
    return await this.inventoryItemLikesRepository.save(like);
  }

  async getLikeById(likeId: number): Promise<InventoryItemLike> {
    if (!likeId || isNaN(likeId)) {
      throw new BadRequestException({ error: 'Invalid like ID!' });
    }

    const like = await this.inventoryItemLikesRepository.findOne({ where: { id: likeId } });
    if (!like) {
      throw new NotFoundException({ error: 'Like not found!' });
    }
    return like;
  }

  async deleteLikeById(likeId: number): Promise<{ success: boolean }> {
    if (!likeId || isNaN(likeId)) {
      throw new BadRequestException({ error: 'Invalid like ID!' });
    }

    const like = await this.inventoryItemLikesRepository.findOne({ where: { id: likeId } });
    if (!like) {
      throw new NotFoundException({ error: 'Like not found!' });
    }

    await this.inventoryItemLikesRepository.delete(likeId);
    return { success: true };
  }
}
