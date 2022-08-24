import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import FolderService from '../services/FolderService';
import db from '../loaders/db';

/**
 *  @route GET /folder/recentCreatedList
 *  @desc read recentCreatedList
 *  @access private
 **/
const getRecentCreatedList = async (req: Request, res: Response) => {
  let client;
  const userId = req.body.user.id;

  try {
    client = await db.connect(req);
    const data = await FolderService.getRecentCreatedList(client, userId);

    if (data === 'no_list')
      return res.send(util.success(statusCode.NO_CONTENT, message.NO_USER_LIST, {}));

    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, message.SUCCESS_GET_RECENT_CREATED_LIST, data));
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
 *  @route GET /folder/alone
 *  @desc read aloneFolders
 *  @access private
 **/
const getAloneFolders = async (req: Request, res: Response) => {
  let client;

  const userId = req.body.user.id;

  try {
    client = await db.connect(req);
    const data = await FolderService.getAloneFolders(client, userId);

    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, message.SUCCESS_GET_ALONE_FOLDERS, { aloneFolder: data }));
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
  getRecentCreatedList,
  getAloneFolders,
};
