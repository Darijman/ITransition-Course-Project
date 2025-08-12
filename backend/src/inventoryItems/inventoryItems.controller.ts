import { Controller, Get, Param, UseInterceptors, Delete, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryItem } from './inventoryItem.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { Admin } from 'src/auth/auth.decorators';
import { CreateInventoryItemDto } from './createInventoryItem.dto';
import { InventoryItemsService } from './inventoryItems.service';
import { AuthGuard } from 'src/auth/auth.guard';

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
  @Post()
  async createNewItem(@Body() createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    return await this.inventoryItemsService.createNewItem(createInventoryItemDto);
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
