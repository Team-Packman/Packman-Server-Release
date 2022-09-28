import { Router } from 'express';
import HelpController from '../controllers/HelpController';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, HelpController.getHelp);

export default router;
