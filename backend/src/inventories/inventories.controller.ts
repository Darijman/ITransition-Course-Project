import { Controller, Get, Param, UseInterceptors, Delete, UseGuards, Post, UploadedFile, Req, Body, Patch } from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { Inventory } from './inventory.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Express } from 'express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { CreateInventoryDto } from './createInventory.dto';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { InventoryOwnerOrAdminGuard } from 'src/guards/inventoryOwnerOrAdmin.guard';
import { Admin } from 'src/auth/auth.decorators';
import { OptionalAuthGuard } from 'src/guards/optionalAuth.guard';

@Controller('inventories')
@UseInterceptors(ClassSerializerInterceptor)
export class InventoriesController {
  constructor(
    private readonly inventoriesService: InventoriesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Admin()
  @Get()
  async getAllInventories(): Promise<Inventory[]> {
    return await this.inventoriesService.getAllInventories();
  }

  @UseGuards(OptionalAuthGuard)
  @Get('/public')
  async getAllPublicInventories(@Req() req: Request): Promise<Inventory[]> {
    const userId: number | undefined = req.user?.id;
    return this.inventoriesService.getAllPublicInventories(userId);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  async createNewInventory(
    @Body() createInventoryDto: CreateInventoryDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: Request,
  ): Promise<Inventory> {
    const uploadResult = await this.cloudinaryService.uploadImage(image, 'inventories');
    const newInventoryData = {
      ...createInventoryDto,
      creatorId: req.user.id,
      imageUrl: uploadResult.secure_url,
    };
    return await this.inventoriesService.createNewInventory(newInventoryData, req.user);
  }

  @UseGuards(AuthGuard, InventoryOwnerOrAdminGuard)
  @Get(':inventoryId')
  async getInventoryById(@Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number): Promise<Inventory> {
    return await this.inventoriesService.getInventoryById(inventoryId);
  }

  @UseGuards(AuthGuard)
  @Patch(':inventoryId/visibility')
  async updateInventoryVisibility(
    @Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number,
    @Body() body: { isPublic: boolean },
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    return await this.inventoriesService.updateInventoryVisibility(inventoryId, body.isPublic, req.user);
  }

  @UseGuards(AuthGuard, InventoryOwnerOrAdminGuard)
  @Delete(':inventoryId')
  async deleteInventoryById(
    @Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    return await this.inventoriesService.deleteInventoryById(inventoryId, req.user);
  }
}
