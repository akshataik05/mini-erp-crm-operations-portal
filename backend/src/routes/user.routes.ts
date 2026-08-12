import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema } from '../validators/auth.validator';

const router = Router();

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.post('/', validate(createUserSchema), UserController.create);
router.get('/', UserController.getAll);
router.put('/:id/role', UserController.updateRole);

export default router;
