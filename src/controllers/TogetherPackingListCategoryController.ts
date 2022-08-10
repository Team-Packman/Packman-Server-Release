import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { CategoryCreateDto, CategoryDeleteDto, CategoryUpdateDto } from '../interfaces/ICategory';
import { TogetherPackingListCategoryService } from '../services';
import config from '../config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../loaders/db');

/**
 *  @route POST /category
 *  @desc create category
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

  try {
    client = await db.connect(req);
    const data = await TogetherPackingListCategoryService.createCategory(client, categoryCreateDto);

    if (data === 'exceed_len') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.EXCEED_LENGTH));
    } else if (data === 'no_list') {
      res
        .status(statusCode.NOT_FOUND)
        .send(util.fail(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
    } else if (data === 'duplicate_category') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.DUPLICATED_CATEGORY));
    } else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.CREATE_TOGETHER_CATEGORY_SUCCESS, data));
    }
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  }
};

/**
 *  @route PATCH /category
 *  @desc update category
 *  @access private
 **/

const updateCategory = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(util.fail(statusCode.BAD_REQUEST, message.NULL_VALUE));
  }

  const categoryUpdateDto: CategoryUpdateDto = req.body;

  try {
    const client = await db.connect(req);
    const data = await TogetherPackingListCategoryService.updateCategory(client, categoryUpdateDto);

    if (data === 'no_list') {
      res
        .status(statusCode.NOT_FOUND)
        .send(util.fail(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
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
        .send(util.success(statusCode.OK, message.UPDATE_TOGETHER_CATEGORY_SUCCESS, data));
    }
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  }
};


/**
 *  @route DELETE /category
 *  @desc delete category
 *  @access private
 **/

const deleteCategory = async (req: Request, res: Response) => {
  const { listId, categoryId } = req.params;
  const listIdToInt: number = parseInt(listId);
  const categoryIdToInt: number = parseInt(categoryId);
  const categoryDeleteDto: CategoryDeleteDto = {
    listId: listIdToInt, 
    categoryId: categoryIdToInt
  };
  try {
    const client = await db.connect(req);
    const data = await TogetherPackingListCategoryService.deleteCategory(client, categoryDeleteDto);
    if (data === 'no_list') {
      res
        .status(statusCode.NOT_FOUND)
        .send(util.fail(statusCode.NOT_FOUND, message.NO_PACKINGLIST));
    } else if (data === 'no_category') {
      res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_CATEGORY));
    } else if (data === 'no_list_category') {
      res
        .status(statusCode.BAD_REQUEST)
        .send(util.fail(statusCode.BAD_REQUEST, message.NO_LIST_CATEGORY));
    }  else {
      res
        .status(statusCode.OK)
        .send(util.success(statusCode.OK, message.UPDATE_TOGETHER_CATEGORY_SUCCESS, data));
    }
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
  }
};


export default {
  createCategory,
  updateCategory,
  deleteCategory
};
