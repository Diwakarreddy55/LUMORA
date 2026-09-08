import dotenv from 'dotenv';

dotenv.config();

import app from './app';
import connectDB from './config/database';

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 LUMORA API running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();