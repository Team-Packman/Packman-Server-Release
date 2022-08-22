import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { CategoryDeleteDto } from '../interfaces/ICategory';
import { AloneListCategoryService } from '../services';
import db from '../loaders/db';

/**
 *  @route DELETE /category
 *  @desc delete category
 *  @access private
 **/
 const deleteCategory = async (req: Request, res: Response) => {
    let client;
    const { listId, categoryId } = req.params;
  
    const categoryDeleteDto: CategoryDeleteDto = {
      listId: listId,
      categoryId: categoryId,
    };
    try {
      client = await db.connect(req);
      const data = await AloneListCategoryService.deleteCategory(client, categoryDeleteDto);
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
      } else {
        res
          .status(statusCode.OK)
          .send(util.success(statusCode.OK, message.DELETE_ALONE_CATEGORY_SUCCESS, data));
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
    deleteCategory,
  };
  