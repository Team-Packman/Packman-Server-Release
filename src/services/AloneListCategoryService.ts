import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';
import { CategoryCreateDto, CategoryUpdateDto, CategoryDeleteDto } from '../interfaces/ICategory';
import { AloneListCategoryResponseDto } from '../interfaces/IAloneList';
import { aloneListCategoryCheckResponse } from '../modules/aloneListCategoryCheckResponse';

const createCategory = async (
  client: any,
  userId: number,
  categoryCreateDto: CategoryCreateDto,
): Promise<AloneListCategoryResponseDto | string> => {
  try {
    if (categoryCreateDto.name.length > 12) {
      return 'exceed_len';
    }

    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "folder" f
        JOIN folder_packing_list fpl on f.id = fpl.folder_id
        JOIN packing_list pl on fpl.list_id = pl.id
        JOIN alone_packing_list apl on pl.id = apl.id
        WHERE f.user_id =$1 AND apl.id = $2 AND pl.is_deleted = false      
      `,
      [userId, categoryCreateDto.listId],
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

    await client.query('BEGIN');

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
    await client.query('COMMIT');

    return aloneListCategoryResponseDto;
  } catch (error) {
    await client.query('ROLLBACK');

    console.log(error);
    throw error;
  }
};

const updateCategory = async (
  client: any,
  userId: number,
  categoryUpdateDto: CategoryUpdateDto,
): Promise<AloneListCategoryResponseDto | string> => {
  try {
    if (categoryUpdateDto.name.length > 12) {
      return 'exceed_len';
    }
    const check = await aloneListCategoryCheckResponse(
      client,
      userId,
      categoryUpdateDto.listId,
      categoryUpdateDto.id,
    );

    if (check === 'no_list') return 'no_list';
    else if (check === 'no_category') return 'no_category';
    else if (check === 'no_list_category') return 'no_list_category';

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

    await client.query('BEGIN');

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

    await client.query('COMMIT');

    return aloneListResponseDto;
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(error);
    throw error;
  }
};

const deleteCategory = async (
  client: any,
  userId: number,
  categoryDeleteDto: CategoryDeleteDto,
): Promise<AloneListCategoryResponseDto | string> => {
  try {
    const check = await aloneListCategoryCheckResponse(
      client,
      userId,
      categoryDeleteDto.listId,
      categoryDeleteDto.categoryId,
    );

    if (check === 'no_list') return 'no_list';
    else if (check === 'no_category') return 'no_category';
    else if (check === 'no_list_category') return 'no_list_category';

    await client.query('BEGIN');

    await client.query(
      `
        DELETE FROM "category" as c
        WHERE c.id = $1 
      `,
      [categoryDeleteDto.categoryId],
    );

    const category = await aloneCategoryResponse(client, categoryDeleteDto.listId);

    const aloneListCategoryResponseDto: AloneListCategoryResponseDto = {
      id: categoryDeleteDto.listId,
      category: category,
    };
    await client.query('COMMIT');

    return aloneListCategoryResponseDto;
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(error);
    throw error;
  }
};

export default {
  createCategory,
  updateCategory,
  deleteCategory,
};
