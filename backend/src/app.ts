import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'LUMORA API is running',
  });
  
});
app.use('/api/auth', authRoutes);
export default app;