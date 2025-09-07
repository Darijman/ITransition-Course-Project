import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Delete,
  Post,
  Body,
  UseGuards,
  Req,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { InventoryItem } from './inventoryItem.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { Admin } from 'src/auth/auth.decorators';
import { CreateInventoryItemDto } from './createInventoryItem.dto';
import { InventoryItemsService } from './inventoryItems.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request, Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { OptionalAuthGuard } from 'src/guards/optionalAuth.guard';

@Controller('inventory_items')
@UseInterceptors(ClassSerializerInterceptor)
export class InventoryItemsController {
  constructor(
    private readonly inventoryItemsService: InventoryItemsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Admin()
  @UseGuards(AuthGuard)
  @Get()
  async getAllItems(): Promise<InventoryItem[]> {
    return await this.inventoryItemsService.getAllItems();
  }

  @UseGuards(OptionalAuthGuard)
  @Get('/inventory/:inventoryId')
  async getItemsByInventoryIdWithLikes(
    @Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('searchValue') searchValue?: string,
  ): Promise<InventoryItem[]> {
    const query = {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      searchValue,
    };

    return await this.inventoryItemsService.getItemsByInventoryIdWithLikes(inventoryId, query);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, callback) => {
        const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedMimes.includes(file.mimetype)) {
          return callback(new BadRequestException({ error: 'Only .png, .jpg, .jpeg files are allowed!' }), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
    }),
  )
  @Post()
  async createNewItem(
    @Body() createInventoryItemDto: CreateInventoryItemDto,
    @Req() req: Request,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<InventoryItem | null> {
    let imageUrl: string | undefined = undefined;
    if (image) {
      const uploadResult = await this.cloudinaryService.uploadImage(image, 'items');
      imageUrl = uploadResult.secure_url;
    }

    const newItemData = { ...createInventoryItemDto, imageUrl };
    return await this.inventoryItemsService.createNewItem(newItemData, req.user);
  }

  @UseGuards(AuthGuard)
  @Get(':inventoryItemId')
  async getItemById(@Param('inventoryItemId', new CustomParseIntPipe('Item ID')) inventoryItemId: number): Promise<InventoryItem> {
    return await this.inventoryItemsService.getItemById(inventoryItemId);
  }

  @UseGuards(AuthGuard)
  @Delete(':inventoryItemId')
  async deleteItemById(
    @Param('inventoryItemId', new CustomParseIntPipe('Item ID')) inventoryItemId: number,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    return await this.inventoryItemsService.deleteItemById(inventoryItemId, req.user);
  }

  @UseGuards(AuthGuard)
  @Delete()
  async deleteManyItems(@Body('itemIds') itemIds: number[], @Req() req: Request): Promise<{ success: boolean }> {
    return await this.inventoryItemsService.deleteManyItems(itemIds, req.user);
  }
}
