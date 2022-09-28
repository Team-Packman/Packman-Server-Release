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
    body('path').notEmpty(),
  ],
  UserController.createUser,
);

router.patch(
  '/profile',
  [body('nickname').notEmpty(), body('profileImage').notEmpty()],
  auth,
  UserController.updateUser,
);

router.get('/', auth, UserController.getUser);

router.delete('/', auth, UserController.deleteUser);
export default router;
