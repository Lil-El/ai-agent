import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): number {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed) || parsed < 0 || String(parsed) !== value) {
      throw new BadRequestException('Validation failed...');
    }

    return parsed;
  }
}
