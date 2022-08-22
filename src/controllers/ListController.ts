import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { ListService } from '../services';
import db from '../loaders/db';
import { validationResult } from 'express-validator';
import { MyTemplateUpdateDto } from '../interfaces/IList';

/**
 *  @route GET /invite/:inviteCode
 *  @desc invite packing list
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
 *  @desc update packing list title
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

    const data = await ListService.updateMyTemplate(client, myTemplateUpdateDto);

    if (data === 'no_list')
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_PACKINGLIST));
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
  updateMyTemplate,
};
