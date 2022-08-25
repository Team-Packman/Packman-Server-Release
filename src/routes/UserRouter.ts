import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers';
import auth from '../middlewares/auth';
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

router.delete('/', auth, UserController.deleteUser);
export default router;
