import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import UserService from '../services/UserService';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../loaders/db');

/**
 *  @route POST /user
 *  @desc create user
 *  @access public
 **/
const createUser = async (req: Request, res: Response) => {
  let client;

  try {
    client = await db.connect(req);

    const email: string = req.body.email;
    const nickname: string = req.body.nickname;
    const profileImage: number = req.body.profileImage;
    const name: string = req.body.name;

    await UserService.createUser(client, email, nickname, name, profileImage);

    res.status(statusCode.OK).send(util.success(statusCode.OK, message.SUCCESS_CREATE_USER));
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};

const testUser = async (req: Request, res: Response) => {
  let client;

  try {
    client = await db.connect(req);

    await UserService.testUser(client);

    res.status(statusCode.OK).send(util.success(statusCode.OK, message.SUCCESS_CREATE_USER));
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};

export default {
  createUser,
  testUser,
};
