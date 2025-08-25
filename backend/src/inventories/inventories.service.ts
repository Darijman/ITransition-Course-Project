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

    private readonly inventoriesGateway: InventoriesGateway,
  ) {}

  async getAllInventories(): Promise<Inventory[]> {
    return await this.inventoriesRepository.find();
  }

  async getInventoriesForUser(userId: number, query: Query = {}): Promise<Inventory[]> {
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

    qb.take(limit).skip(offset).orderBy('inventory.createdAt', 'DESC');
    const userInventories = await qb.getMany();
    return userInventories.map((iu) => iu.inventory);
  }

  async getAllPublicInventories(user?: ReqUser, query: Query = {}): Promise<Inventory[]> {
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
      .leftJoinAndSelect('inventory.tags', 'tags');

    if (user?.role !== UserRoles.ADMIN) {
      qb.where(
        new Brackets((qb1) => {
          if (!user) {
            qb1.where('inventory.status = :publicStatus', { publicStatus: InventoryStatuses.PUBLIC });
          } else if (status === 'ALL') {
            qb1.where('inventory.status = :publicStatus OR inventory.creatorId = :userId', {
              publicStatus: InventoryStatuses.PUBLIC,
              userId: user.id,
            });
          } else {
            qb1.where('inventory.status = :status OR inventory.creatorId = :userId', {
              status,
              userId: user.id,
            });
          }
        }),
      );
    } else if (status !== 'ALL') {
      qb.where('inventory.status = :status', { status });
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
    const inventories = await this.inventoriesRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.category', 'category')
      .leftJoinAndSelect('inventory.creator', 'creator')
      .leftJoinAndSelect('inventory.tags', 'tags')
      .leftJoinAndSelect('inventory.items', 'items')
      .loadRelationCountAndMap('inventory._itemsCount', 'inventory.items')
      .getMany();

    let filtered: Inventory[];

    if (user?.role === UserRoles.ADMIN) {
      filtered = inventories.sort((a, b) => ((b as any)._itemsCount ?? 0) - ((a as any)._itemsCount ?? 0)).slice(0, limit);
    } else {
      filtered = inventories
        .filter((inv) => inv.status === InventoryStatuses.PUBLIC || (user && inv.creatorId === user.id))
        .sort((a, b) => ((b as any)._itemsCount ?? 0) - ((a as any)._itemsCount ?? 0))
        .slice(0, limit);
    }

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

    const inventory = await this.inventoriesRepository.findOne({
      where: { id: inventoryId },
      relations: ['tags', 'inventoryUsers', 'inventoryUsers.user', 'comments', 'comments.author', 'items', 'category', 'creator'],
    });
    if (!inventory) {
      throw new NotFoundException({ error: 'Inventory not found!' });
    }

    if (reqUser?.role === UserRoles.ADMIN) {
      return inventory;
    }

    if (inventory.status === InventoryStatuses.PUBLIC) {
      return inventory;
    }

    if (reqUser) {
      const userHasAccess = inventory.inventoryUsers.some((iu) => iu.userId === reqUser.id);
      if (userHasAccess) {
        return inventory;
      }
    }

    throw new ForbiddenException({ error: 'You do not have permission to access this inventory!' });
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
