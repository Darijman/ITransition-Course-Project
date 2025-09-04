import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryComment } from './inventoryComment.entity';
import { CreateInventoryCommentDto } from './createInventoryComment.dto';
import { Inventory } from 'src/inventories/inventory.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { UserRoles } from 'src/users/userRoles.enum';
import { InventoryUserRoles } from 'src/inventoryUsers/inventoryUserRoles.enum';
import { ReqUser } from 'src/interfaces/ReqUser';
import { InventoriesGateway } from 'src/inventories/inventories.gateway';
import { UpdateInventoryCommentDto } from './updateInventoryComment.dto';

@Injectable()
export class InventoryCommentsService {
  constructor(
    @InjectRepository(InventoryComment)
    private readonly inventoryCommentsRepository: Repository<InventoryComment>,

    @InjectRepository(Inventory)
    private readonly inventoriesRepository: Repository<Inventory>,

    @InjectRepository(InventoryUser)
    private readonly inventoryUsersRepository: Repository<InventoryUser>,

    private readonly inventoriesGateway: InventoriesGateway,
  ) {}

  async getAllInventoryComments(): Promise<InventoryComment[]> {
    return await this.inventoryCommentsRepository.find();
  }

  async getAllCommentsByInventoryId(inventoryId: number, user: ReqUser): Promise<InventoryComment[]> {
    if (!inventoryId || isNaN(inventoryId)) {
      throw new BadRequestException({ error: 'Invalid Inventory ID!' });
    }

    const inventory = await this.inventoriesRepository.findOne({ where: { id: inventoryId } });
    if (!inventory) {
      throw new NotFoundException({ error: 'Inventory not found!' });
    }

    if (user.role !== UserRoles.ADMIN) {
      const inventoryUser = await this.inventoryUsersRepository.findOne({ where: { inventoryId, userId: user.id } });
      if (!inventoryUser) {
        throw new ForbiddenException({ error: 'You do not have access to this inventory comments!' });
      }
    }
    return await this.inventoryCommentsRepository.find({ where: { inventoryId } });
  }

  async createNewInventoryComment(createInventoryCommentDto: CreateInventoryCommentDto, user: ReqUser): Promise<InventoryComment> {
    const inventory = await this.inventoriesRepository.findOne({ where: { id: createInventoryCommentDto.inventoryId } });
    if (!inventory) {
      throw new NotFoundException({ error: 'Inventory not found!' });
    }

    const { inventoryId } = createInventoryCommentDto;

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
      throw new ForbiddenException({ error: 'You do not have access to this inventory!' });
    }

    const inventoryComment = this.inventoryCommentsRepository.create({ ...createInventoryCommentDto, authorId: inventoryUser.id });
    const savedComment = await this.inventoryCommentsRepository.save(inventoryComment);

    const fullComment = await this.inventoryCommentsRepository.findOne({
      where: { id: savedComment.id },
      relations: ['author', 'author.user'],
    });

    this.inventoriesGateway.server.to(inventoryId.toString()).emit('inventory-comment-created', fullComment);
    return savedComment;
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

  async deleteInventoryCommentById(commentId: number, user: ReqUser): Promise<{ success: boolean }> {
    if (!commentId || isNaN(commentId)) {
      throw new BadRequestException({ error: 'Invalid Inventory Comment ID!' });
    }

    const inventoryComment = await this.inventoryCommentsRepository.findOne({ where: { id: commentId } });
    if (!inventoryComment) {
      throw new NotFoundException({ error: 'Inventory Comment not found!' });
    }

    const { inventoryId } = inventoryComment;

    if (user.role === UserRoles.ADMIN) {
      await this.inventoryCommentsRepository.delete(commentId);
      this.inventoriesGateway.server.to(inventoryId.toString()).emit('inventory-comment-deleted', { commentId });
      return { success: true };
    }

    const inventoryUser = await this.inventoryUsersRepository.findOneBy({ userId: user.id, inventoryId: inventoryComment.inventoryId });
    if (!inventoryUser) {
      throw new ForbiddenException({ error: 'You do not have access to this inventory!' });
    }

    const isCommentOwner = inventoryComment.authorId === inventoryUser.userId;
    const hasInventoryRights = inventoryUser.role === InventoryUserRoles.CREATOR || inventoryUser.role === InventoryUserRoles.EDITOR;
    if (!isCommentOwner && !hasInventoryRights) {
      throw new ForbiddenException({ error: 'You do not have permission to delete this comment!' });
    }

    await this.inventoryCommentsRepository.delete(commentId);
    this.inventoriesGateway.server.to(inventoryId.toString()).emit('inventory-comment-deleted', { commentId });
    return { success: true };
  }

  async editInventoryCommentById(commentId: number, updateDto: UpdateInventoryCommentDto, user: ReqUser): Promise<InventoryComment> {
    if (!commentId || isNaN(commentId)) {
      throw new BadRequestException({ error: 'Invalid Inventory Comment ID!' });
    }

    const inventoryComment = await this.inventoryCommentsRepository.findOne({ where: { id: commentId } });
    if (!inventoryComment) {
      throw new NotFoundException({ error: 'Inventory Comment not found!' });
    }

    if (inventoryComment.text.trim() === updateDto.text.trim()) {
      throw new BadRequestException({ error: 'You did not change comment!' });
    }

    const { inventoryId } = inventoryComment;

    if (user.role === UserRoles.ADMIN) {
      inventoryComment.text = updateDto.text;
      const updated = await this.inventoryCommentsRepository.save(inventoryComment);

      const fullComment = await this.inventoryCommentsRepository.findOne({
        where: { id: updated.id },
        relations: ['author', 'author.user'],
      });

      if (!fullComment) {
        throw new BadRequestException({ error: 'Failed to find comment with relations!' });
      }

      this.inventoriesGateway.server.to(inventoryId.toString()).emit('inventory-comment-updated', fullComment);
      return fullComment;
    }

    const inventoryUser = await this.inventoryUsersRepository.findOneBy({
      userId: user.id,
      inventoryId,
    });

    if (!inventoryUser) {
      throw new ForbiddenException({ error: 'You do not have access to this inventory!' });
    }

    const isCommentOwner = inventoryComment.authorId === inventoryUser.id;
    const hasInventoryRights = inventoryUser.role === InventoryUserRoles.CREATOR || inventoryUser.role === InventoryUserRoles.EDITOR;

    if (!isCommentOwner && !hasInventoryRights) {
      throw new ForbiddenException({ error: 'You do not have permission to edit this comment!' });
    }

    inventoryComment.text = updateDto.text;
    const updated = await this.inventoryCommentsRepository.save(inventoryComment);

    const fullComment = await this.inventoryCommentsRepository.findOne({
      where: { id: updated.id },
      relations: ['author', 'author.user'],
    });
    if (!fullComment) {
      throw new BadRequestException({ error: 'Failed to find comment with relations!' });
    }

    this.inventoriesGateway.server.to(inventoryId.toString()).emit('inventory-comment-updated', fullComment);
    return fullComment;
  }
}
