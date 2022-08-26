import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { UserCreateDto, UserUpdateDto } from '../interfaces/IUser';
import { UserService } from '../services';
import db from '../loaders/db';

/**
 *  @route POST /user/profile
 *  @desc create user
 *  @access public
 **/
const createUser = async (req: Request, res: Response) => {
  let client;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }

  const userCreateDto: UserCreateDto = req.body;

  try {
    client = await db.connect(req);

    const data = await UserService.createUser(client, userCreateDto);

    if (data === 'exceed_len')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.success(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.SUCCESS_CREATE_USER, data));
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

/**
 *  @route PATCH /user/profile
 *  @desc update user
 *  @access private
 **/
 const updateUser = async (req: Request, res: Response) => {
  let client;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }
  const userId = req.body.user.id;
  const userUpdateDto: UserUpdateDto = req.body;

  try {
    client = await db.connect(req);

    const data = await UserService.updateUser(client, userUpdateDto, userId);

    if (data === 'exceed_len') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.success(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    } else if (data === 'no_user') {
      res
      .status(statusCode.BAD_REQUEST)
      .send(util.success(statusCode.BAD_REQUEST, message.NO_USER));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.SUCCESS_UPDATE_USER, data));
    }
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

export default {
  createUser,
  updateUser,
};
