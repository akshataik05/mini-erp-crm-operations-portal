import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(['ADMIN', 'WAREHOUSE']),
  validate(createProductSchema),
  ProductController.create
);

router.get(
  '/',
  authorize(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']),
  ProductController.getAll
);

router.get(
  '/:id',
  authorize(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']),
  ProductController.getById
);

router.put(
  '/:id',
  authorize(['ADMIN', 'WAREHOUSE']),
  validate(updateProductSchema),
  ProductController.update
);

router.delete(
  '/:id',
  authorize(['ADMIN']),
  ProductController.delete
);

export default router;
