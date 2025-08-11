import { Controller, Get, Param, UseInterceptors, Delete, UseGuards, Post, Body } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { InventoryTagsService } from './inventoryTags.service';
import { InventoryTag } from './inventoryTag.entity';
import { CreateInventoryTagDto } from './createInventoryTag.dto';

@Controller('inventory_tags')
@UseInterceptors(ClassSerializerInterceptor)
export class InventoryTagsController {
  constructor(private readonly inventoryTagsService: InventoryTagsService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAllTags(): Promise<InventoryTag[]> {
    return await this.inventoryTagsService.getAllTags();
  }

  @UseGuards(AuthGuard)
  @Get(':tagId')
  async getTagByID(@Param('tagId', new CustomParseIntPipe('Tag ID')) tagId: number): Promise<InventoryTag> {
    return await this.inventoryTagsService.getTagByID(tagId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createNewTag(@Body() createInventoryTagDto: CreateInventoryTagDto): Promise<InventoryTag> {
    return await this.inventoryTagsService.createNewTag(createInventoryTagDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':tagId')
  async deleteTagById(@Param('tagId', new CustomParseIntPipe('Tag ID')) tagId: number): Promise<{ success: boolean }> {
    return await this.inventoryTagsService.deleteTagById(tagId);
  }
}
