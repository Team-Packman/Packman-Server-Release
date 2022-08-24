import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';
import { CategoryCreateDto, CategoryUpdateDt } from '../interfaces/ICategory';
import { AloneListCategoryResponseDto } from '../interfaces/IAloneList';

const createCategory = async (
  client: any,
  categoryCreateDto: CategoryCreateDto,
): Promise<AloneListCategoryResponseDto | string> => {
  try {
    if (categoryCreateDto.name.length > 12) {
      return 'exceed_len';
    }
    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "packing_list" as pl
        JOIN alone_packing_list apl on pl.id = apl.id
        WHERE apl.id = $1 and pl.is_deleted = false
      `,
      [categoryCreateDto.listId],
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

    const category = await aloneCategoryResponse(client, categoryCreateDto.listId);
    const aloneListCategoryResponseDto: AloneListCategoryResponseDto = {
      id: categoryCreateDto.listId,
      category: category,
    };

    return aloneListCategoryResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


const updateCategory = async (
  client: any,
  categoryUpdateDto: CategoryUpdateDto,
): Promise<AloneListCategoryResponseDto | string> => {
  try {
    if (categoryUpdateDto.name.length > 12) {
      return 'exceed_len';
    }
    const { rows: existList } = await client.query(
        `
        SELECT *
        FROM "packing_list" as pl
        JOIN alone_packing_list apl on pl.id = apl.id
        WHERE apl.id = $1 and pl.is_deleted = false
      `,
      [categoryUpdateDto.listId],
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

    const category = await aloneCategoryResponse(client, categoryUpdateDto.listId);

    const aloneListResponseDto: AloneListCategoryResponseDto = {
      id: categoryUpdateDto.listId,
      category: category,
    };

    return aloneListResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  createCategory,
  updateCategory,
};