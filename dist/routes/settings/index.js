import { Router } from 'express';
import * as settingsController from '../../Controllers/Settings/index.js';
import { authMiddleware, requireAdmin } from '../../middleware/auth.js';
const router = Router();
router.use(authMiddleware, requireAdmin);
router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
export default router;
//# sourceMappingURL=index.js.map