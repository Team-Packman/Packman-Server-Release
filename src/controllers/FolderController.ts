import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import FolderService from '../services/FolderService';
import db from '../loaders/db';

/**
 *  @route GET /folder/recentCreatedList
 *  @desc read recentCreatedList
 *  @access private
 **/
const getRecentCreatedList = async (req: Request, res: Response) => {
  let client;

  const userId = '1'; // 추후 소셜 로그인 연결 후 바꾸기

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
 *  @route POST /folder
 *  @desc create folder
 *  @access private
 **/

 const createFolder = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }
  let client;
  const userId = req.body.user.id;
  const folderCreateDto = req.body;
  try {
    client = await db.connect(req);
    const data = await FolderService.createFolder(client, userId, folderCreateDto);
    if (data === 'exceed_len') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    } else {
    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, message.SUCCESS_CREATE_FOLDER, data));
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
  createFolder,
};
