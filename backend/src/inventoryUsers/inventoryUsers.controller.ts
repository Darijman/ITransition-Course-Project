import { Controller, Get, Param, UseInterceptors, Delete, UseGuards, UseFilters, Post, Body, Req } from '@nestjs/common';
import { InventoryUser } from './inventoryUser.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { Admin } from 'src/auth/auth.decorators';
import { InventoryUsersService } from './inventoryUsers.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { InventoryUserDuplicateFilter } from 'src/common/filters/inventoryUser-duplicate.filter';
import { Request } from 'express';

@UseFilters(InventoryUserDuplicateFilter)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('inventory_users')
export class InventoryUsersController {
  constructor(private readonly inventoryUsersService: InventoryUsersService) {}

  @Admin()
  @UseGuards(AuthGuard)
  @Get()
  async getAllInventoriesUsers(): Promise<InventoryUser[]> {
    return await this.inventoryUsersService.getAllInventoriesUsers();
  }

  @UseGuards(AuthGuard)
  @Post('/leave')
  async leaveManyInventories(@Body('inventoryIds') inventoryIds: number[], @Req() req: Request): Promise<{ success: boolean }> {
    return this.inventoryUsersService.leaveManyInventories(inventoryIds, req.user);
  }

  @UseGuards(AuthGuard)
  @Get('/inventory/:inventoryId')
  async getUsersByInventoryId(@Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number): Promise<InventoryUser[]> {
    return await this.inventoryUsersService.getUsersByInventoryId(inventoryId);
  }

  @UseGuards(AuthGuard)
  @Get(':inventoryUserId')
  async getInventoryUserById(
    @Param('inventoryUserId', new CustomParseIntPipe('Inventory User ID')) inventoryUserId: number,
  ): Promise<InventoryUser> {
    return await this.inventoryUsersService.getInventoryUserById(inventoryUserId);
  }

  @UseGuards(AuthGuard)
  @Delete(':inventoryId')
  async deleteInventoryUsers(
    @Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number,
    @Body('inventoryUserIds') inventoryUserIds: number[],
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    return await this.inventoryUsersService.deleteInventoryUsersByIds(inventoryId, inventoryUserIds, req.user);
  }
}
