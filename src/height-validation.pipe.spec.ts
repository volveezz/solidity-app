import { BadRequestException } from '@nestjs/common';
import { HeightValidationPipe } from './height-validation.pipe';

describe('HeightValidationPipe', () => {
    let pipe: HeightValidationPipe;

    beforeEach(() => {
        pipe = new HeightValidationPipe();
    });

    it('should be defined', () => {
        expect(pipe).toBeDefined();
    });

    it('should pass valid positive height', () => {
        expect(pipe.transform('123')).toBe('123');
        expect(pipe.transform('0')).toBe('0');
        expect(pipe.transform('999999')).toBe('999999');
    });

    it('should throw BadRequestException for empty height', () => {
        expect(() => pipe.transform('')).toThrow(BadRequestException);
        expect(() => pipe.transform('')).toThrow('Height is required');
    });

    it('should throw BadRequestException for null or undefined height', () => {
        expect(() => pipe.transform(null as unknown as string)).toThrow(BadRequestException);
        expect(() => pipe.transform(undefined as unknown as string)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for negative height', () => {
        expect(() => pipe.transform('-1')).toThrow(BadRequestException);
        expect(() => pipe.transform('-123')).toThrow(BadRequestException);
        expect(() => pipe.transform('-0')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-numeric height', () => {
        expect(() => pipe.transform('abc')).toThrow(BadRequestException);
        expect(() => pipe.transform('12a')).toThrow(BadRequestException);
        expect(() => pipe.transform('a12')).toThrow(BadRequestException);
        expect(() => pipe.transform('12.5')).toThrow(BadRequestException);
    });

    it('should throw BadRequestException with correct message', () => {
        expect(() => pipe.transform('abc')).toThrow('Неверный номер блока');
        expect(() => pipe.transform('-5')).toThrow('Неверный номер блока');
    });
});
