import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

export interface CosmosBlock {
    height: string;
    time: string;
    hash: string;
    proposedAddress: string;
}

export interface CosmosTransaction {
    hash: string;
    height: string;
    time: string;
    gasUsed: string;
    gasWanted: string;
    fee: { amount: string; denom: string };
    sender: string;
}

interface CosmosRpcResponse<T = unknown> {
    jsonrpc: string;
    id: number;
    result: T;
    error?: { code: number; message: string; data?: string };
}

interface CosmosRpcBlock {
    block_id: { hash: string };
    block: {
        header: { height: string; time: string };
        last_commit?: { signatures?: Array<{ validator_address: string }> };
    };
}

interface CosmosEventAttribute {
    key: string;
    value: string;
}

interface CosmosEvent {
    type: string;
    attributes: CosmosEventAttribute[];
}

interface CosmosRpcTransaction {
    hash: string;
    height: string;
    tx_result: { gas_used: string; gas_wanted: string; events?: CosmosEvent[] };
}

@Injectable()
export class CosmosService {
    private readonly rpcUrl = 'https://sei-m.rpc.n0ok.net';

    constructor(private readonly httpService: HttpService) {}

    async getBlockByHeight(height: string): Promise<CosmosBlock> {
        const response = await firstValueFrom(
            this.httpService.get<CosmosRpcResponse<CosmosRpcBlock>>(`${this.rpcUrl}/block?height=${height}`)
        );

        if (response.data.error) {
            throw new HttpException(
                `Ошибка RPC: ${response.data.error.data || response.data.error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }

        const block = response.data.result?.block;
        if (!block) {
            throw new HttpException('Блок не найден', HttpStatus.NOT_FOUND);
        }

        // Извлекаем адрес валидатора из подписей
        const proposedAddress = block.last_commit?.signatures?.[0]?.validator_address || '';
        const hash = response.data.result?.block_id?.hash || '';

        return { height: block.header.height, time: block.header.time, hash, proposedAddress };
    }

    async getTransactionByHash(hash: string): Promise<CosmosTransaction> {
        // Сначала получаем детали транзакции
        const txResponse = await firstValueFrom(
            this.httpService.get<CosmosRpcResponse<CosmosRpcTransaction>>(`${this.rpcUrl}/tx?hash=0x${hash}`)
        );

        if (txResponse.data.error) {
            throw new HttpException(
                `Ошибка RPC: ${txResponse.data.error.data || txResponse.data.error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }

        const tx: CosmosRpcTransaction = txResponse.data.result;
        if (!tx) {
            throw new HttpException('Транзакция не найдена', HttpStatus.NOT_FOUND);
        }

        // Получаем детали блока для получения таймстемпа
        const blockResponse = await firstValueFrom(
            this.httpService.get<CosmosRpcResponse<CosmosRpcBlock>>(`${this.rpcUrl}/block?height=${tx.height}`)
        );

        const blockTime = blockResponse.data.result?.block?.header?.time || '';

        // Парсим комиссию из транзакции
        let fee = { amount: '0', denom: '' };
        if (tx.tx_result?.events) {
            const feeEvent = tx.tx_result.events.find(
                (event: CosmosEvent) =>
                    event.type === 'tx' &&
                    event.attributes?.some((attr: CosmosEventAttribute) => attr.key === 'fee' && attr.value)
            );

            if (feeEvent) {
                const feeAttr = feeEvent.attributes.find((attr: CosmosEventAttribute) => attr.key === 'fee');
                if (feeAttr?.value) {
                    // Парсим комиссию
                    const feeMatch = feeAttr.value.match(/(\d+)([a-zA-Z]+)/);
                    if (feeMatch) {
                        fee = { amount: feeMatch[1], denom: feeMatch[2] };
                    }
                }
            }
        }

        // Извлекаем отправителя из транзакции
        let sender = '';
        if (tx.tx_result?.events) {
            const messageEvent = tx.tx_result.events.find(
                (event: CosmosEvent) =>
                    event.type === 'message' &&
                    event.attributes?.some((attr: CosmosEventAttribute) => attr.key === 'sender' && attr.value)
            );

            if (messageEvent) {
                const senderAttr = messageEvent.attributes.find((attr: CosmosEventAttribute) => attr.key === 'sender');
                sender = senderAttr?.value || '';
            }
        }

        return {
            hash: tx.hash,
            height: tx.height,
            time: blockTime,
            gasUsed: tx.tx_result?.gas_used || '0',
            gasWanted: tx.tx_result?.gas_wanted || '0',
            fee,
            sender,
        };
    }
}
