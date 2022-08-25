import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers';

const router = Router();

router.post(
  '/profile',
  [
    body('email').notEmpty(),
    body('name').notEmpty(),
    body('nickname').notEmpty(),
    body('profileImage').notEmpty(),
  ],
  UserController.createUser,
);

router.patch(
  '/profile',
  [body('nickname').notEmpty(), body('profileImage').notEmpty()],
  
  UserController.updateUser,
);
export default router;
