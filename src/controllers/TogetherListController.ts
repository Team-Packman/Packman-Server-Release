import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { TogetherListCreateDto } from '../interfaces/ITogetherList';
import TogetherListService from '../services/TogetherListService';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../loaders/db');

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
  const togetherListCreateDto: TogetherListCreateDto = req.body;

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
    client.release();
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
  try {
    client = await db.connect(req);
    const data = await TogetherListService.addMember(client, listId, '2'); // "4"는 user_id, 토큰 관련해서 생성되면 req.body.user로 받아올거
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
    client.release();
  }
};

export default {
  createTogetherList,
  addMember,
};
