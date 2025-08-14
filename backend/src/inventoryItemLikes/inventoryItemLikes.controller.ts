import { Controller, Get, Param, UseInterceptors, Delete, Post, Body, UseGuards, Req } from '@nestjs/common';
import { InventoryItemLike } from './inventoryItemLike.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { Admin } from 'src/auth/auth.decorators';
import { CreateInventoryItemLikeDto } from './createInventoryItemLike.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { InventoryItemLikesService } from './inventoryItemLikes.service';
import { Request } from 'express';

@Controller('inventory_item_likes')
@UseInterceptors(ClassSerializerInterceptor)
export class InventoryItemLikesController {
  constructor(private readonly inventoryItemLikesService: InventoryItemLikesService) {}

  @Admin()
  @Get()
  async getAllLikes(): Promise<InventoryItemLike[]> {
    return await this.inventoryItemLikesService.getAllLikes();
  }

  @UseGuards(AuthGuard)
  @Post()
  async createNewLike(@Body() createInventoryItemLikeDto: CreateInventoryItemLikeDto, @Req() req: Request): Promise<InventoryItemLike> {
    return await this.inventoryItemLikesService.createNewLike(createInventoryItemLikeDto, req.user);
  }

  @Admin()
  @Get(':inventoryItemLikeId')
  async getLikeById(
    @Param('inventoryItemLikeId', new CustomParseIntPipe('Like ID')) inventoryItemLikeId: number,
  ): Promise<InventoryItemLike> {
    return await this.inventoryItemLikesService.getLikeById(inventoryItemLikeId);
  }

  @UseGuards(AuthGuard)
  @Delete(':inventoryItemLikeId')
  async deleteLikeById(
    @Param('inventoryItemLikeId', new CustomParseIntPipe('Like ID')) inventoryItemLikeId: number,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    return await this.inventoryItemLikesService.deleteLikeById(inventoryItemLikeId, req.user);
  }
}
