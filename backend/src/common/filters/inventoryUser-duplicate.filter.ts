import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class InventoryUserDuplicateFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const driverError: any = exception.driverError;

    if (driverError.code === 'ER_DUP_ENTRY') {
      if (driverError.message.includes('inventoryId_userId')) {
        return response.status(409).json({ error: 'This user is already added to this inventory!' });
      }

      return response.status(409).json({ error: 'Duplicate entry detected!' });
    }
    return response.status(500).json({ error: 'Database error occurred!' });
  }
}
