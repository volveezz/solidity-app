import { Controller, Get, Param } from '@nestjs/common';
import { HashValidationPipe } from '../hash-validation.pipe';
import { HeightValidationPipe } from '../height-validation.pipe';
import { EvmService } from './evm.service';

@Controller('evm')
export class EvmController {
    constructor(private readonly evmService: EvmService) {}

    // Получение информации о блоке EVM по высоте
    @Get('block/:height')
    async getBlock(@Param('height', HeightValidationPipe) height: string) {
        return await this.evmService.getBlockByHeight(height);
    }

    // Получение информации о транзакции EVM по хешу
    @Get('transactions/:hash')
    async getTransaction(@Param('hash', HashValidationPipe) hash: string) {
        return await this.evmService.getTransactionByHash(hash);
    }
}
