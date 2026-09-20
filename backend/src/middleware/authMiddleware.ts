import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization header missing",
      });
    }

    if (
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format",
      });
    }

    const token =
      authHeader.substring(7).trim();

    const jwtSecret =
      process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message:
          "JWT secret is not configured",
      });
    }

    const decoded =
      jwt.verify(
        token,
        jwtSecret
      ) as {
        userId: number;
        phone: string;
        iat?: number;
        exp?: number;
      };

    (req as any).user =
      decoded;

    next();

  } catch (error) {

    console.error(
      "JWT authentication error:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};