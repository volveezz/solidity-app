import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

export interface EvmBlock {
    height: number;
    hash: string;
    parentHash: string;
    gasLimit: string;
    gasUsed: string;
    size: string;
}

export interface EvmTransaction {
    hash: string;
    to: string | null;
    from: string;
    value: string;
    input: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    gasPrice?: string;
}

interface RpcResponse<T = unknown> {
    jsonrpc: string;
    id: number;
    result: T;
    error?: { code: number; message: string };
}

interface EvmRpcBlock {
    hash: string;
    parentHash: string;
    gasLimit: string;
    gasUsed: string;
    size: string;
}

interface EvmRpcTransaction {
    hash: string;
    to: string;
    from: string;
    value: string;
    input: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    gasPrice?: string;
}

@Injectable()
export class EvmService {
    private readonly rpcUrl = 'https://sei-evm-rpc.publicnode.com';

    constructor(private readonly httpService: HttpService) {}

    getBlockByHeight = async (height: string): Promise<EvmBlock> => {
        // Преобразуем высоту в hex формат
        const heightNum = parseInt(height, 10);
        const heightHex = `0x${heightNum.toString(16)}`;

        const response = await firstValueFrom(
            this.httpService.post<RpcResponse<EvmRpcBlock>>(this.rpcUrl, {
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getBlockByNumber',
                params: [heightHex, false], // false - не нужны объекты транзакций
            })
        );

        if (response.data.error) {
            throw new HttpException(`Ошибка RPC: ${response.data.error.message}`, HttpStatus.BAD_REQUEST);
        }

        const block: EvmRpcBlock = response.data.result;
        if (!block) {
            throw new HttpException('Блок не найден', HttpStatus.NOT_FOUND);
        }

        return {
            height: heightNum,
            hash: block.hash,
            parentHash: block.parentHash,
            gasLimit: block.gasLimit,
            gasUsed: block.gasUsed,
            size: block.size,
        };
    };

    getTransactionByHash = async (hash: string): Promise<EvmTransaction> => {
        const response = await firstValueFrom(
            this.httpService.post<RpcResponse<EvmRpcTransaction>>(this.rpcUrl, {
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getTransactionByHash',
                params: [hash],
            })
        );

        if (response.data.error) {
            throw new HttpException(`Ошибка RPC: ${response.data.error.message}`, HttpStatus.BAD_REQUEST);
        }

        const tx: EvmRpcTransaction = response.data.result;
        if (!tx) {
            throw new HttpException('Транзакция не найдена', HttpStatus.NOT_FOUND);
        }

        return {
            hash: tx.hash,
            to: tx.to || null,
            from: tx.from,
            value: tx.value,
            input: tx.input,
            maxFeePerGas: tx.maxFeePerGas,
            maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
            gasPrice: tx.gasPrice,
        };
    };
}
