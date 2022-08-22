import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import UserService from '../services/UserService';
import { UserCreateDto } from '../interfaces/IUser';
import db from '../loaders/db';
import { LandingService } from '../services';

/**
 *  @route POST /landing
 *  @desc create landing user
 *  @access public
 **/
const createLandingUser = async (req: Request, res: Response) => {
  let client;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }

  const phone = req.body.phone;

  try {
    client = await db.connect(req);

    const data = await LandingService.createLandingUser(client, phone);

    if (data === 'duplicate_phone')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.success(statusCode.BAD_REQUEST, message.DUPLICATED_PHONE));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.SUCCESS_CREATE_LANDING_USER, data));
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
  createLandingUser,
};
