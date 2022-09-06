import { CategoryCreateDto, CategoryDeleteDto, CategoryUpdateDto } from '../interfaces/ICategory';
import { TogetherListCategoryResponseDto } from '../interfaces/ITogetherList';
import { togetherCategoryResponse } from '../modules/togetherCategoryResponse';

const createCategory = async (
  client: any,
  userId: number,
  categoryCreateDto: CategoryCreateDto,
): Promise<TogetherListCategoryResponseDto | string> => {
  try {
    if (categoryCreateDto.name.length > 12) {
      return 'exceed_len';
    }
    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "packing_list" as pl
        JOIN "together_packing_list" tpl on pl.id = tpl.id
        JOIN "user_group" ug ON tpl.group_id = ug.group_id
        WHERE tpl.id = $1 AND ug.user_id = $2 AND pl.is_deleted = false
      `,
      [categoryCreateDto.listId, userId],
    );

    if (existList.length === 0) {
      return 'no_list';
    }

    const { rows: existCategory } = await client.query(
      `
        SELECT * 
        FROM "category" as c 
        WHERE c.list_id = $1 AND c.name = $2
      `,
      [categoryCreateDto.listId, categoryCreateDto.name],
    );
    if (existCategory.length > 0) {
      return 'duplicate_category';
    }

    await client.query(
      `
        INSERT INTO "category" (list_id, name)
        VALUES ($1, $2)
      `,
      [categoryCreateDto.listId, categoryCreateDto.name],
    );

    const category = await togetherCategoryResponse(client, categoryCreateDto.listId);

    const togetherListCategoryResponseDto: TogetherListCategoryResponseDto = {
      id: categoryCreateDto.listId,
      category: category,
    };

    return togetherListCategoryResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateCategory = async (
  client: any,
  userId: number,
  categoryUpdateDto: CategoryUpdateDto,
): Promise<TogetherListCategoryResponseDto | string> => {
  try {
    if (categoryUpdateDto.name.length > 12) {
      return 'exceed_len';
    }
    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "packing_list" as pl
        JOIN "together_packing_list" tpl on pl.id = tpl.id
        JOIN "user_group" ug ON tpl.group_id = ug.group_id
        WHERE tpl.id = $1 AND ug.user_id = $2 AND pl.is_deleted = false
      `,
      [categoryUpdateDto.listId, userId],
    );
    if (existList.length === 0) {
      return 'no_list';
    }
    const { rows: existCategory } = await client.query(
      `
        SELECT *
        FROM "category" as c
        WHERE c.id = $1
      `,
      [categoryUpdateDto.id],
    );

    if (existCategory.length === 0) {
      return 'no_category';
    }
    if (existCategory[0].list_id != categoryUpdateDto.listId) {
      return 'no_list_category';
    }

    const { rows: duplicatedCategory } = await client.query(
      `
        SELECT * 
        FROM "category" as c 
        WHERE c.list_id = $1 AND c.name = $2
      `,
      [categoryUpdateDto.listId, categoryUpdateDto.name],
    );

    if (duplicatedCategory.length > 1) {
      return 'duplicated_category';
    } else if (duplicatedCategory.length === 1) {
      if (duplicatedCategory[0].id != categoryUpdateDto.id) {
        return 'duplicated_category';
      }
    }

    await client.query(
      `
        UPDATE "category" as c
        SET name = $2
        WHERE c.id = $1
      `,
      [categoryUpdateDto.id, categoryUpdateDto.name],
    );

    const category = await togetherCategoryResponse(client, categoryUpdateDto.listId);

    const togetherListResponseDto: TogetherListCategoryResponseDto = {
      id: categoryUpdateDto.listId,
      category: category,
    };

    return togetherListResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteCategory = async (
  client: any,
  userId: number,
  categoryDeleteDto: CategoryDeleteDto,
): Promise<TogetherListCategoryResponseDto | string> => {
  try {
    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "packing_list" as pl
        JOIN "together_packing_list" tpl on pl.id = tpl.id
        JOIN "user_group" ug ON tpl.group_id = ug.group_id
        WHERE tpl.id = $1 AND ug.user_id = $2 AND pl.is_deleted = false
      `,
      [categoryDeleteDto.listId, userId],
    );
    if (existList.length === 0) {
      return 'no_list';
    }
    const { rows: existCategory } = await client.query(
      `
        SELECT *
        FROM "category" as c
        WHERE c.id = $1
      `,
      [categoryDeleteDto.categoryId],
    );

    if (existCategory.length === 0) {
      return 'no_category';
    }
    if (existCategory[0].list_id != categoryDeleteDto.listId) {
      return 'no_list_category';
    }

    await client.query(
      `
        DELETE FROM "category" as c
        WHERE c.id = $1  AND c.list_id = $2
      `,
      [categoryDeleteDto.categoryId, categoryDeleteDto.listId],
    );

    const category = await togetherCategoryResponse(client, categoryDeleteDto.listId);

    const togetherListCategoryResponseDto: TogetherListCategoryResponseDto = {
      id: categoryDeleteDto.listId,
      category: category,
    };

    return togetherListCategoryResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  createCategory,
  updateCategory,
  deleteCategory,
};
