import { Router } from 'express';
import { sendOtp } from '../controllers/authController';

const router = Router();

router.post('/send-otp', sendOtp);

export default router;