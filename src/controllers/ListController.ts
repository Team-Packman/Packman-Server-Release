import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { TitleUpdateDto, DateUpdateDto, MyTemplateUpdateDto } from '../interfaces/IList';
import { ListService } from '../services';
import db from '../loaders/db';

/**
 *  @route GET /invite/:inviteCode
 *  @desc invite list
 *  @access private
 **/
const inviteList = async (req: Request, res: Response) => {
  let client;

  const inviteCode = req.params.inviteCode;
  try {
    client = await db.connect(req);
    const data = await ListService.getPackingByInviteCode(client, inviteCode);
    if (data === 'no_list') {
      res
        .status(statusCode.NOT_FOUND)
        .send(util.fail(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.SUCCESS_INVITE_TOGETHER_PACKING, data));
    }
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

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

  const titleUpdateDto: TitleUpdateDto = req.body;

  try {
    client = await db.connect(req);

    const data = await ListService.updateTitle(client, titleUpdateDto);

    if (data === 'exceed_len')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.success(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    else if (data === 'no_list')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_PACKINGLIST));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.UPDATE_PACKINGLIST_TITLE_SUCCESS, data));
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

  const dateUpdateDto: DateUpdateDto = req.body;

  try {
    client = await db.connect(req);

    const data = await ListService.updateDate(client, dateUpdateDto);

    if (data === 'no_list')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_PACKINGLIST));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.UPDATE_PACKINGLIST_DATE_SUCCESS, data));
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

  const myTemplateUpdateDto: MyTemplateUpdateDto = req.body;

  try {
    client = await db.connect(req);

    const userId: number = req.body.user.id;
    const data = await ListService.updateMyTemplate(client, userId, myTemplateUpdateDto);

    if (data === 'no_list')
      res
        .status(statusCode.NOT_FOUND)
        .send(util.fail(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
    else if (data === 'no_template')
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_TEMPLATE));
    else
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.UPDATE_PACKINGLIST_MYTEMPLATE_SUCCESS, data));
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
  inviteList,
  updateDate,
  updateTitle,
  updateMyTemplate,
};
