import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import circularRoutes from './routes/circular.routes';
import applicationRoutes from './routes/application.routes';
import paymentRoutes from './routes/payment.routes';
import notificationRoutes from './routes/notification.routes';
import lookupRoutes from './routes/lookup.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(morgan('dev'));

// Static files (uploads)
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/circulars', circularRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/lookups', lookupRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 BPSC RPM Backend running on port ${PORT}`);
});

export default app;
