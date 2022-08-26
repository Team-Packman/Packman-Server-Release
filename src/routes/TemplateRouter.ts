import { Router } from 'express';
import { TemplateController } from '../controllers';
import auth from '../middlewares/auth';

const router = Router();

router.get('/:templateId', auth, TemplateController.getTemplate);

export default router;
