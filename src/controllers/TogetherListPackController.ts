import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { PackCreateDto, PackUpdateDto, PackDeleteDto } from '../interfaces/IPack';
import { TogetherListPackService } from '../services';
import db from '../loaders/db';

/**
 *  @route POST /list/together/pack
 *  @desc create together pack
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

    const data = await TogetherListPackService.createPack(client, userId, packCreateDto);

    if (data === 'exceed_len')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    else if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_LIST));
    else if (data === 'no_category')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_CATEGORY));
    else if (data === 'no_list_category')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_LIST_CATEGORY));
    else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.CREATE_TOGETHER_PACK_SUCCESS, data));
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
 *  @route PATCH /list/together/pack
 *  @desc update together pack
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

    const data = await TogetherListPackService.updatePack(client, userId, packUpdateDto);

    if (data === 'exceed_len')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    else if (data === 'no_pack')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_PACK));
    else if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_LIST));
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
        .send(util.success(statusCode.OK, message.UPDATE_TOGETHER_PACK_SUCCESS, data));
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
 *  @route DELETE /list/together/pack
 *  @desc delete together pack
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
    const data = await TogetherListPackService.deletePack(client, userId, packDeleteDto);

    if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_LIST));
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
        .send(util.success(statusCode.OK, message.DELETE_TOGETHER_PACK_SUCCESS, data));
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
  createPack,
  updatePack,
  deletePack,
};
