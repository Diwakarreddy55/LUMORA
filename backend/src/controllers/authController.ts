import { Request, Response } from 'express';

export const sendOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone } = req.body;

    console.log('📱 Send OTP request received');
    console.log('Phone:', phone);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    console.log('🔐 OTP:', otp);

    return res.status(200).json({
      success: true,
      message: 'OTP generated successfully',
      otp,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate OTP',
    });
  }
};