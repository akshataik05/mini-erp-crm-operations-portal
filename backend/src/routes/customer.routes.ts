import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(['ADMIN', 'SALES']),
  validate(createCustomerSchema),
  CustomerController.create
);

router.get(
  '/',
  authorize(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']),
  CustomerController.getAll
);

router.get(
  '/:id',
  authorize(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']),
  CustomerController.getById
);

router.put(
  '/:id',
  authorize(['ADMIN', 'SALES']),
  validate(updateCustomerSchema),
  CustomerController.update
);

router.delete(
  '/:id',
  authorize(['ADMIN']),
  CustomerController.delete
);

export default router;
