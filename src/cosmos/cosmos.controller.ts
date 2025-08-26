import { Controller, Get, Param } from '@nestjs/common';
import { HashValidationPipe } from '../hash-validation.pipe';
import { HeightValidationPipe } from '../height-validation.pipe';
import { CosmosService } from './cosmos.service';

@Controller('cosmos')
export class CosmosController {
    constructor(private readonly cosmosService: CosmosService) {}

    // Получение информации о блоке Cosmos по высоте
    @Get('block/:height')
    async getBlock(@Param('height', HeightValidationPipe) height: string) {
        return await this.cosmosService.getBlockByHeight(height);
    }

    // Получение информации о транзакции Cosmos по хешу
    @Get('transactions/:hash')
    async getTransaction(@Param('hash', HashValidationPipe) hash: string) {
        return await this.cosmosService.getTransactionByHash(hash);
    }
}
