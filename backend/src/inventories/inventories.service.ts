import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { CreateInventoryDto } from './createInventory.dto';
import { extractPublicIdFromUrl } from 'src/common/cloudinary/cloudinary.helpers';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { InventoryTag } from 'src/inventoryTags/inventoryTag.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { InventoryUserRoles } from 'src/inventoryUsers/inventoryUserRoles.enum';
import { UserRoles } from 'src/users/userRoles.enum';
import { ReqUser } from 'src/interfaces/ReqUser';
import { InventoryStatuses } from './inventoryStatuses.enum';
import { InventoriesGateway } from './inventories.gateway';
import { InventoryInvite } from 'src/inventoryInvites/inventoryInvite.entity';

interface Query {
  limit?: number;
  offset?: number;
  status?: InventoryStatuses | 'ALL';
  searchValue?: string;
}

@Injectable()
export class InventoriesService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoriesRepository: Repository<Inventory>,
    private readonly cloudinaryService: CloudinaryService,

    @InjectRepository(InventoryTag)
    private readonly tagsRepository: Repository<InventoryTag>,

    @InjectRepository(InventoryUser)
    private readonly inventoryUsersRepository: Repository<InventoryUser>,

    @InjectRepository(InventoryInvite)
    private readonly inventoryInvitesRepository: Repository<InventoryInvite>,

    private readonly inventoriesGateway: InventoriesGateway,
  ) {}

  async getAllInventories(): Promise<Inventory[]> {
    return await this.inventoriesRepository.find();
  }

  async getUserInventories(userId: number, query: Query = {}, reqUser: ReqUser): Promise<(Inventory & { joinedAt: Date })[]> {
    if (userId !== reqUser.id && reqUser.role !== UserRoles.ADMIN) {
      throw new ForbiddenException({ error: 'You do not have permission!' });
    }

    const { offset = 0, limit = 10, status = 'ALL', searchValue } = query;

    const qb = this.inventoryUsersRepository
      .createQueryBuilder('iu')
      .leftJoinAndSelect('iu.inventory', 'inventory')
      .leftJoinAndSelect('inventory.creator', 'creator')
      .leftJoinAndSelect('inventory.items', 'items')
      .leftJoinAndSelect('inventory.tags', 'tags')
      .leftJoinAndSelect('inventory.category', 'category')
      .where('iu.userId = :userId', { userId });

    if (status !== 'ALL') {
      qb.andWhere('inventory.status = :status', { status });
    }

    if (searchValue) {
      const search = `%${searchValue.toLowerCase()}%`;
      qb.andWhere(`(LOWER(inventory.title) LIKE :search OR LOWER(creator.name) LIKE :search OR LOWER(category.title) LIKE :search)`, {
        search,
      });
    }

    qb.take(limit).skip(offset).orderBy('iu.createdAt', 'DESC');

    const userInventories = await qb.getMany();
    return userInventories.map((iu) => ({
      ...iu.inventory,
      joinedAt: iu.createdAt,
    }));
  }

  async getAllPublicInventories(reqUser?: ReqUser, query: Query = {}): Promise<Inventory[]> {
    const { limit = 10, offset = 0, status = 'ALL', searchValue } = query;

    if (isNaN(limit) || isNaN(offset)) {
      throw new BadRequestException({ error: 'Limit and offset must be valid numbers!' });
    }

    if (limit < 0 || offset < 0) {
      throw new BadRequestException({ error: 'Negative numbers are not allowed!' });
    }

    const qb = this.inventoriesRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.creator', 'creator')
      .leftJoinAndSelect('inventory.category', 'category')
      .leftJoinAndSelect('inventory.items', 'items')
      .leftJoinAndSelect('inventory.tags', 'tags')
      .leftJoinAndSelect('inventory.inventoryUsers', 'inventoryUsers');

    if (reqUser?.role !== UserRoles.ADMIN) {
      if (!reqUser) {
        qb.where('inventory.status = :publicStatus', { publicStatus: InventoryStatuses.PUBLIC });
      } else {
        if (status === 'ALL') {
          qb.where('(inventory.status = :publicStatus OR inventory.creatorId = :userId OR inventoryUsers.userId = :userId)', {
            publicStatus: InventoryStatuses.PUBLIC,
            userId: reqUser.id,
          });
        } else if (status === InventoryStatuses.PUBLIC) {
          qb.where('inventory.status = :publicStatus', { publicStatus: InventoryStatuses.PUBLIC });
        } else if (status === InventoryStatuses.PRIVATE) {
          qb.where('(inventory.status = :status AND (inventory.creatorId = :userId OR inventoryUsers.userId = :userId))', {
            status: InventoryStatuses.PRIVATE,
            userId: reqUser.id,
          });
        } else {
          qb.where('inventory.status = :status AND inventory.creatorId = :userId', { status, userId: reqUser.id });
        }
      }
    } else {
      if (status !== 'ALL') {
        qb.where('inventory.status = :status', { status });
      }
    }

    if (searchValue) {
      const search = `%${searchValue.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((qb1) => {
          qb1
            .where('LOWER(inventory.title) LIKE :search', { search })
            .orWhere('LOWER(creator.name) LIKE :search', { search })
            .orWhere('LOWER(category.title) LIKE :search', { search })
            .orWhere(
              (qb2) => {
                const subQuery = qb2
                  .subQuery()
                  .select('itr.inventoryId')
                  .from('inventory_tags_relation', 'itr')
                  .leftJoin('inventory_tags', 't', 'itr.tagId = t.id')
                  .where('LOWER(t.title) LIKE :search')
                  .getQuery();
                return 'inventory.id IN ' + subQuery;
              },
              { search },
            );
        }),
      );
    }

    qb.orderBy('inventory.createdAt', 'DESC').take(limit).skip(offset).distinct(true);
    return qb.getMany();
  }

  async getTopPublicInventories(user?: ReqUser, limit: number = 5): Promise<Inventory[]> {
    const qb = this.inventoriesRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.category', 'category')
      .leftJoinAndSelect('inventory.creator', 'creator')
      .leftJoinAndSelect('inventory.tags', 'tags')
      .leftJoinAndSelect('inventory.items', 'items')
      .leftJoinAndSelect('inventory.inventoryUsers', 'inventoryUsers')
      .loadRelationCountAndMap('inventory._itemsCount', 'inventory.items');

    if (user?.role !== UserRoles.ADMIN) {
      qb.where('(inventory.status = :publicStatus OR inventory.creatorId = :userId OR inventoryUsers.userId = :userId)', {
        publicStatus: InventoryStatuses.PUBLIC,
        userId: user?.id,
      });
    }

    const inventories = await qb.getMany();

    const filtered = inventories.sort((a, b) => ((b as any)._itemsCount ?? 0) - ((a as any)._itemsCount ?? 0)).slice(0, limit);
    filtered.forEach((inv) => delete (inv as any)._itemsCount);
    return filtered;
  }

  async createNewInventory(createInventoryDto: CreateInventoryDto, user: { id: number; name: string; role: UserRoles }): Promise<Inventory> {
    const tags = await this.tagsRepository.findBy({ id: In(createInventoryDto.tagIds) });
    const inventory = this.inventoriesRepository.create({ ...createInventoryDto, tags });
    const savedInventory = await this.inventoriesRepository.save(inventory);

    const inventoryUserExists = await this.inventoryUsersRepository.findOneBy({
      inventoryId: savedInventory.id,
      userId: user.id,
    });

    if (!inventoryUserExists) {
      const inventoryUser = this.inventoryUsersRepository.create({
        inventoryId: savedInventory.id,
        userId: user.id,
        role: InventoryUserRoles.CREATOR,
        name: user.name,
      });

      await this.inventoryUsersRepository.save(inventoryUser);
    }
    return savedInventory;
  }

  async getInventoryById(inventoryId: number, reqUser?: ReqUser): Promise<Inventory> {
    if (!inventoryId || isNaN(inventoryId)) {
      throw new BadRequestException({ error: 'Invalid Inventory ID!' });
    }

    const inventory = await this.inventoriesRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.tags', 'tags')
      .leftJoinAndSelect('inventory.inventoryUsers', 'iu')
      .leftJoinAndSelect('iu.user', 'iuUser')
      .leftJoinAndSelect('inventory.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'author')
      .leftJoinAndSelect('author.user', 'authorUser')
      .leftJoinAndSelect('inventory.category', 'category')
      .leftJoinAndSelect('inventory.creator', 'creator')
      .where('inventory.id = :inventoryId', { inventoryId })
      .orderBy('comments.createdAt', 'ASC')
      .getOne();

    if (!inventory) {
      throw new NotFoundException({ error: 'Inventory not found!' });
    }

    if (reqUser?.role !== UserRoles.ADMIN) {
      if (inventory.status !== InventoryStatuses.PUBLIC) {
        const userHasAccess = reqUser && inventory.inventoryUsers.some((iu) => iu.userId === reqUser.id);
        if (!userHasAccess) {
          throw new ForbiddenException({ error: 'You do not have permission to access this inventory!' });
        }
      }
    }

    const invites = await this.inventoryInvitesRepository
      .createQueryBuilder('invite')
      .leftJoinAndSelect('invite.inviter', 'inviter')
      .leftJoinAndSelect('inviter.user', 'inviterUser')
      .leftJoinAndSelect('invite.invitee', 'invitee')
      .leftJoinAndSelect('invitee.user', 'inviteeUser')
      .leftJoinAndSelect('invite.inviteeUser', 'directInvitee')
      .where('invite.inventoryId = :inventoryId', { inventoryId })
      .orderBy('invite.createdAt', 'DESC')
      .take(10)
      .getMany();

    inventory.invites = invites;
    return inventory;
  }

  async updateInventoryStatus(inventoryId: number, status: InventoryStatuses, user: ReqUser) {
    const inventory = await this.inventoriesRepository.findOne({ where: { id: inventoryId } });
    if (!inventory) throw new NotFoundException({ error: 'Inventory not found!' });

    const isAdmin = user.role === UserRoles.ADMIN;
    const isCreator = (await this.inventoryUsersRepository.findOneBy({ userId: user.id, inventoryId }))?.role === InventoryUserRoles.CREATOR;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenException({ error: 'You do not have permission to change visibility!' });
    }

    await this.inventoriesRepository.update(inventoryId, { status });

    this.inventoriesGateway.server.to(inventoryId.toString()).emit('inventory-status-updated', {
      inventoryId,
      status,
      updatedBy: user.name,
    });

    return { success: true };
  }

  async deleteInventoryById(inventoryId: number, user: ReqUser): Promise<{ success: boolean }> {
    if (!inventoryId || isNaN(inventoryId)) {
      throw new BadRequestException({ error: 'Invalid Inventory ID!' });
    }

    const inventory = await this.inventoriesRepository.findOne({ where: { id: inventoryId } });
    if (!inventory) {
      throw new NotFoundException({ error: 'Inventory not found!' });
    }

    if (user.id !== inventory.creatorId && user.role !== UserRoles.ADMIN) {
      throw new ForbiddenException({ error: 'You do not have permission to delete this inventory!' });
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
