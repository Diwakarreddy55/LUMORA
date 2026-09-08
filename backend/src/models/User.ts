import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  phone: string;
  name?: string;
  email?: string;

  dateOfBirth?: Date;
  gender?: string;

  bio?: string;
  interests: string[];
  photos: string[];

  location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };

  status: 'active' | 'blocked' | 'deleted';

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },

    interests: {
      type: [String],
      default: [],
    },

    photos: {
      type: [String],
      default: [],
    },

    location: {
      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },

      city: {
        type: String,
        trim: true,
      },
    },

    status: {
      type: String,
      enum: ['active', 'blocked', 'deleted'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;