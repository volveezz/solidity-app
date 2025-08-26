import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GetBlockDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d+$/, { message: 'Высота блока должна быть числом' })
    height!: string;
}
