import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { TogetherPackingListPackService } from '../services';
import { PackCreateDto } from '../interfaces/IPack';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../loaders/db');

/**
 *  @route POST /packingList/together/pack
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

    const data = await TogetherPackingListPackService.createPack(client, packCreateDto);

    res
      .status(statusCode.OK)
      .send(util.success(statusCode.OK, message.CREATE_TOGETHER_PACK_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};

export default {
  createPack,
};
