import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { CreateInventoryDto } from './createInventory.dto';
import { extractPublicIdFromUrl } from 'src/common/cloudinary/cloudinary.helpers';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { InventoryTag } from 'src/inventoryTags/inventoryTag.entity';
import { InventoryUser } from 'src/inventoryUsers/inventoryUser.entity';
import { InventoryUserRoles } from 'src/inventoryUsers/inventoryUserRoles.enum';
import { UserRoles } from 'src/users/userRoles.enum';
import { ReqUser } from 'src/interfaces/ReqUser';

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
  ) {}

  async getAllInventories(): Promise<Inventory[]> {
    return await this.inventoriesRepository.find();
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

  async getInventoryById(inventoryId: number): Promise<Inventory> {
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
    return inventory;
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
