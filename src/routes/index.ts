import { Router } from 'express';
import UserRouter from './UserRouter';
import FolderRouter from './FolderRouter';

const router = Router();

router.use('/user', UserRouter);
router.use('/folder', FolderRouter);

export default router;
