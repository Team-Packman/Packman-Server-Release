import { Router } from 'express';
import { MemberController } from '../controllers';
import auth from '../middlewares/auth';

const router = Router();

router.get('/:groupId', auth, MemberController.getMember);
router.delete('/:groupId/:memberId', auth, MemberController.deleteMember);

export default router;
