import { Router } from 'express';
import { AloneListPackController } from '../controllers';
import auth from '../middlewares/auth';
const router = Router();

router.delete('/:listId/:categoryId/:packId', auth, AloneListPackController.deletePack);

export default router;
