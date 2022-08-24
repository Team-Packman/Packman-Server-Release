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
 *  @route GET /folder/list/together/:folderId
 *  @desc read togetherLists in Folder
 *  @access private
 **/
const getTogetherListInFolder = async (req: Request, res: Response) => {
  let client;

  const userId = req.body.user.id;
  const { folderId } = req.params;

  try {
    client = await db.connect(req);
    const data = await FolderService.getTogetherListInFolder(client, userId, folderId);

    if (data === 'no_folder') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_FOLDER));
    } else if (data === 'no_user_folder') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_USER_FOLDER));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.SUCCESS_GET_TOGETHER_LIST_IN_FOLDER, data));
    }
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
  getRecentCreatedList,
  getTogetherListInFolder,
};
