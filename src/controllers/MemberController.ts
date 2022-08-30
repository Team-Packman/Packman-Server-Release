import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import db from '../loaders/db';
import { MemberService } from '../services';

/**
 *  @route GET /member/:listId
 *  @desc get members in group
 *  @access private
 **/
const getMember = async (req: Request, res: Response) => {
  let client;

  const { listId } = req.params;

  try {
    client = await db.connect(req);

    const data = await MemberService.getMember(client, listId);

    if (data === 'no_list') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_LIST));
    } else if (data === 'no_member_user') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_MEMBER_USER));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.SUCCESS_GET_MEMBERS, data));
    }
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

export default {
  getMember,
};
