import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  phone: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
}

const otpSchema = new Schema<IOtp>(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOtp>('Otp', otpSchema);