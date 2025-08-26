import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GetTransactionDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^0x[0-9a-fA-F]{64}$/, { message: 'Хеш должен быть 66-символьной hex строкой с префиксом 0x' })
    hash!: string;
}
