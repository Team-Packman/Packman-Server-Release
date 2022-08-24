import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import db from '../loaders/db';

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
      .send(util.success(statusCode.OK, message.GET_ALONETEMPLATE_SUCCESS, data));
  } catch (error) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

export default {};
