import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.body.user_id;

    console.log('=================================');
    console.log('📂 MULTER DESTINATION');
    console.log('=================================');
    console.log('Field Name:', file.fieldname);
    console.log('Original Name:', file.originalname);
    console.log('MIME Type:', file.mimetype);
    console.log('User ID:', userId);

    if (!userId) {
      console.error('❌ user_id is missing in multipart request');

      return cb(
        new Error('user_id is required'),
        ''
      );
    }

    const uploadPath = path.join(
      process.cwd(),
      'public',
      'uploads',
      'profile',
      String(userId)
    );

    console.log('Upload Path:', uploadPath);

    fs.mkdirSync(uploadPath, {
      recursive: true,
    });

    console.log('✅ Upload directory ready');
    console.log('=================================');

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname) || '.jpg';

    const fileName =
      `${Date.now()}-${Math.round(
        Math.random() * 1000000000
      )}${extension}`;

    console.log('Generated File Name:', fileName);

    cb(null, fileName);
  },
});

const uploadProfilePhotos = multer({
  storage,

  limits: {
    files: 4,
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    console.log('=================================');
    console.log('📸 MULTER FILE FILTER');
    console.log('=================================');
    console.log('Field Name:', file.fieldname);
    console.log('Original Name:', file.originalname);
    console.log('MIME Type:', file.mimetype);

    if (file.mimetype.startsWith('image/')) {
      console.log('✅ Image accepted');
      console.log('=================================');

      cb(null, true);
    } else {
      console.log('❌ Not an image');
      console.log('=================================');

      cb(
        new Error('Only image files are allowed')
      );
    }
  },
});

export default uploadProfilePhotos;