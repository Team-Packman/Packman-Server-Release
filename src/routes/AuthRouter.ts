import { Router } from 'express';
import { AuthController } from '../controllers';

const router = Router();

router.post('/kakao', AuthController.getKakaoUser);
export default router;
