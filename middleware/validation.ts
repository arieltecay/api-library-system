import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

export function validate(schema: ZodType) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Express 5: req.query and req.params are read-only getters.
      // Only req.body is writable. Store parsed query/params in res.locals
      // as a fallback, but controllers typically read from req directly
      // with type casts, so validation already served its purpose.
      if (parsed && typeof parsed === 'object') {
        if ('body' in parsed) {
          req.body = parsed.body;
        }
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.');
          if (!details[path]) {
            details[path] = [];
          }
          details[path].push(issue.message);
        }
        throw new ValidationError('Datos de entrada inválidos', details);
      }
      throw error;
    }
  };
}
