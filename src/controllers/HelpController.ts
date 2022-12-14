import { Request, Response } from 'express';
import HelpService from '../services/HelpService';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import db from '../loaders/db';
import logger from '../config/logger';

/**
 *  @route GET /help
 *  @desc get help
 *  @access private
 **/
const getHelp = async (req: Request, res: Response) => {
  let client;
  const userId: number = req.body.user.id;

  try {
    client = await db.connect(req);

    await HelpService.getHelp(client, userId);

    res.status(statusCode.OK).send(util.success(statusCode.OK, message.SUCCESS_GET_HELP));
  } catch (error) {
    logger.logger.error(`GET, /help, 엿보기 조회, 500, ${error}`);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

export default {
  getHelp,
};
