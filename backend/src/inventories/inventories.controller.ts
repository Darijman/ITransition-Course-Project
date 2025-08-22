import { Controller, Get, Param, UseInterceptors, Delete, UseGuards, Post, UploadedFile, Req, Body, Patch, Query } from '@nestjs/common';
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
import { InventoryStatuses } from './inventoryStatuses.enum';

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
  async getAllPublicInventories(
    @Req() req: Request,
    @Query('searchValue') searchValue?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: InventoryStatuses | 'ALL',
  ): Promise<Inventory[]> {
    const query = {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      status,
      searchValue,
    };

    return this.inventoriesService.getAllPublicInventories(req.user, query);
  }

  @UseGuards(OptionalAuthGuard)
  @Get('/public/top')
  async getTopPublicInventories(@Req() req: Request, @Query('limit') limit?: string): Promise<Inventory[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 5;
    return this.inventoriesService.getTopPublicInventories(req.user, parsedLimit);
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

  @UseGuards(OptionalAuthGuard)
  @Get(':inventoryId')
  async getInventoryById(
    @Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number,
    @Req() req: Request,
  ): Promise<Inventory> {
    return await this.inventoriesService.getInventoryById(inventoryId, req.user);
  }

  @UseGuards(AuthGuard)
  @Patch(':inventoryId/status')
  async updateInventoryStatus(
    @Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number,
    @Body() body: { status: InventoryStatuses },
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    return await this.inventoriesService.updateInventoryStatus(inventoryId, body.status, req.user);
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
