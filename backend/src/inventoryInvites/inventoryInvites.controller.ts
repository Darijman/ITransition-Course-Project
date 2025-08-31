import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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

@UseFilters(InventoryInviteDublicateFilter)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('inventory_invites')
export class InventoryInvitesController {
  constructor(private readonly inventoryInvitesService: InventoryInvitesService) {}

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
  async createInvite(@Body() createInventoryInviteDto: CreateInventoryInviteDto, @Req() req: Request): Promise<InventoryInvite> {
    return await this.inventoryInvitesService.createNewInventoryInvite(createInventoryInviteDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Get(':inviteId')
  async getInviteById(@Param('inviteId', new CustomParseIntPipe('Invite ID')) inviteId: number): Promise<InventoryInvite> {
    return await this.inventoryInvitesService.getInventoryInviteById(inviteId);
  }

  @UseGuards(AuthGuard)
  @Delete(':inviteId')
  async deleteInvite(@Param('inviteId', new CustomParseIntPipe('Invite ID')) inviteId: number): Promise<{ success: boolean }> {
    return await this.inventoryInvitesService.deleteInventoryInviteById(inviteId);
  }

  @UseGuards(AuthGuard)
  @Post(':inviteId/accept')
  async acceptInventoryInvite(
    @Param('inviteId', new CustomParseIntPipe('Invite ID')) inviteId: number,
    @Req() req: Request,
  ): Promise<InventoryInvite> {
    return await this.inventoryInvitesService.acceptInventoryInvite(inviteId, req.user);
  }

  @UseGuards(AuthGuard)
  @Post(':inviteId/reject')
  async rejectInventoryInvite(
    @Param('inviteId', new CustomParseIntPipe('Invite ID')) inviteId: number,
    @Req() req: Request,
  ): Promise<InventoryInvite> {
    return await this.inventoryInvitesService.rejectInventoryInvite(inviteId, req.user);
  }
}
