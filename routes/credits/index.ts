import { Router } from 'express';
import { validate } from '../../middleware/validation.js';
import * as creditsController from '../../Controllers/Credits/index.js';
import {
  settleDebtSchema,
  listCreditsSchema,
  getClientCreditSchema,
} from '../../Controllers/Credits/types.js';
import { authMiddleware, requireAdmin } from '../../middleware/auth.js';

const router = Router();

router.use(authMiddleware, requireAdmin);

router.get('/', validate(listCreditsSchema), creditsController.listCredits);
router.get('/summary', creditsController.getCreditsSummary);
router.get('/history', creditsController.getRecentHistory);
router.get('/client/:clientId', validate(getClientCreditSchema), creditsController.getClientCredit);
router.post('/client/:clientId/settle', validate(settleDebtSchema), creditsController.settleDebt);

export default router;