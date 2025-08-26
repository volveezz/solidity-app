import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { EvmService } from './evm.service';

interface RpcResponse<T = unknown> {
    jsonrpc: string;
    id: number;
    result: T;
    error?: { code: number; message: string };
}

const createMockResponse = <T = unknown>(data: RpcResponse<T>) =>
    ({ data, status: 200, statusText: 'OK', headers: {}, config: { headers: {} } }) as AxiosResponse;

describe('EvmService', () => {
    let service: EvmService;
    let httpService: jest.Mocked<HttpService>;

    beforeEach(async () => {
        const mockHttpService = { post: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [EvmService, { provide: HttpService, useValue: mockHttpService }],
        }).compile();

        service = module.get<EvmService>(EvmService);
        httpService = module.get(HttpService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getBlockByHeight', () => {
        it('should return block data for valid height', async () => {
            const mockBlockData = {
                hash: '0x123...',
                parentHash: '0x456...',
                gasLimit: '0x5208',
                gasUsed: '0x76c',
                size: '0x1e8',
            };

            const mockResponse = createMockResponse({ jsonrpc: '2.0', id: 1, result: mockBlockData });

            httpService.post.mockReturnValue(of(mockResponse));

            const result = await service.getBlockByHeight('123');

            expect(result).toEqual({
                height: 123,
                hash: '0x123...',
                parentHash: '0x456...',
                gasLimit: '0x5208',
                gasUsed: '0x76c',
                size: '0x1e8',
            });
        });

        it('should throw error when block not found', async () => {
            const mockResponse = createMockResponse({ jsonrpc: '2.0', id: 1, result: null });

            httpService.post.mockReturnValue(of(mockResponse));

            await expect(service.getBlockByHeight('999999999')).rejects.toThrow('Блок не найден');
        });

        it('should throw error for RPC error', async () => {
            const mockResponse = createMockResponse({
                jsonrpc: '2.0',
                id: 1,
                result: null,
                error: { code: -32603, message: 'Internal error' },
            });

            httpService.post.mockReturnValue(of(mockResponse));

            await expect(service.getBlockByHeight('123')).rejects.toThrow('Ошибка RPC: Internal error');
        });
    });

    describe('getTransactionByHash', () => {
        it('should return transaction data for valid hash', async () => {
            const mockTxData = {
                hash: '0x123...',
                to: '0xabc...',
                from: '0xdef...',
                value: '0x1',
                input: '0x',
                maxFeePerGas: '0x2',
                maxPriorityFeePerGas: '0x1',
                gasPrice: '0x1',
            };

            const mockResponse = createMockResponse({ jsonrpc: '2.0', id: 1, result: mockTxData });

            httpService.post.mockReturnValue(of(mockResponse));

            const result = await service.getTransactionByHash(
                '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            );

            expect(result).toEqual({
                hash: '0x123...',
                to: '0xabc...',
                from: '0xdef...',
                value: '0x1',
                input: '0x',
                maxFeePerGas: '0x2',
                maxPriorityFeePerGas: '0x1',
                gasPrice: '0x1',
            });
        });

        it('should throw error when transaction not found', async () => {
            const mockResponse = createMockResponse({ jsonrpc: '2.0', id: 1, result: null });

            httpService.post.mockReturnValue(of(mockResponse));

            await expect(
                service.getTransactionByHash('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
            ).rejects.toThrow('Транзакция не найдена');
        });

        it('should handle null "to" field', async () => {
            const mockTxData = { hash: '0x123...', to: null, from: '0xdef...', value: '0x1', input: '0x' };

            const mockResponse = createMockResponse({ jsonrpc: '2.0', id: 1, result: mockTxData });

            httpService.post.mockReturnValue(of(mockResponse));

            const result = await service.getTransactionByHash(
                '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            );

            expect(result.to).toBeNull();
        });
    });
});
