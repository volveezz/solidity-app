import { BadRequestException } from '@nestjs/common';
import { HashValidationPipe } from './hash-validation.pipe';

describe('HashValidationPipe', () => {
    let pipe: HashValidationPipe;

    beforeEach(() => {
        pipe = new HashValidationPipe();
    });

    it('should be defined', () => {
        expect(pipe).toBeDefined();
    });

    it('should pass valid hash without 0x prefix', () => {
        const validHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        expect(pipe.transform(validHash)).toBe(validHash);
    });

    it('should pass valid hash with 0x prefix', () => {
        const hashWithPrefix = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const expectedHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        expect(pipe.transform(hashWithPrefix)).toBe(expectedHash);
    });

    it('should throw BadRequestException for empty hash', () => {
        expect(() => pipe.transform('')).toThrow(BadRequestException);
        expect(() => pipe.transform('')).toThrow('Hash is required');
    });

    it('should throw BadRequestException for null or undefined hash', () => {
        expect(() => pipe.transform(null as unknown as string)).toThrow(BadRequestException);
        expect(() => pipe.transform(undefined as unknown as string)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for hash too short', () => {
        const shortHash = '1234567890abcdef';
        expect(() => pipe.transform(shortHash)).toThrow(BadRequestException);
        expect(() => pipe.transform(shortHash)).toThrow('Неверный формат хеша транзакции');
    });

    it('should throw BadRequestException for hash too long', () => {
        const longHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12';
        expect(() => pipe.transform(longHash)).toThrow(BadRequestException);
        expect(() => pipe.transform(longHash)).toThrow('Неверный формат хеша транзакции');
    });

    it('should throw BadRequestException for hash with invalid characters', () => {
        const invalidHash = 'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg';
        expect(() => pipe.transform(invalidHash)).toThrow(BadRequestException);
        expect(() => pipe.transform(invalidHash)).toThrow('Неверный формат хеша транзакции');
    });

    it('should throw BadRequestException for hash with mixed invalid characters', () => {
        const invalidHash = '1234567890abcdefgggggggggggggggggggggggggggggggggggggggggggggggg';
        expect(() => pipe.transform(invalidHash)).toThrow(BadRequestException);
        expect(() => pipe.transform(invalidHash)).toThrow('Неверный формат хеша транзакции');
    });
});
