import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InventoryInvitesService } from './inventoryInvites.service';
import { CreateInventoryInviteDto } from './createInventoryInvite.dto';
import { InventoryInvite } from './inventoryInvite.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Admin } from 'src/auth/auth.decorators';
import { Request } from 'express';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { InventoryInviteDublicateFilter } from 'src/common/filters/inventoryInvite-duplicate.filter';
import { InventoryInviteStatuses } from './inventoryInviteStatuses.enum';

@UseFilters(InventoryInviteDublicateFilter)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('inventory_invites')
export class InventoryInvitesController {
  constructor(private readonly inventoryInvitesService: InventoryInvitesService) {}

  @UseGuards(AuthGuard)
  @Get('/user')
  async getUserInvitesByEmail(
    @Req() req: Request,
    @Query('status') status?: InventoryInviteStatuses | 'ALL',
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('search') searchValue?: string,
  ): Promise<InventoryInvite[]> {
    const parsedQuery = {
      offset: offset ? Number(offset) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status ?? 'ALL',
      searchValue,
    };

    return await this.inventoryInvitesService.getUserInvitesByEmail(req.user.email, parsedQuery);
  }

  @UseGuards(AuthGuard)
  @Post('/accept')
  async acceptInventoryInvites(@Body('inviteIds') inviteIds: number[], @Req() req: Request): Promise<InventoryInvite[]> {
    return await this.inventoryInvitesService.acceptInventoryInvites(inviteIds, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/reject')
  async rejectInventoryInvites(@Body('ids') inviteIds: number[], @Req() req: Request): Promise<InventoryInvite[]> {
    return await this.inventoryInvitesService.rejectInventoryInvites(inviteIds, req.user);
  }

  @Admin()
  @UseGuards(AuthGuard)
  @Get()
  async getAllInventoryInvites(): Promise<InventoryInvite[]> {
    return await this.inventoryInvitesService.getAllInventoryInvites();
  }

  @UseGuards(AuthGuard)
  @Get('/inventory/:inventoryId')
  async getInvitesByInventoryId(
    @Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number,
  ): Promise<InventoryInvite[]> {
    return await this.inventoryInvitesService.getInvitesByInventoryId(inventoryId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createNewInventoryInvite(@Body() createInventoryInviteDto: CreateInventoryInviteDto, @Req() req: Request): Promise<InventoryInvite> {
    return await this.inventoryInvitesService.createNewInventoryInvite(createInventoryInviteDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Get(':inviteId')
  async getInventoryInviteById(@Param('inviteId', new CustomParseIntPipe('Invite ID')) inviteId: number): Promise<InventoryInvite> {
    return await this.inventoryInvitesService.getInventoryInviteById(inviteId);
  }

  @UseGuards(AuthGuard)
  @Delete(':inviteId')
  async deleteInventoryInviteById(@Param('inviteId', new CustomParseIntPipe('Invite ID')) inviteId: number): Promise<{ success: boolean }> {
    return await this.inventoryInvitesService.deleteInventoryInviteById(inviteId);
  }
}
