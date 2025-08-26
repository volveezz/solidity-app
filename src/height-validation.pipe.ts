import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class HeightValidationPipe implements PipeTransform<string> {
    transform(value: string): string {
        if (!value?.trim()) {
            throw new BadRequestException('Требуется указать высоту блока');
        }

        if (!/^\d+$/.test(value.trim())) {
            throw new BadRequestException('Неверный номер блока');
        }

        const heightNum = parseInt(value, 10);
        if (isNaN(heightNum) || heightNum < 0) {
            throw new BadRequestException('Неверный номер блока');
        }

        return value.trim();
    }
}
