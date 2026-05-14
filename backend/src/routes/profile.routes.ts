import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getProfile, updateProfile, uploadFile } from '../controllers/profile.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { updateProfileSchema } from '../schemas/profile.schema';

const router = Router();

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

router.get('/', getProfile);
router.put('/', validate(updateProfileSchema), updateProfile);
router.post('/upload/:type', upload.single('file'), uploadFile);

export default router;
