import { Router } from 'express';
import { initiatePayment, paymentCallback, getMyPayments } from '../controllers/payment.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { initiatePaymentSchema, paymentCallbackSchema } from '../schemas/payment.schema';

const router = Router();

router.use(authenticate);

router.get('/', getMyPayments);
router.post('/initiate', validate(initiatePaymentSchema), initiatePayment);
router.post('/:id/callback', validate(paymentCallbackSchema), paymentCallback);

export default router;
