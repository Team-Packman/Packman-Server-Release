import { Router } from 'express';
import { FolderController } from '../controllers';

const router = Router();

router.get('/recentCreatedList', FolderController.getRecentCreatedList);
router.get('/list/together/:folderId', FolderController.getTogetherListInFolder);

export default router;
