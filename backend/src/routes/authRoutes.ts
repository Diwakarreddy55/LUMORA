import { Router } from 'express';

import {
  sendOtp,
  verifyRegisterOtp,
  sendLoginOtp,
  verifyLoginOtp
} from '../controllers/authController';

const router = Router();
// Register
router.post('/register/send-otp', sendOtp);
router.post('/register/verify-otp', verifyRegisterOtp);

// Login
router.post('/login/send-otp', sendLoginOtp);
router.post('/login/verify-otp', verifyLoginOtp);


export default router;