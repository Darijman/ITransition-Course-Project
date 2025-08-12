import { Controller, Get, Param, UseInterceptors, Delete, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryUser } from './inventoryUser.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { Admin } from 'src/auth/auth.decorators';
import { CreateInventoryUserDto } from './createInventoryUser.dto';
import { InventoryUsersService } from './inventoryUsers.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('inventory_users')
@UseInterceptors(ClassSerializerInterceptor)
export class InventoryUsersController {
  constructor(private readonly inventoryUsersService: InventoryUsersService) {}

  @Admin()
  @Get()
  async getAllInventoriesUsers(): Promise<InventoryUser[]> {
    return await this.inventoryUsersService.getAllInventoriesUsers();
  }

  @UseGuards(AuthGuard)
  @Get('/inventory/:inventoryId')
  async getUsersByInventoryId(@Param('inventoryId', new CustomParseIntPipe('Inventory ID')) inventoryId: number): Promise<InventoryUser[]> {
    return await this.inventoryUsersService.getUsersByInventoryId(inventoryId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createNewInventoryUser(@Body() createInventoryUserDto: CreateInventoryUserDto): Promise<InventoryUser> {
    return await this.inventoryUsersService.createNewInventoryUser(createInventoryUserDto);
  }

  @UseGuards(AuthGuard)
  @Get(':inventoryUserId')
  async getInventoryUserById(
    @Param('inventoryUserId', new CustomParseIntPipe('Inventory User ID')) inventoryUserId: number,
  ): Promise<InventoryUser> {
    return await this.inventoryUsersService.getInventoryUserById(inventoryUserId);
  }

  @UseGuards(AuthGuard)
  @Delete(':inventoryUserId')
  async deleteInventoryUserById(
    @Param('inventoryUserId', new CustomParseIntPipe('Inventory User ID')) inventoryUserId: number,
  ): Promise<{ success: boolean }> {
    return await this.inventoryUsersService.deleteInventoryUserById(inventoryUserId);
  }
}
