import { Router } from 'express';
import { ListController } from '../controllers';
import auth from '../middlewares/auth';
const router = Router();

router.get('/invite/:inviteCode', auth, ListController.inviteList);
export default router;
