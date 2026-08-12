import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';
import { sendSuccess } from './utils/response';

dotenv.config();

const app: Express = express();

// CORS configuration supporting dynamic FRONTEND_URL & localhost
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Welcome & Health Check Endpoints
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Mini ERP + CRM Operations Portal API Server',
    health: '/api/health'
  });
});

app.get('/health', (req, res) => {
  return sendSuccess(res, { status: 'healthy', timestamp: new Date() }, 'Mini ERP + CRM Operations Portal API is running');
});

app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API is healthy'
  });
});

// API Routes
app.use('/api', apiRouter);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
