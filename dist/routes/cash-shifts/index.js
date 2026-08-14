import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validation.js';
import * as cashShiftsController from '../../Controllers/CashShifts/index.js';
import { openCashShiftSchema, closeCashShiftSchema, listCashShiftsSchema, } from '../../Controllers/CashShifts/types.js';
import { authMiddleware } from '../../middleware/auth.js';
const router = Router();
router.use(authMiddleware);
router.post('/open', validate(openCashShiftSchema), cashShiftsController.openCashShift);
router.get('/active', cashShiftsController.getActiveCashShift);
router.get('/summary/daily', cashShiftsController.getDailySummary);
router.post('/:id/close', validate(closeCashShiftSchema), cashShiftsController.closeCashShift);
router.get('/:id', validate(z.object({ params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) }) })), cashShiftsController.getCashShift);
router.get('/', validate(listCashShiftsSchema), cashShiftsController.listCashShifts);
export default router;
//# sourceMappingURL=index.js.map