import { Router } from 'express';
import { StockController } from '../controllers/stock.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createStockMovementSchema } from '../validators/stock.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(['ADMIN', 'WAREHOUSE']),
  validate(createStockMovementSchema),
  StockController.createMovement
);

router.get(
  '/',
  authorize(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']),
  StockController.getMovements
);

export default router;
