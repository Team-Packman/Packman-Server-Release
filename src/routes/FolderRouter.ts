import { Router } from 'express';
import { FolderController } from '../controllers';
import auth from '../middlewares/auth';

const router = Router();

router.get('/recentCreatedList', auth, FolderController.getRecentCreatedList);
router.get('/list/alone/:folderId', auth, FolderController.getAloneListInFolder);

export default router;
