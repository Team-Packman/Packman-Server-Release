import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { TogetherListPackService } from '../services';
import { PackCreateDto, PackUpdateDto, PackDeleteDto } from '../interfaces/IPack';
import db from '../loaders/db';

/**
 *  @route POST /list/together/pack
 *  @desc create Pack
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

  try {
    client = await db.connect(req);

    const data = await TogetherListPackService.createPack(client, packCreateDto);

    if (data === 'exceed_len')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    else if (data === 'no_list')
      res
        .status(statusCode.NOT_FOUND)
        .send(util.fail(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
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
 *  @route PATCH /packingList/together/pack
 *  @desc update Pack
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
  try {
    client = await db.connect(req);

    const data = await TogetherListPackService.updatePack(client, packUpdateDto);

    if (data === 'exceed_len')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    else if (data === 'no_pack')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_PACK));
    else if (data === 'no_list')
      res
        .status(statusCode.NOT_FOUND)
        .send(util.fail(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
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
 *  @route DELETE /packingList/together/pack
 *  @desc delete Pack
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

  try {
    client = await db.connect(req);
    const data = await TogetherListPackService.deletePack(client, packDeleteDto);

    if (data === 'no_list')
      res
        .status(statusCode.NOT_FOUND)
        .send(util.fail(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
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
