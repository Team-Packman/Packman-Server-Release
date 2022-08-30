import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { FolderService } from '../services';
import db from '../loaders/db';

/**
 *  @route GET /folder/recentCreatedList
 *  @desc read recently created list
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


/**
 *  @route PATCH /folder
 *  @desc update folder
 *  @access private
 **/
 const updateFolder = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }
  let client;
  const userId = req.body.user.id;
  const folderUpdateDto = req.body;
  try {
    client = await db.connect(req);
    const data = await FolderService.updateFolder(client, userId, folderUpdateDto);
    if (data === 'exceed_len') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    } else if (data === 'no_folder') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_FOLDER));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.SUCCESS_UPDATE_FOLDER, data));
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


/**
 *  @route GET /folder
 *  @desc read folder
 *  @access private
 **/
const getFolders = async (req: Request, res: Response) => {
  let client;
  const userId = req.body.user.id;
  try {
    client = await db.connect(req);
    const data = await FolderService.getFolders(client, userId);
    res.status(statusCode.OK).send(util.success(statusCode.OK, message.SUCCESS_GET_FOLDERS, data));
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
 *  @route DELETE /folder
 *  @desc delete folder
 *  @access private
 **/
 const deleteFolder = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }
  let client;
  const userId = req.body.user.id;
  const { folderId } = req.params;

  try {
    client = await db.connect(req);
    const data = await FolderService.deleteFolder(client, userId, folderId);
    if (data === 'exceed_len') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    } else {
    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, message.SUCCESS_DELETE_FOLDER, data));
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

/**
 *  @route GET /folder/together
 *  @desc read together folders
 *  @access private
 **/
const getTogetherFolders = async (req: Request, res: Response) => {
  let client;

  const userId = req.body.user.id;

  try {
    client = await db.connect(req);
    const data = await FolderService.getTogetherFolders(client, userId);

    res.status(statusCode.OK).send(
      util.success(statusCode.OK, message.SUCCESS_GET_TOGETHER_FOLDERS, {
        togetherFolder: data,
      }),
    );
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
 *  @desc read alone folders
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
    if (client !== undefined) client.release();
  }
};

/**
 *  @route GET /folder/list/together/:folderId
 *  @desc read together lists in folder
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

/**
 *  @route GET /folder/list/alone/:folderId
 *  @desc read alone lists in folder
 *  @access private
 **/
const getAloneListInFolder = async (req: Request, res: Response) => {
  let client;

  const userId = req.body.user.id;
  const { folderId } = req.params;

  try {
    client = await db.connect(req);
    const data = await FolderService.getAloneListInFolder(client, userId, folderId);

    if (data === 'no_folder') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_FOLDER));
    } else if (data === 'no_user_folder') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_USER_FOLDER));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.SUCCESS_GET_ALONE_LIST_IN_FOLDER, data));
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
  deleteFolder,
  getFolders,
  updateFolder,
  getTogetherFolders,
  getAloneFolders,
  getTogetherListInFolder,
  getAloneListInFolder,
};
