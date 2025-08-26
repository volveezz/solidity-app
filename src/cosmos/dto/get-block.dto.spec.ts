import { validate } from 'class-validator';
import { GetBlockDto } from './get-block.dto';

describe('GetBlockDto (Cosmos)', () => {
    it('should pass validation for valid height', async () => {
        const dto = new GetBlockDto();
        dto.height = '123';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail validation for empty height', async () => {
        const dto = new GetBlockDto();
        dto.height = '';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation for non-numeric height', async () => {
        const dto = new GetBlockDto();
        dto.height = 'abc';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints?.matches).toBeDefined();
    });

    it('should pass validation for height with leading zeros', async () => {
        const dto = new GetBlockDto();
        dto.height = '00123';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should pass validation for large numbers', async () => {
        const dto = new GetBlockDto();
        dto.height = '999999999999999';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });
});
