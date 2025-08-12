import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryComment } from './inventoryComment.entity';
import { CreateInventoryCommentDto } from './createInventoryComment.dto';
import { Inventory } from 'src/inventories/inventory.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { UserRoles } from 'src/users/userRoles.enum';
import { InventoryUserRoles } from 'src/inventoryUsers/inventoryUserRoles.enum';

@Injectable()
export class InventoryCommentsService {
  constructor(
    @InjectRepository(InventoryComment)
    private readonly inventoryCommentsRepository: Repository<InventoryComment>,

    @InjectRepository(Inventory)
    private readonly inventoriesRepository: Repository<Inventory>,

    @InjectRepository(InventoryUser)
    private readonly inventoryUsersRepository: Repository<InventoryUser>,
  ) {}

  async getAllInventoryComments(): Promise<InventoryComment[]> {
    return await this.inventoryCommentsRepository.find();
  }

  async getAllCommentsByInventoryId(inventoryId: number): Promise<InventoryComment[]> {
    if (!inventoryId || isNaN(inventoryId)) {
      throw new BadRequestException({ error: 'Invalid Inventory ID!' });
    }

    const inventory = await this.inventoriesRepository.findOne({ where: { id: inventoryId } });
    if (!inventory) {
      throw new NotFoundException({ error: 'Inventory not found!' });
    }
    return await this.inventoryCommentsRepository.find({ where: { inventoryId } });
  }

  async createNewInventoryComment(
    createInventoryCommentDto: CreateInventoryCommentDto,
    user: { id: number; name: string; role: UserRoles },
  ): Promise<InventoryComment> {
    const inventory = await this.inventoriesRepository.findOne({ where: { id: createInventoryCommentDto.inventoryId } });
    if (!inventory) {
      throw new NotFoundException({ error: 'Inventory not found!' });
    }

    let inventoryUser = await this.inventoryUsersRepository.findOne({
      where: { userId: user.id, inventoryId: inventory.id },
    });

    if (!inventoryUser && user.role === UserRoles.ADMIN) {
      inventoryUser = this.inventoryUsersRepository.create({
        userId: user.id,
        inventoryId: inventory.id,
        role: InventoryUserRoles.VIEWER,
        name: user.name,
      });
      await this.inventoryUsersRepository.save(inventoryUser);
    }

    if (!inventoryUser) {
      throw new ForbiddenException({ error: 'You are not a member of this inventory!' });
    }

    const inventoryComment = this.inventoryCommentsRepository.create({
      ...createInventoryCommentDto,
      authorId: inventoryUser.id,
    });
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
