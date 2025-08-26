import { validate } from 'class-validator';
import { GetTransactionDto } from './get-transaction.dto';

describe('GetTransactionDto (Cosmos)', () => {
    it('should pass validation for valid hash', async () => {
        const dto = new GetTransactionDto();
        dto.hash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail validation for empty hash', async () => {
        const dto = new GetTransactionDto();
        dto.hash = '';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation for hash that is too short', async () => {
        const dto = new GetTransactionDto();
        dto.hash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints?.matches).toBeDefined();
    });

    it('should fail validation for hash that is too long', async () => {
        const dto = new GetTransactionDto();
        dto.hash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints?.matches).toBeDefined();
    });

    it('should fail validation for hash with invalid characters', async () => {
        const dto = new GetTransactionDto();
        dto.hash = '1234567890abcdef1234567890abcdef123456gg';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints?.matches).toBeDefined();
    });

    it('should pass validation for hash with uppercase letters', async () => {
        const dto = new GetTransactionDto();
        dto.hash = '1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should pass validation for hash with mixed case letters', async () => {
        const dto = new GetTransactionDto();
        dto.hash = '1234567890aBcDeF1234567890AbCdEf1234567890aBcDeF1234567890AbCdEf';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail validation for hash with spaces', async () => {
        const dto = new GetTransactionDto();
        dto.hash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde ';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints?.matches).toBeDefined();
    });
});
