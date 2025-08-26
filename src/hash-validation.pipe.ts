import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class HashValidationPipe implements PipeTransform<string> {
    transform(value: string): string {
        if (!value?.trim()) {
            throw new BadRequestException('Требуется указать хеш транзакции');
        }

        const cleanHash = value.startsWith('0x') ? value.slice(2) : value;

        if (!/^[a-fA-F0-9]{64}$/.test(cleanHash)) {
            throw new BadRequestException('Неверный формат хеша транзакции');
        }

        return cleanHash;
    }
}
