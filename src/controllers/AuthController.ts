import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { AuthService } from '../services';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../loaders/db');
/**
 *  @route GET /auth/kakao
 *  @desc get kakao user
 *  @access public
 **/

const getKakaoUser = async (req: Request, res: Response) => {
  let client;
  const token = req.body.accessToken;

  if (!token) {
    res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE_TOKEN));
  }
  try {
    client = await db.connect(req);
    const data = await AuthService.getKakaoUser(client, token);

    if (!data)
      return res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.INVALID_TOKEN));
    res.status(statusCode.OK).send(util.success(statusCode.OK, message.SUCCESS_GET_TOKEN, data));
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
  getKakaoUser,
};
