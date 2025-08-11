import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CustomParseIntPipe implements PipeTransform<string, number> {
  constructor(private readonly fieldName = 'Parameter') {}

  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException({ error: `${this.fieldName} must be a valid number!` });
    }
    return val;
  }
}
