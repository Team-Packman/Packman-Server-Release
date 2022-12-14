import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import db from '../loaders/db';
import { MemberService } from '../services';
import logger from '../config/logger';

/**
 *  @route GET /member/:groupId
 *  @desc get members in group
 *  @access private
 **/
const getMember = async (req: Request, res: Response) => {
  let client;

  const { groupId } = req.params;
  const userId: number = req.body.user.id;

  try {
    client = await db.connect(req);

    const data = await MemberService.getMember(client, userId, groupId);

    if (data === 'no_group') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_GROUP));
    } else if (data === 'empty_member') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EMPTY_MEMBER));
    } else if (data === 'no_member_user') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_MEMBER_USER));
    } else if (data === 'no_list') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_LIST));
    } else {
      res.status(statusCode.OK).send(util.success(statusCode.OK, message.SUCCESS_GET_MEMBER, data));
    }
  } catch (error) {
    logger.logger.error(`GET, /member/:groupId, 함께 패킹 그룹 멤버 조회, 500, ${error}`);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

/**
 *  @route DELETE /member/:groupId/:memberId
 *  @desc delete member in group
 *  @access private
 **/
const deleteMember = async (req: Request, res: Response) => {
  let client;

  const { groupId, memberId } = req.params;
  const userId = req.body.user.id;

  try {
    client = await db.connect(req);

    const data = await MemberService.deleteMember(client, userId, groupId, memberId);

    if (data === 'no_user') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_USER));
    } else if (data === 'no_group') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_GROUP));
    } else if (data === 'empty_member') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EMPTY_MEMBER));
    } else if (data === 'no_maker') {
      res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_MAKER));
    } else if (data === 'no_delete_maker') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_DELETE_MAKER));
    } else if (data === 'no_member_user') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_MEMBER_USER));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.SUCCESS_DELETE_MEMBER, data));
    }
  } catch (error) {
    logger.logger.error(
      `DELETE, /member/:groupId/:memberId, 함께 패킹 그룹 멤버 삭제, 500, ${error}`,
    );
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

export default {
  getMember,
  deleteMember,
};
