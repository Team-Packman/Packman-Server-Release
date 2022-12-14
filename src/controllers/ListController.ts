import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { TitleUpdateDto, DateUpdateDto, MyTemplateUpdateDto } from '../interfaces/IList';
import { ListService } from '../services';
import db from '../loaders/db';
import logger from '../config/logger';

/**
 *  @route PATCH /list/title
 *  @desc update list title
 *  @access private
 **/

const updateTitle = async (req: Request, res: Response) => {
  let client;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }

  const userId: number = req.body.user.id;
  const titleUpdateDto: TitleUpdateDto = req.body;

  try {
    client = await db.connect(req);

    const data = await ListService.updateTitle(client, userId, titleUpdateDto);

    if (data === 'exceed_len')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.success(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    else if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_LIST));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.UPDATE_LIST_TITLE_SUCCESS, data));
  } catch (error) {
    logger.logger.error(`PATCH, /list/title, 패킹리스트 제목 수정, 500, ${error}`);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

/**
 *  @route PATCH /list/departureDate
 *  @desc update list departure date
 *  @access private
 **/

const updateDate = async (req: Request, res: Response) => {
  let client;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }
  const userId: number = req.body.user.id;
  const dateUpdateDto: DateUpdateDto = req.body;

  try {
    client = await db.connect(req);

    const data = await ListService.updateDate(client, userId, dateUpdateDto);

    if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_LIST));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.UPDATE_LIST_DATE_SUCCESS, data));
  } catch (error) {
    logger.logger.error(`PATCH, /list/departureDate, 패킹리스트 출발 날짜 수정, 500, ${error}`);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

/**
 *  @route PATCH /list/myTemplate
 *  @desc update list my template
 *  @access private
 **/

const updateMyTemplate = async (req: Request, res: Response) => {
  let client;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }

  const userId: number = req.body.user.id;
  const myTemplateUpdateDto: MyTemplateUpdateDto = req.body;

  try {
    client = await db.connect(req);

    const data = await ListService.updateMyTemplate(client, userId, myTemplateUpdateDto);

    if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_LIST));
    else if (data === 'no_template')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_TEMPLATE));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.UPDATE_LIST_MY_TEMPLATE_SUCCESS, data));
  } catch (error) {
    logger.logger.error(
      `PATCH, /list/myTemplate, 패킹리스트 나만의 템플릿 추가 및 업데이트, 500, ${error}`,
    );
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

/**
 *  @route GET /list/:listType/share/:inviteCode
 *  @desc get shared list
 *  @access public
 **/
const getSharedList = async (req: Request, res: Response) => {
  let client;

  const { listType, inviteCode } = req.params;

  try {
    client = await db.connect(req);

    const data = await ListService.getSharedList(client, listType, inviteCode);

    if (data === 'no_list')
      res.status(statusCode.NOT_FOUND).send(util.success(statusCode.NOT_FOUND, message.NO_LIST));
    else if (data === 'invalid_list_type')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.success(statusCode.BAD_REQUEST, message.INVALID_LIST_TYPE));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.GET_INVITE_LIST_SUCCESS, data));
  } catch (error) {
    logger.logger.error(
      `GET, /list/:listType/share/:inviteCode, 공유된 패킹리스트 조회, 500, ${error}`,
    );
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

export default {
  updateDate,
  updateTitle,
  updateMyTemplate,
  getSharedList,
};
