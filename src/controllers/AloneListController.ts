import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { ListCreateDto } from '../interfaces/IList';
import { AloneListService } from '../services';
import db from '../loaders/db';
import logger from '../config/logger';

/**
 *  @route POST /list/alone
 *  @desc create alone list
 *  @access private
 **/
const createAloneList = async (req: Request, res: Response) => {
  let client;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }

  const userId: number = req.body.user.id;
  const aloneListCreateDto: ListCreateDto = req.body;

  try {
    client = await db.connect(req);

    const data = await AloneListService.createAloneList(client, userId, aloneListCreateDto);

    if (data === 'exceed_len')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.success(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    else if (data === 'no_folder')
      res.status(statusCode.NOT_FOUND).send(util.success(statusCode.NOT_FOUND, message.NO_FOLDER));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.CREATE_ALONE_LIST_SUCCESS, data));
  } catch (error) {
    logger.logger.error(`POST, /list/alone, 혼자 패킹리스트 생성, 500, ${error}`);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

/**
 *  @route GET /list/alone/:listId
 *  @desc read alone list
 *  @access private
 **/
const getAloneList = async (req: Request, res: Response) => {
  let client;
  const { listId } = req.params;

  try {
    client = await db.connect(req);

    const data = await AloneListService.getAloneList(client, listId);

    if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.success(statusCode.NOT_FOUND, message.NO_LIST));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.READ_ALONE_LIST_SUCCESS, data));
  } catch (error) {
    logger.logger.error(`GET, /list/alone/:listId, 혼자 패킹리스트 조회, 500, ${error}`);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

/**
 *  @route DELETE /list/alone/:folderId/:listId
 *  @desc delete alone list
 *  @access private
 **/
const deleteAloneList = async (req: Request, res: Response) => {
  let client;
  const userId: number = req.body.user.id;
  const { folderId } = req.params;
  const { listId } = req.params;

  try {
    client = await db.connect(req);

    const data = await AloneListService.deleteAloneList(client, userId, folderId, listId);

    if (data === 'no_folder')
      res.status(statusCode.NOT_FOUND).send(util.success(statusCode.NOT_FOUND, message.NO_FOLDER));
    else if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.success(statusCode.NOT_FOUND, message.NO_LIST));
    else if (data === 'no_folder_list')
      res
        .status(statusCode.NOT_FOUND)
        .send(util.success(statusCode.NOT_FOUND, message.NO_FOLDER_LIST));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.DELETE_ALONE_LIST_SUCCESS, data));
  } catch (error) {
    logger.logger.error(
      `DELETE, /list/alone/:folderId/:listId, 혼자 패킹리스트 삭제, 500, ${error}`,
    );
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

/**
 *  @route GET /list/alone/invite/:inviteCode
 *  @desc get invite alone list
 *  @access private
 **/
const getInviteAloneList = async (req: Request, res: Response) => {
  let client;

  const userId = req.body.user.id;
  const { inviteCode } = req.params;

  try {
    client = await db.connect(req);

    const data = await AloneListService.getInviteAloneList(client, userId, inviteCode);

    if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.success(statusCode.NOT_FOUND, message.NO_LIST));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.GET_INVITE_ALONE_LIST_SUCCESS, data));
  } catch (error) {
    logger.logger.error(`GET, /list/alone/invite/:inviteCode, 혼자 패킹리스트 초대, 500, ${error}`);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

export default {
  createAloneList,
  getAloneList,
  deleteAloneList,
  getInviteAloneList,
};
