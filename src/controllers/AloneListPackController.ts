import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { PackCreateDto, PackUpdateDto, PackDeleteDto } from '../interfaces/IPack';
import { AloneListPackService } from '../services';
import db from '../loaders/db';
import logger from '../config/logger';

/**
 *  @route POST /list/alone/pack
 *  @desc create alone Pack
 *  @access private
 **/
const createPack = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }

  let client;

  const packCreateDto: PackCreateDto = req.body;
  const userId = req.body.user.id;

  try {
    client = await db.connect(req);

    const data = await AloneListPackService.createPack(client, userId, packCreateDto);

    if (data === 'exceed_len')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    else if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_ALONE_LIST));
    else if (data === 'no_category')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_CATEGORY));
    else if (data === 'no_list_category')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_LIST_CATEGORY));
    else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.CREATE_ALONE_PACK_SUCCESS, data));
    }
  } catch (error) {
    logger.logger.error(`POST, /list/alone/pack, 혼자 패킹리스트 짐 생성, 500, ${error}`);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

/**
 *  @route PATCH /list/alone/pack
 *  @desc update alone Pack
 *  @access private
 **/
const updatePack = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }

  let client;

  const packUpdateDto: PackUpdateDto = req.body;
  const userId = req.body.user.id;

  try {
    client = await db.connect(req);

    const data = await AloneListPackService.updatePack(client, userId, packUpdateDto);

    if (data === 'exceed_len')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    else if (data === 'no_pack')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_PACK));
    else if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_ALONE_LIST));
    else if (data === 'no_category')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_CATEGORY));
    else if (data === 'no_list_category')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_LIST_CATEGORY));
    else if (data === 'no_category_pack')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_CATEGORY_PACK));
    else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.UPDATE_ALONE_PACK_SUCCESS, data));
    }
  } catch (error) {
    logger.logger.error(`PATCH, /list/alone/pack, 혼자 패킹리스트 짐 수정, 500, ${error}`);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

/**
 *  @route DELETE /list/alone/pack/:listId/:categoryId/:packId
 *  @desc delete alone Pack
 *  @access private
 **/
const deletePack = async (req: Request, res: Response) => {
  let client;

  const { listId, categoryId, packId } = req.params;

  const packDeleteDto: PackDeleteDto = {
    listId: listId,
    categoryId: categoryId,
    packId: packId,
  };
  const userId = req.body.user.id;

  try {
    client = await db.connect(req);
    const data = await AloneListPackService.deletePack(client, userId, packDeleteDto);

    if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_ALONE_LIST));
    else if (data === 'no_category')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_CATEGORY));
    else if (data === 'no_pack')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_PACK));
    else if (data === 'no_list_category')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_LIST_CATEGORY));
    else if (data === 'no_category_pack')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_CATEGORY_PACK));
    else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.DELETE_ALONE_PACK_SUCCESS, data));
    }
  } catch (error) {
    logger.logger.error(
      `DELETE, /list/alone/pack/:listId/:categoryId/:packId, 혼자 패킹리스트 짐 삭제, 500, ${error}`,
    );
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

export default {
  createPack,
  updatePack,
  deletePack,
};
