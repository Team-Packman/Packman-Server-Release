import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { TogetherListCreateDto } from '../interfaces/ITogetherList';
import TogetherListService from '../services/TogetherListService';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../loaders/db');

/**
 *  @route GET /list/together/:listId
 *  @desc read together packinglist
 *  @access private
 **/
const readTogetherList = async (req: Request, res: Response) => {
  let client;
  const { listId } = req.params;
  const userId: number = req.body.user.id;

  try {
    client = await db.connect(req);

    const data = await TogetherListService.readTogetherList(client, listId, userId);

    if (data === 'no_list')
      res
        .status(statusCode.NOT_FOUND)
        .send(util.success(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.READ_TOGETHERPACKINGLIST_SUCCESS, data));
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
  createTogetherList,
  readTogetherList,
};
