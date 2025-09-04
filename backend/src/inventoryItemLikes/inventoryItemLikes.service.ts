import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItemLike } from './inventoryItemLike.entity';
import { CreateInventoryItemLikeDto } from './createInventoryItemLike.dto';
import { ReqUser } from 'src/interfaces/ReqUser';
import { InventoryItem } from 'src/inventoryItems/inventoryItem.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { UserRoles } from 'src/users/userRoles.enum';
import { InventoryUserRoles } from 'src/inventoryUsers/inventoryUserRoles.enum';

@Injectable()
export class InventoryItemLikesService {
  constructor(
    @InjectRepository(InventoryItemLike)
    private readonly inventoryItemLikesRepository: Repository<InventoryItemLike>,

    @InjectRepository(InventoryItem)
    private readonly inventoryItemsRepository: Repository<InventoryItem>,

    @InjectRepository(InventoryUser)
    private readonly inventoryUsersRepository: Repository<InventoryUser>,
  ) {}

  async getAllLikes(): Promise<InventoryItemLike[]> {
    return await this.inventoryItemLikesRepository.find({
      relations: ['inventoryUser'],
    });
  }

  async createNewLike(createInventoryItemLikeDto: CreateInventoryItemLikeDto, user: ReqUser): Promise<InventoryItemLike | null> {
    const { itemId } = createInventoryItemLikeDto;

    const item = await this.inventoryItemsRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException({ error: 'Item not found!' });
    }

    let inventoryUser = await this.inventoryUsersRepository.findOne({
      where: { userId: user.id, inventoryId: item.inventoryId },
      relations: ['user'],
    });

    if (!inventoryUser && user.role === UserRoles.ADMIN) {
      inventoryUser = this.inventoryUsersRepository.create({
        userId: user.id,
        inventoryId: item.inventoryId,
        role: InventoryUserRoles.ADMIN,
        name: user.name,
      });
      await this.inventoryUsersRepository.save(inventoryUser);
    }

    if (!inventoryUser) {
      throw new ForbiddenException({ error: 'You do not have access to this inventory!' });
    }

    const existingLike = await this.inventoryItemLikesRepository.findOne({
      where: { itemId, inventoryUserId: inventoryUser.id },
    });
    if (existingLike) {
      throw new BadRequestException({ error: 'User already liked this item!' });
    }

    const like = this.inventoryItemLikesRepository.create({ itemId, inventoryUserId: inventoryUser.id });
    await this.inventoryItemLikesRepository.save(like);

    return this.inventoryItemLikesRepository.findOne({
      where: { id: like.id },
      relations: ['inventoryUser', 'inventoryUser.user'],
    });
  }

  async getLikeById(likeId: number): Promise<InventoryItemLike> {
    if (!likeId || isNaN(likeId)) {
      throw new BadRequestException({ error: 'Invalid like ID!' });
    }

    const like = await this.inventoryItemLikesRepository.findOne({
      where: { id: likeId },
      relations: ['inventoryUser'],
    });
    if (!like) {
      throw new NotFoundException({ error: 'Like not found!' });
    }
    return like;
  }

  async deleteLikeById(likeId: number, user: ReqUser): Promise<{ success: boolean }> {
    if (!likeId || isNaN(likeId)) {
      throw new BadRequestException({ error: 'Invalid like ID!' });
    }

    const like = await this.inventoryItemLikesRepository.findOne({
      where: { id: likeId },
      relations: ['inventoryUser'],
    });
    if (!like) {
      throw new NotFoundException({ error: 'Like not found!' });
    }

    if (like.inventoryUser.userId !== user.id) {
      throw new ForbiddenException({ error: 'You can only delete your own likes!' });
    }

    await this.inventoryItemLikesRepository.delete(likeId);
    return { success: true };
  }
}
