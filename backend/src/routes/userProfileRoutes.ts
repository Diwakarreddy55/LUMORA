import express from 'express';

import {
  saveBasicInfo,
  saveAboutInfo,
  saveInterests,
  savePreferences,
  saveLocation,
  getProfilePreview,
  completeProfile,
  saveLifestyle,
  saveProfilePhotos,
} from '../controllers/userProfileController';

import uploadProfilePhotos from '../../uploadProfilePhotos';

const router = express.Router();

// Basic
router.post(
  '/basic',
  saveBasicInfo
);

// About
router.post(
  '/about',
  saveAboutInfo
);

// Interests
router.post(
  '/interests',
  saveInterests
);

// Preferences
router.post(
  '/preferences',
  savePreferences
);

// Location
router.post(
  '/location',
  saveLocation
);

// Preview
router.get(
  '/preview/:user_id',
  getProfilePreview
);

// Complete
router.post(
  '/complete',
  completeProfile
);

// Lifestyle
router.post(
  '/lifestyle',
  saveLifestyle
);

// Photos
router.post(
  '/photos',
  (req, res, next) => {
    uploadProfilePhotos.array('photos', 4)(
      req,
      res,
      (err) => {
        if (err) {

          return res.status(400).json({
            success: false,
            message: err.message,
            code: (err as any).code || null,
            field: (err as any).field || null,
          });
        }

        next();
      }
    );
  },
  saveProfilePhotos
);

export default router;