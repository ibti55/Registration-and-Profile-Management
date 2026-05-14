import { Router } from 'express';
import { getDistricts, getUpazillas, getEducationBoards, getUniversities, getSubjects } from '../controllers/lookup.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/districts', getDistricts);
router.get('/districts/:districtId/upazillas', getUpazillas);
router.get('/education-boards', getEducationBoards);
router.get('/universities', getUniversities);
router.get('/subjects/:level', getSubjects);

export default router;
