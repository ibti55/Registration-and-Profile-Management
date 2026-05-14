import { Router } from 'express';
import {
  createApplication, updateApplication, submitApplication,
  getMyApplications, getApplicationById
} from '../controllers/application.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { createApplicationSchema, updateApplicationSchema, submitApplicationSchema, applicationIdParamSchema } from '../schemas/application.schema';

const router = Router();

router.use(authenticate);

router.get('/', getMyApplications);
router.post('/', validate(createApplicationSchema), createApplication);
router.get('/:id', validate(applicationIdParamSchema, 'params'), getApplicationById);
router.put('/:id', validate(applicationIdParamSchema, 'params'), validate(updateApplicationSchema), updateApplication);
router.post('/:id/submit', validate(applicationIdParamSchema, 'params'), validate(submitApplicationSchema), submitApplication);

export default router;
