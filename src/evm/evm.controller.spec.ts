import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EvmController } from './evm.controller';
import { EvmService } from './evm.service';

describe('EvmController', () => {
    let controller: EvmController;
    let service: jest.Mocked<EvmService>;

    beforeEach(async () => {
        const mockEvmService = { getBlockByHeight: jest.fn(), getTransactionByHash: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [EvmController],
            providers: [{ provide: EvmService, useValue: mockEvmService }],
        }).compile();

        controller = module.get<EvmController>(EvmController);
        service = module.get(EvmService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getBlock', () => {
        it('should return block data', async () => {
            const mockBlock = {
                height: 123,
                hash: '0x123...',
                parentHash: '0x456...',
                gasLimit: '0x5208',
                gasUsed: '0x76c',
                size: '0x1e8',
            };

            service.getBlockByHeight.mockResolvedValue(mockBlock);

            const result = await controller.getBlock('123');

            expect(result).toEqual(mockBlock);
            expect(service.getBlockByHeight).toHaveBeenCalledWith('123');
        });

        it('should throw HttpException when service throws HttpException', async () => {
            const error = new HttpException('Блок не найден', HttpStatus.NOT_FOUND);
            service.getBlockByHeight.mockRejectedValue(error);

            await expect(controller.getBlock('999')).rejects.toThrow(error);
        });

        it('should throw error when service throws other error', async () => {
            const error = new Error('Unexpected error');
            service.getBlockByHeight.mockRejectedValue(error);

            await expect(controller.getBlock('123')).rejects.toThrow('Unexpected error');
        });
    });

    describe('getTransaction', () => {
        it('should return transaction data', async () => {
            const mockTransaction = {
                hash: '0x123...',
                to: '0xabc...',
                from: '0xdef...',
                value: '0x1',
                input: '0x',
                maxFeePerGas: '0x2',
                maxPriorityFeePerGas: '0x1',
                gasPrice: '0x1',
            };

            service.getTransactionByHash.mockResolvedValue(mockTransaction);

            const result = await controller.getTransaction('1234567890abcdef1234567890abcdef12345678');

            expect(result).toEqual(mockTransaction);
            expect(service.getTransactionByHash).toHaveBeenCalledWith('1234567890abcdef1234567890abcdef12345678');
        });

        it('should throw HttpException when service throws HttpException', async () => {
            const error = new HttpException('Транзакция не найдена', HttpStatus.NOT_FOUND);
            service.getTransactionByHash.mockRejectedValue(error);

            await expect(controller.getTransaction('1234567890abcdef1234567890abcdef12345678')).rejects.toThrow(error);
        });

        it('should throw error when service throws other error', async () => {
            const error = new Error('Unexpected error');
            service.getTransactionByHash.mockRejectedValue(error);

            await expect(controller.getTransaction('1234567890abcdef1234567890abcdef12345678')).rejects.toThrow(
                'Unexpected error'
            );
        });
    });
});
