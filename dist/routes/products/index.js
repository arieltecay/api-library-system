import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validation.js';
import * as productsController from '../../Controllers/Products/index.js';
import { createProductSchema, updateProductSchema, updateStockSchema, listProductsSchema, } from '../../Controllers/Products/types.js';
import { authMiddleware, requireAdmin, requireSellerOrAdmin } from '../../middleware/auth.js';
const router = Router();
const idParamSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
    }),
});
router.use(authMiddleware);
router.get('/', validate(listProductsSchema), productsController.listProducts);
router.get('/low-stock', requireSellerOrAdmin, productsController.getLowStock);
router.get('/:id', validate(idParamSchema), productsController.getProduct);
router.post('/', requireAdmin, validate(createProductSchema), productsController.createProduct);
router.patch('/:id', requireAdmin, validate(updateProductSchema), productsController.updateProduct);
router.delete('/:id', requireAdmin, validate(idParamSchema), productsController.deleteProduct);
router.patch('/:id/stock', requireSellerOrAdmin, validate(updateStockSchema), productsController.updateStock);
export default router;
//# sourceMappingURL=index.js.map