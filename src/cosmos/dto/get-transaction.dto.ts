import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GetTransactionDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[0-9a-fA-F]{64}$/, { message: 'Хеш должен быть 64-символьной hex строкой' })
    hash!: string;
}
