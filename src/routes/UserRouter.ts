import { Router } from 'express';
import { body } from 'express-validator';
import UserController from '../controllers/UserController';

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

export default router;
