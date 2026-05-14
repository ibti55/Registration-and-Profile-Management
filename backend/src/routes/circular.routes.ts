import { Router } from 'express';
import { getCirculars, getCircularById } from '../controllers/circular.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { circularIdParamSchema } from '../schemas/application.schema';

const router = Router();

router.use(authenticate);

router.get('/', getCirculars);
router.get('/:id', validate(circularIdParamSchema, 'params'), getCircularById);

export default router;
