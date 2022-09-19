import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import db from '../loaders/db';
import { TemplateService } from '../services';

/**
 *  @route GET /template/alone
 *  @desc read alone template list
 *  @access private
 **/
const getAloneTemplateList = async (req: Request, res: Response) => {
  let client;
  const userId = req.body.user.id;

  try {
    client = await db.connect(req);

    const data = await TemplateService.getAloneTemplateList(client, userId);

    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, message.GET_ALONE_TEMPLATE_SUCCESS, data));
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
 *  @route GET /template/together
 *  @desc read together template list
 *  @access private
 **/
const getTogetherTemplateList = async (req: Request, res: Response) => {
  let client;
  const userId = req.body.user.id;

  try {
    client = await db.connect(req);

    const data = await TemplateService.getTogetherTemplateList(client, userId);

    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, message.GET_TOGETHER_TEMPLATE_SUCCESS, data));
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
 *  @route GET /template/:templateId
 *  @desc Get Template
 *  @access private
 **/

const getTemplate = async (req: Request, res: Response) => {
  let client;
  const { templateId } = req.params;
  const userId = req.body.user.id;
  try {
    client = await db.connect(req);
    const data = await TemplateService.getTemplate(client, userId, templateId);

    if (data == 'no_template') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_TEMPLATE));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.READ_DETAILED_TEMPLATE_SUCCESS, data));
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
  getAloneTemplateList,
  getTogetherTemplateList,
  getTemplate,
};
