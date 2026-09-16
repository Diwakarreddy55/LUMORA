import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import userProfileRoutes from './routes/userProfileRoutes';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan('dev'));

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'LUMORA API is running',
  });
});

// Authentication APIs
app.use('/api/auth', authRoutes);

// Profile APIs
app.use('/api/profile', userProfileRoutes);

export default app;