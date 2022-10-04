import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { CategoryCreateDto, CategoryUpdateDto, CategoryDeleteDto } from '../interfaces/ICategory';
import { AloneListCategoryService } from '../services';
import db from '../loaders/db';
import logger from '../config/logger';

/**
 *  @route POST /list/alone/category
 *  @desc create alone category
 *  @access private
 **/
const createCategory = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }
  let client;
  const categoryCreateDto: CategoryCreateDto = req.body;
  const userId = req.body.user.id;
  try {
    client = await db.connect(req);
    const data = await AloneListCategoryService.createCategory(client, userId, categoryCreateDto);

    if (data === 'exceed_len') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    } else if (data === 'no_list') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_LIST));
    } else if (data === 'duplicate_category') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.DUPLICATED_CATEGORY));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.CREATE_ALONE_CATEGORY_SUCCESS, data));
    }
  } catch (error) {
    logger.logger.error(`POST, /list/alone/category, 혼자 패킹리스트 카테고리 생성, 500, ${error}`);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

/**
 *  @route PATCH /list/alone/category
 *  @desc update alone category
 *  @access private
 **/
const updateCategory = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }
  let client;
  const categoryUpdateDto: CategoryUpdateDto = req.body;
  const userId = req.body.user.id;
  try {
    client = await db.connect(req);
    const data = await AloneListCategoryService.updateCategory(client, userId, categoryUpdateDto);

    if (data === 'no_list') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_LIST));
    } else if (data === 'no_category') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_CATEGORY));
    } else if (data === 'no_list_category') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_LIST_CATEGORY));
    } else if (data === 'duplicated_category') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.DUPLICATED_CATEGORY));
    } else if (data === 'exceed_len') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.UPDATE_ALONE_CATEGORY_SUCCESS, data));
    }
  } catch (error) {
    logger.logger.error(
      `PATCH, /list/alone/category, 혼자 패킹리스트 카테고리 수정, 500, ${error}`,
    );
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

/**
 *  @route DELETE /list/alone/category
 *  @desc delete alone category
 *  @access private
 **/
const deleteCategory = async (req: Request, res: Response) => {
  let client;
  const { listId, categoryId } = req.params;

  const categoryDeleteDto: CategoryDeleteDto = {
    listId: listId,
    categoryId: categoryId,
  };
  const userId = req.body.user.id;
  try {
    client = await db.connect(req);
    const data = await AloneListCategoryService.deleteCategory(client, userId, categoryDeleteDto);
    if (data === 'no_list') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_LIST));
    } else if (data === 'no_category') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_CATEGORY));
    } else if (data === 'no_list_category') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_LIST_CATEGORY));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.DELETE_ALONE_CATEGORY_SUCCESS, data));
    }
  } catch (error) {
    logger.logger.error(
      `DELETE, /list/alone/category, 혼자 패킹리스트 카테고리 삭제, 500, ${error}`,
    );
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  } finally {
    if (client !== undefined) client.release();
  }
};

export default {
  createCategory,
  updateCategory,
  deleteCategory,
};
