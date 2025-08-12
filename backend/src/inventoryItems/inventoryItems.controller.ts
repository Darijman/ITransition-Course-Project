import { Controller, Get, Param, UseInterceptors, Delete, Post, Body, UseGuards, Req } from '@nestjs/common';
import { InventoryItem } from './inventoryItem.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { Admin } from 'src/auth/auth.decorators';
import { CreateInventoryItemDto } from './createInventoryItem.dto';
import { InventoryItemsService } from './inventoryItems.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';

@Controller('inventory_items')
@UseInterceptors(ClassSerializerInterceptor)
export class InventoryItemsController {
  constructor(private readonly inventoryItemsService: InventoryItemsService) {}

  @Admin()
  @Get()
  async getAllItems(): Promise<InventoryItem[]> {
    return await this.inventoryItemsService.getAllItems();
  }

  @UseGuards(AuthGuard)
  @Get('/inventory/:inventoryId')
  async getItemsByInventoryIdWithLikes(
    @Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number,
  ): Promise<InventoryItem[]> {
    return await this.inventoryItemsService.getItemsByInventoryIdWithLikes(inventoryId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createNewItem(@Body() createInventoryItemDto: CreateInventoryItemDto, @Req() req: Request): Promise<InventoryItem> {
    return await this.inventoryItemsService.createNewItem(createInventoryItemDto, req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get(':inventoryItemId')
  async getItemById(@Param('inventoryItemId', new CustomParseIntPipe('Item ID')) inventoryItemId: number): Promise<InventoryItem> {
    return await this.inventoryItemsService.getItemById(inventoryItemId);
  }

  @UseGuards(AuthGuard)
  @Delete(':inventoryItemId')
  async deleteItemById(@Param('inventoryItemId', new CustomParseIntPipe('Item ID')) inventoryItemId: number): Promise<{ success: boolean }> {
    return await this.inventoryItemsService.deleteItemById(inventoryItemId);
  }
}
