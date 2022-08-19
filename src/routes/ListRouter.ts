import { Router } from 'express';
import { ListController } from '../controllers';
const router = Router();

router.get('/invite/:inviteCode', ListController.inviteList);
export default router;
