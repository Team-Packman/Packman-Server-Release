import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { ListService } from '../services';
import db from '../loaders/db';

/**
 *  @route GET /invite/:inviteCode
 *  @desc invite packing list
 *  @access private
 **/
const inviteList = async (req: Request, res: Response) => {
  let client;

  const inviteCode = req.params.inviteCode;
  try {
    client = await db.connect(req);
    const data = await ListService.getPackingByInviteCode(client, inviteCode);
    if (data === 'no_list') {
      res
        .status(statusCode.NOT_FOUND)
        .send(util.fail(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.SUCCESS_INVITE_TOGETHER_PACKING, data));
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
  inviteList,
};
