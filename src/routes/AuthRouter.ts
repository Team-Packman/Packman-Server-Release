import { Router } from 'express';
import { AuthController } from '../controllers';

const router = Router();

router.get('/kakao', AuthController.getKakaoUser);
export default router;
