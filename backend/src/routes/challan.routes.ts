import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createChallanSchema, updateChallanSchema } from '../validators/challan.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(['ADMIN', 'SALES']),
  validate(createChallanSchema),
  ChallanController.create
);

router.get(
  '/',
  authorize(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']),
  ChallanController.getAll
);

router.get(
  '/:id',
  authorize(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']),
  ChallanController.getById
);

router.put(
  '/:id',
  authorize(['ADMIN', 'SALES']),
  validate(updateChallanSchema),
  ChallanController.update
);

router.post(
  '/:id/confirm',
  authorize(['ADMIN', 'SALES', 'ACCOUNTS']),
  ChallanController.confirm
);

router.post(
  '/:id/cancel',
  authorize(['ADMIN', 'SALES']),
  ChallanController.cancel
);

export default router;
