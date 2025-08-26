import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { CosmosService } from './cosmos.service';

interface CosmosRpcResponse<T = unknown> {
    jsonrpc: string;
    id: number;
    result: T;
    error?: { code: number; message: string; data?: string };
}

const createMockResponse = <T = unknown>(data: CosmosRpcResponse<T>) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: {} },
});

describe('CosmosService', () => {
    let service: CosmosService;
    let httpService: jest.Mocked<HttpService>;

    beforeEach(async () => {
        const mockHttpService = { get: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [CosmosService, { provide: HttpService, useValue: mockHttpService }],
        }).compile();

        service = module.get<CosmosService>(CosmosService);
        httpService = module.get(HttpService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getBlockByHeight', () => {
        it('should return block data for valid height', async () => {
            const mockBlockData = {
                block_id: { hash: 'block-hash-123' },
                block: {
                    header: { height: '123', time: '2023-01-01T00:00:00.000Z' },
                    last_commit: { signatures: [{ validator_address: 'validator-123' }] },
                },
            };

            const mockResponse = createMockResponse({ jsonrpc: '2.0', id: 1, result: mockBlockData });

            httpService.get.mockReturnValue(of(mockResponse as AxiosResponse));

            const result = await service.getBlockByHeight('123');

            expect(result).toEqual({
                height: '123',
                time: '2023-01-01T00:00:00.000Z',
                hash: 'block-hash-123',
                proposedAddress: 'validator-123',
            });
        });

        it('should throw error when block not found', async () => {
            const mockResponse = createMockResponse({ jsonrpc: '2.0', id: 1, result: null });

            httpService.get.mockReturnValue(of(mockResponse as AxiosResponse));

            await expect(service.getBlockByHeight('999999999')).rejects.toThrow('Блок не найден');
        });

        it('should handle missing signatures', async () => {
            const mockBlockData = {
                block_id: { hash: 'block-hash-123' },
                block: { header: { height: '123', time: '2023-01-01T00:00:00.000Z' }, last_commit: null },
            };

            const mockResponse = createMockResponse({ jsonrpc: '2.0', id: 1, result: mockBlockData });

            httpService.get.mockReturnValue(of(mockResponse as AxiosResponse));

            const result = await service.getBlockByHeight('123');

            expect(result.proposedAddress).toBe('');
        });

        it('should throw error for RPC error', async () => {
            const mockResponse = createMockResponse({
                jsonrpc: '2.0',
                id: 1,
                result: null,
                error: { code: -32603, message: 'Block not found' },
            });

            httpService.get.mockReturnValue(of(mockResponse as AxiosResponse));

            await expect(service.getBlockByHeight('123')).rejects.toThrow('Ошибка RPC: Block not found');
        });
    });

    describe('getTransactionByHash', () => {
        it('should return transaction data for valid hash', async () => {
            const mockTxData = {
                hash: 'tx-hash-123',
                height: '456',
                tx_result: {
                    gas_used: '1000',
                    gas_wanted: '2000',
                    events: [
                        { type: 'tx', attributes: [{ key: 'fee', value: '1000usei' }] },
                        { type: 'message', attributes: [{ key: 'sender', value: 'cosmos1abc...' }] },
                    ],
                },
            };

            const mockBlockData = { block: { header: { time: '2023-01-01T00:00:00.000Z' } } };

            httpService.get
                .mockReturnValueOnce(
                    of(createMockResponse({ jsonrpc: '2.0', id: 1, result: mockTxData }) as AxiosResponse)
                )
                .mockReturnValueOnce(
                    of(createMockResponse({ jsonrpc: '2.0', id: 1, result: mockBlockData }) as AxiosResponse)
                );

            const result = await service.getTransactionByHash(
                '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            );

            expect(result).toEqual({
                hash: 'tx-hash-123',
                height: '456',
                time: '2023-01-01T00:00:00.000Z',
                gasUsed: '1000',
                gasWanted: '2000',
                fee: { amount: '1000', denom: 'usei' },
                sender: 'cosmos1abc...',
            });
        });

        it('should throw error when transaction not found', async () => {
            const mockResponse = createMockResponse({ jsonrpc: '2.0', id: 1, result: null });

            httpService.get.mockReturnValue(of(mockResponse as AxiosResponse));

            await expect(
                service.getTransactionByHash('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
            ).rejects.toThrow('Транзакция не найдена');
        });

        it('should handle missing fee events', async () => {
            const mockTxData = {
                hash: 'tx-hash-123',
                height: '456',
                tx_result: { gas_used: '1000', gas_wanted: '2000', events: [] },
            };

            const mockBlockData = { block: { header: { time: '2023-01-01T00:00:00.000Z' } } };

            httpService.get
                .mockReturnValueOnce(
                    of(createMockResponse({ jsonrpc: '2.0', id: 1, result: mockTxData }) as AxiosResponse)
                )
                .mockReturnValueOnce(
                    of(createMockResponse({ jsonrpc: '2.0', id: 1, result: mockBlockData }) as AxiosResponse)
                );

            const result = await service.getTransactionByHash(
                '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            );

            expect(result.fee).toEqual({ amount: '0', denom: '' });
            expect(result.sender).toBe('');
        });

        it('should handle missing events array', async () => {
            const mockTxData = {
                hash: 'tx-hash-123',
                height: '456',
                tx_result: { gas_used: '1000', gas_wanted: '2000' },
            };

            const mockBlockData = { block: { header: { time: '2023-01-01T00:00:00.000Z' } } };

            httpService.get
                .mockReturnValueOnce(
                    of(createMockResponse({ jsonrpc: '2.0', id: 1, result: mockTxData }) as AxiosResponse)
                )
                .mockReturnValueOnce(
                    of(createMockResponse({ jsonrpc: '2.0', id: 1, result: mockBlockData }) as AxiosResponse)
                );

            const result = await service.getTransactionByHash(
                '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            );

            expect(result.fee).toEqual({ amount: '0', denom: '' });
            expect(result.sender).toBe('');
        });
    });
});
