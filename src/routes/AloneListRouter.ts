import { Router } from 'express';
import { AloneListController } from '../controllers';
import auth from '../middlewares/auth';
const router = Router();

router.get('/:listId', auth, AloneListController.readAloneList);

export default router;
