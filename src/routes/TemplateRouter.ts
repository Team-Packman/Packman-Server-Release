import { Router } from 'express';
import { TemplateController } from '../controllers';
import auth from '../middlewares/auth';

const router = Router();

router.get('/alone', auth, TemplateController.getAloneTemplateList);
router.get('/together', auth, TemplateController.getTogetherTemplateList);
router.get('/:templateId', auth, TemplateController.getTemplate);

export default router;