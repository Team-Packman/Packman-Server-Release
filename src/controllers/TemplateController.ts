import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import db from '../loaders/db';
import { TemplateService } from '../services';

/**
 *  @route GET /template/:templateId/:isAloned
 *  @desc Get togther Template
 *  @access private
 **/

const getTemplate = async (req: Request, res: Response) => {
  let client;
  const { templateId, type } = req.params;
  try {
    client = await db.connect(req);
    const data = await TemplateService.getTemplate(client, templateId, type);

    if (data == 'no_template') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_TEMPLATE));
    } else if (data == 'no_type') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_TEMPLATE_TYPE));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.READ_DETAILEDTEMPLTATE_SUCCESS, data));
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
  getTemplate,
};
