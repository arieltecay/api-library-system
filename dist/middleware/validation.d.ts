import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
export declare function validate(schema: ZodType): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validation.d.ts.map