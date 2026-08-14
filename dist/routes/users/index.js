import { Router } from 'express';
import { validate } from '../../middleware/validation.js';
import * as usersController from '../../Controllers/Users/index.js';
import { createUserSchema, updateUserSchema, listUsersSchema } from '../../Controllers/Users/types.js';
import { authMiddleware, requireAdmin } from '../../middleware/auth.js';
const router = Router();
router.use(authMiddleware, requireAdmin);
router.get('/', validate(listUsersSchema), usersController.listUsers);
router.get('/summary', usersController.getUsersSummary);
router.post('/', validate(createUserSchema), usersController.createUser);
router.get('/:id', usersController.getUser);
router.put('/:id', validate(updateUserSchema), usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
export default router;
//# sourceMappingURL=index.js.map