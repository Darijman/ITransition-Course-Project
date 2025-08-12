import { Controller, Get, Param, UseInterceptors, Delete, Post, Body } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { InventoryTagsService } from './inventoryTags.service';
import { InventoryTag } from './inventoryTag.entity';
import { CreateInventoryTagDto } from './createInventoryTag.dto';
import { Admin, Public } from 'src/auth/auth.decorators';

@Controller('inventory_tags')
@UseInterceptors(ClassSerializerInterceptor)
export class InventoryTagsController {
  constructor(private readonly inventoryTagsService: InventoryTagsService) {}

  @Public()
  @Get()
  async getAllTags(): Promise<InventoryTag[]> {
    return await this.inventoryTagsService.getAllTags();
  }

  @Admin()
  @Get(':tagId')
  async getTagByID(@Param('tagId', new CustomParseIntPipe('Tag ID')) tagId: number): Promise<InventoryTag> {
    return await this.inventoryTagsService.getTagByID(tagId);
  }

  @Admin()
  @Post()
  async createNewTag(@Body() createInventoryTagDto: CreateInventoryTagDto): Promise<InventoryTag> {
    return await this.inventoryTagsService.createNewTag(createInventoryTagDto);
  }

  @Admin()
  @Delete(':tagId')
  async deleteTagById(@Param('tagId', new CustomParseIntPipe('Tag ID')) tagId: number): Promise<{ success: boolean }> {
    return await this.inventoryTagsService.deleteTagById(tagId);
  }
}
