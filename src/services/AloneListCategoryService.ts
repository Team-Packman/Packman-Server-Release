import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';
import { CategoryCreateDto } from '../interfaces/ICategory';
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
        WHERE pl.id = $1 AND pl.is_deleted = false
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

export default {
  createCategory,
};
