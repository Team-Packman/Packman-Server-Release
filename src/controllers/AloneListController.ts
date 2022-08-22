import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import db from '../loaders/db';
import { AloneListService } from '../services';

/**
 *  @route GET /list/alone/:listId
 *  @desc read alone packinglist
 *  @access private
 **/
const readAloneList = async (req: Request, res: Response) => {
  let client;
  const { listId } = req.params;

  try {
    client = await db.connect(req);

    const data = await AloneListService.readAloneList(client, listId);

    if (data === 'no_list')
      res
        .status(statusCode.NOT_FOUND)
        .send(util.success(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.READ_ALONEPACKINGLIST_SUCCESS, data));
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
  readAloneList,
};
