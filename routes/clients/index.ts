import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validation.js';
import * as clientsController from '../../Controllers/Clients/index.js';
import {
  createClientSchema,
  updateClientSchema,
  listClientsSchema,
  getClientHistorySchema,
} from '../../Controllers/Clients/types.js';
import { authMiddleware, requireAdmin, requireSellerOrAdmin } from '../../middleware/auth.js';

const router = Router();

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
});

router.use(authMiddleware);

router.get('/', validate(listClientsSchema), clientsController.listClients);
router.get('/debtors', requireAdmin, clientsController.getDebtors);
router.get('/:id', validate(idParamSchema), clientsController.getClient);
router.get('/:id/history', validate(getClientHistorySchema), clientsController.getClientHistory);

router.post('/', requireSellerOrAdmin, validate(createClientSchema), clientsController.createClient);
router.patch('/:id', requireAdmin, validate(updateClientSchema), clientsController.updateClient);
router.delete('/:id', requireAdmin, validate(idParamSchema), clientsController.deleteClient);

export default router;
