import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from './../src/app.module';

interface TestResponse {
    body: { message?: string; error?: string; statusCode?: number };
    status: number;
}

describe('App (e2e)', () => {
    let app: INestApplication;
    let server: ReturnType<typeof request>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

        await app.init();

        server = request(app.getHttpServer() as Server);
    });

    describe('AppController', () => {
        it('/ (GET)', () => {
            return server.get('/').expect(200).expect('Hello World!');
        });
    });

    describe('EvmController', () => {
        describe('/evm/block/:height (GET)', () => {
            it('should validate invalid height', () => {
                return server
                    .get('/evm/block/abc')
                    .expect(400)
                    .expect((res: TestResponse) => {
                        expect(res.body.message).toContain('Неверный номер блока');
                    });
            });

            it('should validate empty height', () => {
                return server.get('/evm/block/').expect(404);
            });

            it('should handle non-existent block', () => {
                return server.get('/evm/block/1').expect((res: TestResponse) => {
                    expect([400, 404]).toContain(res.status);
                });
            });

            it('should handle negative height', () => {
                return server
                    .get('/evm/block/-1')
                    .expect(400)
                    .expect((res: TestResponse) => {
                        expect(res.body.message).toContain('Неверный номер блока');
                    });
            });
        });

        describe('/evm/transactions/:hash (GET)', () => {
            it('should validate invalid hash format', () => {
                return server
                    .get('/evm/transactions/invalid')
                    .expect(400)
                    .expect((res: TestResponse) => {
                        expect(res.body.message).toContain('Неверный формат хеша транзакции');
                    });
            });

            it('should validate hash without 0x prefix', () => {
                return server
                    .get('/evm/transactions/1234567890abcdef1234567890abcdef12345678')
                    .expect(400)
                    .expect((res: TestResponse) => {
                        expect(res.body.message).toContain('Неверный формат хеша транзакции');
                    });
            });

            it('should validate short hash', () => {
                return server
                    .get('/evm/transactions/0x123')
                    .expect(400)
                    .expect((res: TestResponse) => {
                        expect(res.body.message).toContain('Неверный формат хеша транзакции');
                    });
            });

            it('should handle non-existent transaction', () => {
                return server
                    .get('/evm/transactions/0x1234567890abcdef1234567890abcdef12345678')
                    .expect((res: TestResponse) => {
                        expect([400, 404]).toContain(res.status);
                    });
            });
        });
    });

    describe('Global Exception Filter - EVM', () => {
        it('should handle unexpected errors with 500 status', () => {
            return server.get('/evm/block/999999999').expect((res: TestResponse) => {
                expect([400, 404, 500]).toContain(res.status);
                if (res.status === 500) {
                    expect(res.body.message).toBe('Внутренняя ошибка сервера');
                    expect(res.body.statusCode).toBe(500);
                }
            });
        });
    });

    describe('CosmosController', () => {
        describe('/cosmos/block/:height (GET)', () => {
            it('should validate invalid height', () => {
                return server
                    .get('/cosmos/block/abc')
                    .expect(400)
                    .expect((res: TestResponse) => {
                        expect(res.body.message).toContain('Неверный номер блока');
                    });
            });

            it('should validate empty height', () => {
                return server.get('/cosmos/block/').expect(404);
            });

            it('should handle non-existent block', () => {
                return server.get('/cosmos/block/1').expect((res: TestResponse) => {
                    expect([400, 404]).toContain(res.status);
                });
            });

            it('should handle negative height', () => {
                return server
                    .get('/cosmos/block/-1')
                    .expect(400)
                    .expect((res: TestResponse) => {
                        expect(res.body.message).toContain('Неверный номер блока');
                    });
            });
        });

        describe('Global Exception Filter', () => {
            it('should handle unexpected errors with 500 status', () => {
                return server.get('/cosmos/block/999999999').expect((res: TestResponse) => {
                    expect([400, 404, 500]).toContain(res.status);
                    if (res.status === 500) {
                        expect(res.body.message).toBe('Внутренняя ошибка сервера');
                        expect(res.body.statusCode).toBe(500);
                    }
                });
            });
        });

        describe('/cosmos/transactions/:hash (GET)', () => {
            it('should validate invalid hash format', () => {
                return server
                    .get('/cosmos/transactions/invalid!')
                    .expect(400)
                    .expect((res: TestResponse) => {
                        expect(res.body.message).toContain('Неверный формат хеша транзакции');
                    });
            });

            it('should validate short hash', () => {
                return server
                    .get('/cosmos/transactions/123')
                    .expect(400)
                    .expect((res: TestResponse) => {
                        expect(res.body.message).toContain('Неверный формат хеша транзакции');
                    });
            });

            it('should validate long hash', () => {
                return server
                    .get('/cosmos/transactions/1234567890abcdef1234567890abcdef123456789')
                    .expect(400)
                    .expect((res: TestResponse) => {
                        expect(res.body.message).toContain('Неверный формат хеша транзакции');
                    });
            });

            it('should handle non-existent transaction', () => {
                return server
                    .get('/cosmos/transactions/1234567890abcdef1234567890abcdef12345678')
                    .expect((res: TestResponse) => {
                        expect([400, 404]).toContain(res.status);
                    });
            });
        });
    });
});
