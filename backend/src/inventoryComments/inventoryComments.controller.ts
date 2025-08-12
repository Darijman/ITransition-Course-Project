import { Controller, Get, Param, UseInterceptors, Delete, Post, Body, UseGuards } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { InventoryCommentsService } from './inventoryComments.service';
import { InventoryComment } from './inventoryComment.entity';
import { CreateInventoryCommentDto } from './createInventoryComment.dto';
import { Admin } from 'src/auth/auth.decorators';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('inventory_comments')
@UseInterceptors(ClassSerializerInterceptor)
export class InventoryCommentsController {
  constructor(private readonly inventoryCommentsService: InventoryCommentsService) {}

  @Admin()
  @Get()
  async getAllInventoryComments(): Promise<InventoryComment[]> {
    return await this.inventoryCommentsService.getAllInventoryComments();
  }

  @UseGuards(AuthGuard)
  @Get('/inventory/inventoryId')
  async getAllCommentsByInventoryId(
    @Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number,
  ): Promise<InventoryComment[]> {
    return await this.inventoryCommentsService.getAllCommentsByInventoryId(inventoryId);
  }

  @Admin()
  @Get(':commentId')
  async getInventoryCommentByID(
    @Param('commentId', new CustomParseIntPipe('Inventory Comment ID')) commentId: number,
  ): Promise<InventoryComment> {
    return await this.inventoryCommentsService.getInventoryCommentByID(commentId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createNewInventoryComment(@Body() createInventoryCommentDto: CreateInventoryCommentDto): Promise<InventoryComment> {
    return await this.inventoryCommentsService.createNewInventoryComment(createInventoryCommentDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':commentId')
  async deleteInventoryCommentById(
    @Param('commentId', new CustomParseIntPipe('Inventory Comment ID')) commentId: number,
  ): Promise<{ success: boolean }> {
    return await this.inventoryCommentsService.deleteInventoryCommentById(commentId);
  }
}
