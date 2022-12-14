import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { LandingService } from '../services';
import db from '../loaders/db';
import logger from '../config/logger';

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
    logger.logger.error(`POST, /landing, 랜딩페이지 사용자 번호 등록, 500, ${error}`);
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
