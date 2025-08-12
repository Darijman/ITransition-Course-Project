import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CustomParseIntPipe implements PipeTransform<string, number> {
  constructor(private readonly fieldName = 'Parameter') {}

  transform(value: string): number {
    if (value === undefined || value === null || String(value).trim() === '') {
      throw new BadRequestException({ error: `${this.fieldName} is required and must be a valid number!` });
    }

    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException({ error: `${this.fieldName} must be a valid number!` });
    }

    return val;
  }
}
