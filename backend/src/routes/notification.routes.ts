import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, getPreferences, updatePreferences } from '../controllers/notification.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { updateNotificationPreferencesSchema } from '../schemas/notification.schema';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.get('/preferences', getPreferences);
router.put('/preferences', validate(updateNotificationPreferencesSchema), updatePreferences);

export default router;
