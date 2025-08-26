import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CosmosController } from './cosmos.controller';
import { CosmosService } from './cosmos.service';

describe('CosmosController', () => {
    let controller: CosmosController;
    let service: jest.Mocked<CosmosService>;

    beforeEach(async () => {
        const mockCosmosService = { getBlockByHeight: jest.fn(), getTransactionByHash: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CosmosController],
            providers: [{ provide: CosmosService, useValue: mockCosmosService }],
        }).compile();

        controller = module.get<CosmosController>(CosmosController);
        service = module.get(CosmosService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getBlock', () => {
        it('should return block data', async () => {
            const mockBlock = {
                height: '123',
                time: '2023-01-01T00:00:00.000Z',
                hash: 'block-hash-123',
                proposedAddress: 'validator-123',
            };

            service.getBlockByHeight.mockResolvedValue(mockBlock);

            const result = await controller.getBlock('123');

            expect(result).toEqual(mockBlock);
            // eslint-disable-next-line @typescript-eslint/unbound-method
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
                hash: 'tx-hash-123',
                height: '456',
                time: '2023-01-01T00:00:00.000Z',
                gasUsed: '1000',
                gasWanted: '2000',
                fee: { amount: '1000', denom: 'usei' },
                sender: 'cosmos1abc...',
            };

            service.getTransactionByHash.mockResolvedValue(mockTransaction);

            const result = await controller.getTransaction('1234567890abcdef1234567890abcdef12345678');

            expect(result).toEqual(mockTransaction);
            // eslint-disable-next-line @typescript-eslint/unbound-method
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
