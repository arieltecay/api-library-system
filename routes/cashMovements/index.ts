import { Router } from 'express';
import { validate } from '../../middleware/validation.js';
import * as cashMovementsController from '../../Controllers/CashMovements/index.js';
import {
  createCashMovementSchema,
  getCashMovementsByShiftSchema,
  listCashMovementsSchema,
  deleteCashMovementSchema,
} from '../../Controllers/CashMovements/types.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/cash-shifts/:cashShiftId/movements',
  validate(createCashMovementSchema),
  cashMovementsController.createCashMovement
);

router.get(
  '/cash-shifts/:cashShiftId/movements',
  validate(getCashMovementsByShiftSchema),
  cashMovementsController.getCashMovementsByShift
);

router.get(
  '/cash-shifts/:cashShiftId/movements/aggregated',
  validate(getCashMovementsByShiftSchema),
  cashMovementsController.getCashMovementsAggregated
);

router.get(
  '/cash-movements',
  validate(listCashMovementsSchema),
  cashMovementsController.listCashMovements
);

router.delete(
  '/cash-movements/:id',
  validate(deleteCashMovementSchema),
  cashMovementsController.deleteCashMovement
);

export default router;