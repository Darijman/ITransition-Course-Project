import { CanActivate, ExecutionContext, Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InventoriesService } from 'src/inventories/inventories.service';
import { UserRoles } from 'src/users/userRoles.enum';

@Injectable()
export class InventoryOwnerOrAdminGuard implements CanActivate {
  constructor(private readonly inventoriesService: InventoriesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const inventoryId = parseInt(request.params.inventoryId, 10);
    if (isNaN(inventoryId)) {
      throw new BadRequestException({ error: 'Inventory ID must be a valid number!' });
    }

    const inventory = await this.inventoriesService.getInventoryById(inventoryId);
    const isOwner: boolean = inventory.creatorId === user.id;
    const isAdmin: boolean = user.role === UserRoles.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException({ error: 'You do not have permission!' });
    }
    return true;
  }
}
