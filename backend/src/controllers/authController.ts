import { Request, Response } from 'express';
import pool from '../config/database';
import jwt from 'jsonwebtoken';

export const sendOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Validate Indian mobile number
    if (!/^\+91\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Indian mobile number',
      });
    }

    // Check if user already exists
    const [users] = await pool.execute(
      `SELECT id FROM users WHERE phone = ? LIMIT 1`,
      [phone]
    );

    if (Array.isArray(users) && users.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This mobile number is already registered. Please login.',
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    console.log('🔐 Generated OTP:', otp);

    // OTP expires in 5 minutes
    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Expire previous registration OTPs
    await pool.execute(
      `
      UPDATE otp_verifications
      SET status = 'expired'
      WHERE phone = ?
      AND purpose = 'register'
      AND status = 'pending'
      `,
      [phone]
    );

    // Save OTP directly
    await pool.execute(
      `
      INSERT INTO otp_verifications
      (
        phone,
        otp,
        purpose,
        expires_at,
        status
      )
      VALUES (?, ?, 'register', ?, 'pending')
      `,
      [
        phone,
        otp,
        expiresAt,
      ]
    );

    console.log('✅ OTP saved in database');

    // MSG91 will be added here next

    return res.status(200).json({
      success: true,
      message: 'OTP generated successfully',
    });

  } catch (error) {
    console.error('Send OTP Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate OTP',
    });
  }
};
export const verifyRegisterOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone, otp } = req.body;

    // Validate input
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    // Validate phone
    if (!/^\+91\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Indian mobile number',
      });
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits',
      });
    }

    // Get latest pending OTP
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        phone,
        otp,
        expires_at,
        attempts,
        status
      FROM otp_verifications
      WHERE phone = ?
      AND purpose = 'register'
      AND status = 'pending'
      ORDER BY id DESC
      LIMIT 1
      `,
      [phone]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or already used',
      });
    }

    const otpRecord = rows[0] as {
      id: number;
      phone: string;
      otp: string;
      expires_at: Date;
      attempts: number;
      status: string;
    };

    // Check OTP attempts
    if (otpRecord.attempts >= 5) {
      await pool.execute(
        `
        UPDATE otp_verifications
        SET status = 'failed'
        WHERE id = ?
        `,
        [otpRecord.id]
      );

      return res.status(400).json({
        success: false,
        message: 'Too many OTP attempts',
      });
    }

    // Check OTP expiry
    if (
      new Date(otpRecord.expires_at).getTime() < Date.now()
    ) {
      await pool.execute(
        `
        UPDATE otp_verifications
        SET status = 'expired'
        WHERE id = ?
        `,
        [otpRecord.id]
      );

      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // Increase attempt count
    await pool.execute(
      `
      UPDATE otp_verifications
      SET attempts = attempts + 1
      WHERE id = ?
      `,
      [otpRecord.id]
    );

    // Compare OTP directly
    if (otp !== otpRecord.otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Mark OTP as verified
    await pool.execute(
      `
      UPDATE otp_verifications
      SET
        status = 'verified',
        verified_at = NOW()
      WHERE id = ?
      `,
      [otpRecord.id]
    );

    // Create user
    const [result] = await pool.execute(
      `
      INSERT INTO users
      (
        phone,
        phone_verified,
        account_status
      )
      VALUES (?, 1, 'active')
      `,
      [phone]
    );

    const userId = (
      result as { insertId: number }
    ).insertId;

    console.log('✅ OTP verified successfully');
    console.log('👤 User created:', userId);

    return res.status(200).json({
      success: true,
      message: 'Mobile number verified successfully',
      user: {
        id: userId,
        phone: phone,
        phone_verified: true,
      },
    });

  } catch (error) {
    console.error(
      'Verify registration OTP error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to verify OTP',
    });
  }
};

export const sendLoginOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone } = req.body;

    // ==========================================
    // 1. Check phone number
    // ==========================================
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // ==========================================
    // 2. Validate Indian mobile number
    // ==========================================
    if (!/^\+91\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Indian mobile number',
      });
    }

    // ==========================================
    // 3. Check whether mobile is registered
    // ==========================================
    const [users] = await pool.execute(
      `
      SELECT
        id,
        phone,
        phone_verified,
        account_status
      FROM users
      WHERE phone = ?
      LIMIT 1
      `,
      [phone]
    );

    // ==========================================
    // 4. Mobile number NOT registered
    // ==========================================
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mobile number is not registered. Please register.',
      });
    }

    // ==========================================
    // Registered user
    // ==========================================
    const user = users[0] as {
      id: number;
      phone: string;
      phone_verified: number;
      account_status: string;
    };

    // ==========================================
    // 5. Check phone_verified = 1
    // ==========================================
    if (user.phone_verified !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Mobile number is not verified.',
      });
    }

    // ==========================================
    // 6. Check account status
    // ==========================================
    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active.',
      });
    }

    // ==========================================
    // 7. Generate 6 digit OTP
    // ==========================================
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    console.log('🔐 Login OTP:', otp);

    // ==========================================
    // 8. OTP expires after 5 minutes
    // ==========================================
    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // ==========================================
    // 9. Expire previous login OTPs
    // ==========================================
    await pool.execute(
      `
      UPDATE otp_verifications
      SET status = 'expired'
      WHERE phone = ?
      AND purpose = 'login'
      AND status = 'pending'
      `,
      [phone]
    );

    // ==========================================
    // 10. Save new login OTP
    // ==========================================
    await pool.execute(
      `
      INSERT INTO otp_verifications
      (
        phone,
        otp,
        purpose,
        expires_at,
        status
      )
      VALUES (?, ?, 'login', ?, 'pending')
      `,
      [
        phone,
        otp,
        expiresAt,
      ]
    );

    console.log('✅ Login OTP saved');

    // ==========================================
    // 11. Success response
    // ==========================================
    return res.status(200).json({
      success: true,
      message: 'Login OTP sent successfully',
    });

  } catch (error) {
    console.error(
      'Send Login OTP Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to send login OTP',
    });
  }
};



export const verifyLoginOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    if (!/^\+91\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Indian mobile number',
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits',
      });
    }

    // Get latest pending login OTP
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        phone,
        otp,
        expires_at,
        attempts
      FROM otp_verifications
      WHERE phone = ?
      AND purpose = 'login'
      AND status = 'pending'
      ORDER BY id DESC
      LIMIT 1
      `,
      [phone]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or already used',
      });
    }

    const otpRecord = rows[0] as {
      id: number;
      phone: string;
      otp: string;
      expires_at: Date;
      attempts: number;
    };

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await pool.execute(
        `
        UPDATE otp_verifications
        SET status = 'failed'
        WHERE id = ?
        `,
        [otpRecord.id]
      );

      return res.status(400).json({
        success: false,
        message: 'Too many OTP attempts',
      });
    }

    // Check expiry
    if (
      new Date(otpRecord.expires_at).getTime() < Date.now()
    ) {
      await pool.execute(
        `
        UPDATE otp_verifications
        SET status = 'expired'
        WHERE id = ?
        `,
        [otpRecord.id]
      );

      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // Increase attempts
    await pool.execute(
      `
      UPDATE otp_verifications
      SET attempts = attempts + 1
      WHERE id = ?
      `,
      [otpRecord.id]
    );

    // Compare OTP
    if (otp !== otpRecord.otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Mark OTP verified
    await pool.execute(
      `
      UPDATE otp_verifications
      SET
        status = 'verified',
        verified_at = NOW()
      WHERE id = ?
      `,
      [otpRecord.id]
    );

    // Get user
    const [users] = await pool.execute(
      `
      SELECT
        id,
        phone,
        phone_verified,
        account_status
      FROM users
      WHERE phone = ?
      LIMIT 1
      `,
      [phone]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = users[0] as {
      id: number;
      phone: string;
      phone_verified: number;
      account_status: string;
    };

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '7d',
      }
    );

    // Update last login
    await pool.execute(
      `
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = ?
      `,
      [user.id]
    );

    console.log('✅ Login successful');
    console.log('👤 User ID:', user.id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        phone_verified: true,
      },
    });

  } catch (error) {
    console.error('Verify Login OTP Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to verify login OTP',
    });
  }
};
