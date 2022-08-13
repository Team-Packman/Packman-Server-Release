import { Router } from 'express';
import UserControllers from '../controllers/UserControllers';

const router = Router();

router.post('/', UserControllers.createUser);
router.get('/', UserControllers.testUser);
export default router;
