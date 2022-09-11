import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { AuthService } from '../services';
import db from '../loaders/db';

/**
 *  @route POST /auth/kakao
 *  @desc get kakao user
 *  @access public
 **/
const getKakaoUser = async (req: Request, res: Response) => {
  let client;
  const token = req.body.accessToken;

  if (!token) {
    return res
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
    if (client !== undefined) client.release();
  }
};

/**
 *  @route GET /auth/token
 *  @desc get new token
 *  @access private
 **/
const getNewToken = async (req: Request, res: Response) => {
  let client;
  const accessToken = req.headers['authorization']?.split(' ').reverse()[0] as string;
  const refreshToken = req.headers.refresh as string;

  if (!accessToken || !refreshToken) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE_TOKEN));
  }
  try {
    client = await db.connect(req);

    const data = await AuthService.getNewToken(client, accessToken, refreshToken);

    if (data === 'no_user')
      return res
        .status(statusCode.UNAUTHORIZED)
        .send(util.fail(statusCode.UNAUTHORIZED, message.NO_USER));
    else if (data === 'no_user_refresh')
      return res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_USER_RF_TOKEN));
    else if (data === 'invalid_token')
      return res
        .status(statusCode.UNAUTHORIZED)
        .send(util.fail(statusCode.UNAUTHORIZED, message.INVALID_TOKEN));
    else if (data === 'all_expired_token')
      return res
        .status(statusCode.UNAUTHORIZED)
        .send(util.fail(statusCode.UNAUTHORIZED, message.ALL_EXPIRED_TOKEN));
    else if (data === 'valid_token')
      return res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.VALID_TOKEN));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.SUCCESS_REISSUE_TOKEN, data));
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
  getKakaoUser,
  getNewToken,
};
