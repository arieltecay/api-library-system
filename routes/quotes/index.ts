import { Router } from 'express';
import { validate } from '../../middleware/validation.js';
import * as quotesController from '../../Controllers/Quotes/index.js';
import {
  previewQuoteSchema,
  createQuoteSchema,
  cancelQuoteSchema,
  listQuotesSchema,
  idParamSchema,
} from '../../Controllers/Quotes/types.js';
import { authMiddleware, requireSellerOrAdmin } from '../../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/preview', validate(previewQuoteSchema), quotesController.previewQuote);
router.post('/', validate(createQuoteSchema), quotesController.createQuote);
router.get('/', validate(listQuotesSchema), quotesController.listQuotes);
router.get('/:id', validate(idParamSchema), quotesController.getQuote);
router.patch('/:id/cancel', requireSellerOrAdmin, validate(cancelQuoteSchema), quotesController.cancelQuote);

export default router;