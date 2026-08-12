import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import productRoutes from './product.routes';
import stockRoutes from './stock.routes';
import challanRoutes from './challan.routes';
import userRoutes from './user.routes';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/stock-movements', stockRoutes);
router.use('/challans', challanRoutes);
router.use('/users', userRoutes);
router.get('/dashboard/stats', authenticate, DashboardController.getStats);

export default router;
