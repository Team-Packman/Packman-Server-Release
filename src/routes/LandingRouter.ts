import { Router } from 'express';
import { body } from 'express-validator';
import { LandingController } from '../controllers';

const router = Router();

router.post('/', [body('phone').notEmpty()], LandingController.createLandingUser);
export default router;
