import crypto from 'crypto';

export const env = {
  port: Number(process.env.PORT) || 5000,

  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/lumora',

  jwtSecret:
    process.env.JWT_SECRET ||
    crypto.randomBytes(64).toString('hex'),

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};