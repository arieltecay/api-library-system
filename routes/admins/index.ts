import { Router } from 'express';
import { validate } from '../../middleware/validation.js';
import * as adminsController from '../../Controllers/Admins/index.js';
import {
  createAdminSchema,
  updateAdminSchema,
  listAdminsSchema,
} from '../../Controllers/Admins/types.js';
import { authMiddleware, requireSuperAdmin } from '../../middleware/auth.js';

const router = Router();

// Todos los endpoints son exclusivos del superadmin
router.use(authMiddleware, requireSuperAdmin);

router.get('/', validate(listAdminsSchema), adminsController.listAdmins);
router.post('/', validate(createAdminSchema), adminsController.createAdmin);
router.put('/:id', validate(updateAdminSchema), adminsController.updateAdmin);
router.delete('/:id', adminsController.deleteAdmin);

export default router;