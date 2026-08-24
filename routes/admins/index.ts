import { Router } from 'express';
import { z } from 'zod';
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

// Endpoint para que el superadmin actualice sus propias credenciales
const updateSuperAdminSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
  body: z.object({
    password: z.string().min(8).optional(),
    pin: z.string().length(4).regex(/^\d{4}$/).optional(),
  }),
});

router.put('/superadmin/:id', validate(updateSuperAdminSchema), adminsController.updateSuperAdmin);

export default router;