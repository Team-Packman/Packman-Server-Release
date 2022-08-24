import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { PackerUpdateDto } from '../interfaces/ITogetherList';
import TogetherListService from '../services/TogetherListService';
import db from '../loaders/db';
import { ListCreateDto } from '../interfaces/IList';

/**
 *  @route POST /list/together
 *  @desc create together packinglist
 *  @access private
 **/
const createTogetherList = async (req: Request, res: Response) => {
  let client;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }

  const userId: number = req.body.user.id;
  const togetherListCreateDto: ListCreateDto = req.body;

  try {
    client = await db.connect(req);

    const data = await TogetherListService.createTogetherList(
      client,
      userId,
      togetherListCreateDto,
    );

    if (data === 'exceed_len')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.success(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.CREATE_TOGETHERPACKINGLIST_SUCCESS, data));
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
    if (client !== undefined) client.release();
  }
};

/**
 *  @route PATCH /list/together/packer
 *  @desc update packer
 *  @access private
 **/
const updatePacker = async (req: Request, res: Response) => {
  let client;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }

  const packerUpdateDto: PackerUpdateDto = req.body;

  try {
    client = await db.connect(req);

    const data = await TogetherListService.updatePacker(client, packerUpdateDto);

    if (data === 'no_list')
      res
        .status(statusCode.NOT_FOUND)
        .send(util.success(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
    else if (data === 'no_pack')
      res.status(statusCode.NOT_FOUND).send(util.success(statusCode.NOT_FOUND, message.NO_PACK));
    else if (data === 'no_list_pack')
      res
        .status(statusCode.NOT_FOUND)
        .send(util.success(statusCode.NOT_FOUND, message.NO_LIST_PACK));
    else if (data === 'no_user')
      res.status(statusCode.NOT_FOUND).send(util.success(statusCode.NOT_FOUND, message.NO_USER));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.UPDATE_PACKER_SUCCESS, data));
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
 *  @route POST / add-member
 *  @desc add member
 *  @access private
 **/
const addMember = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }

  let client;
  const listId = req.body.listId;
  const userId = req.body.user.id;
  try {
    client = await db.connect(req);
    const data = await TogetherListService.addMember(client, listId, userId);
    if (data === 'no_list') {
      res
        .status(statusCode.NOT_FOUND)
        .send(util.fail(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
    } else if (data === 'already_exist_member') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.ALREADY_EXIST_MEMBER));
    } else {
      res.status(statusCode.OK).send(util.success(statusCode.OK, message.SUCCESS_ADD_MEMBER, data));
    }
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

export default {
  createTogetherList,
  readTogetherList,
  updatePacker,
  addMember,
};
