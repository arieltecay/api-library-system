import { Router } from 'express';
import { validate } from '../../middleware/validation.js';
import * as posController from '../../Controllers/Pos/index.js';
import { createPosSchema, updatePosSchema } from '../../Controllers/Pos/types.js';
import { authMiddleware, requireAdmin } from '../../middleware/auth.js';

const router = Router();

// Solo el admin del negocio puede gestionar sus POS
router.use(authMiddleware, requireAdmin);

router.get('/', posController.listPos);
router.post('/', validate(createPosSchema), posController.createPos);
router.put('/:id', validate(updatePosSchema), posController.updatePos);
router.delete('/:id', posController.deletePos);

export default router;