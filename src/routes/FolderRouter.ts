import { Router } from 'express';
import { FolderController } from '../controllers';

const router = Router();

router.get('/recentCreatedList', FolderController.getRecentCreatedList);

export default router;
