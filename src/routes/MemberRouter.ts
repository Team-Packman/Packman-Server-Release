import { Router } from 'express';
import { MemberController } from '../controllers';
import auth from '../middlewares/auth';

const router = Router();

router.get('/:listId', auth, MemberController.getMember);

export default router;
