import { Request, Response, NextFunction } from 'express';
import statusCode from '../modules/statusCode';
import util from '../modules/util';
import message from '../modules/responseMessage';
import jwtHandler from '../modules/jwtHandler';
import { UserService } from '../services';
import db from '../loaders/db';

export default async (req: Request, res: Response, next: NextFunction) => {

  const token = req.headers['authorization']?.split(' ').reverse()[0];

  if (!token) {
    return next();
  }

  let client;

  try {
    client = await db.connect(req);

    const decoded = jwtHandler.verifyToken(token);

    if (decoded === 'expired_token')
      return res
        .status(statusCode.UNAUTHORIZED)
        .send(util.fail(statusCode.UNAUTHORIZED, message.EXPIRED_TOKEN));

    if (decoded === 'invalid_token')
      return res
        .status(statusCode.UNAUTHORIZED)
        .send(util.fail(statusCode.UNAUTHORIZED, message.INVALID_TOKEN));

    const user = (decoded as any).user;

    const existUser = await UserService.checkUser(client, user.id);
    if (!existUser)
      return res
        .status(statusCode.UNAUTHORIZED)
        .send(util.fail(statusCode.UNAUTHORIZED, message.NO_USER));

    req.body.user = user;

    next();
  } catch (error: any) {
    console.log(error);
  } finally {
    if (client !== undefined) client.release();
  }
};
