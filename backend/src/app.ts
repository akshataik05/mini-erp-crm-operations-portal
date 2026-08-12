import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';
import { sendSuccess } from './utils/response';

dotenv.config();

const app: Express = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  return sendSuccess(res, { status: 'healthy', timestamp: new Date() }, 'Mini ERP + CRM Operations Portal API is running');
});

// API Routes
app.use('/api', apiRouter);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
