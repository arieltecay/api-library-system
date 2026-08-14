import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validation.js';
import * as salesController from '../../Controllers/Sales/index.js';
import {
  previewSaleSchema,
  createSaleSchema,
  voidSaleSchema,
  returnSaleSchema,
  listSalesSchema,
} from '../../Controllers/Sales/types.js';
import { authMiddleware, requireAdmin, requireSellerOrAdmin } from '../../middleware/auth.js';

const router = Router();

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
});

router.use(authMiddleware);

router.post('/preview', validate(previewSaleSchema), salesController.previewSale);
router.post('/', validate(createSaleSchema), salesController.createSale);
router.get('/', validate(listSalesSchema), salesController.listSales);
router.get('/summary', salesController.getSalesSummary);
router.get('/:id', validate(idParamSchema), salesController.getSale);
router.post('/:id/void', requireAdmin, validate(voidSaleSchema), salesController.voidSale);
router.post('/:id/return', requireAdmin, validate(returnSaleSchema), salesController.returnSale);

export default router;