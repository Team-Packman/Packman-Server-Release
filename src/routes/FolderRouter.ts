import { Router } from 'express';
import { FolderController } from '../controllers';
import auth from '../middlewares/auth';

const router = Router();

router.get('/recentCreatedList', FolderController.getRecentCreatedList);
router.get('/list/together/:folderId', FolderController.getTogetherListInFolder);

export default router;
