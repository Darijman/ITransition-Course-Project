import { Controller, Get, Param, UseInterceptors, Delete, UseGuards, Post, UploadedFile, Req, Body } from '@nestjs/common';
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
import { Public } from 'src/auth/auth.decorators';

@Controller('inventories')
@UseInterceptors(ClassSerializerInterceptor)
export class InventoriesController {
  constructor(
    private readonly inventoriesService: InventoriesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Public()
  @Get()
  async getAllInventories(): Promise<Inventory[]> {
    return await this.inventoriesService.getAllInventories();
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

  @UseGuards(AuthGuard, InventoryOwnerOrAdminGuard)
  @Delete(':inventoryId')
  async deleteInventoryById(
    @Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number,
  ): Promise<{ success: boolean }> {
    return await this.inventoriesService.deleteInventoryById(inventoryId);
  }
}
