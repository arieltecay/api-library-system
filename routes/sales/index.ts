import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validation.js';
import * as salesController from '../../Controllers/Sales/index.js';
import {
  previewSaleSchema,
  createSaleSchema,
  createReturnSchema,
  voidSaleSchema,
  returnSaleSchema,
  creditNoteSaleSchema,
  listSalesSchema,
} from '../../Controllers/Sales/types.js';
import { authMiddleware, requireAdmin } from '../../middleware/auth.js';

const router = Router();

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
});

router.use(authMiddleware);

router.post('/preview', validate(previewSaleSchema), salesController.previewSale);
router.post('/', validate(createSaleSchema), salesController.createSale);
router.post('/returns', validate(createReturnSchema), salesController.createReturn);
router.get('/', validate(listSalesSchema), salesController.listSales);
router.get('/summary', salesController.getSalesSummary);
router.get('/:id', validate(idParamSchema), salesController.getSale);
router.post('/:id/void', requireAdmin, validate(voidSaleSchema), salesController.voidSale);
router.post('/:id/return', requireAdmin, validate(returnSaleSchema), salesController.returnSale);
router.post('/:id/credit-note', requireAdmin, validate(creditNoteSaleSchema), salesController.creditNoteSale);

export default router;