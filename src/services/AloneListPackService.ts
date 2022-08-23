import { PackCreateDto } from '../interfaces/IPack';
import { AloneListCategoryResponseDto } from '../interfaces/IAloneList';
import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';

const createPack = async (
  client: any,
  packCreateDto: PackCreateDto,
): Promise<AloneListCategoryResponseDto | string> => {
  try {
    if (packCreateDto.name.length > 12) return 'exceed_len';

    const { rows: existList } = await client.query(
      `
      SELECT *
      FROM "packing_list" as pl
      JOIN alone_packing_list apl on pl.id = apl.id
      WHERE apl.id = $1 and pl.is_deleted = false
      `,
      [packCreateDto.listId],
    );

    if (existList.length === 0) return 'no_list';

    const { rows: existCategory } = await client.query(
      `
      SELECT *
      FROM "category" as c
      WHERE c.id = $1
      `,
      [packCreateDto.categoryId],
    );

    if (existCategory.length === 0) return 'no_category';

    const { rows: existListCategory } = await client.query(
      `
      SELECT *
      FROM "category" as c
      WHERE c.id = $1 AND c.list_id = $2
      `,
      [packCreateDto.categoryId, packCreateDto.listId],
    );

    if (existListCategory.length === 0) return 'no_list_category';

    await client.query(
      `
      INSERT INTO "pack" (category_id, name)
      VALUES ($1, $2)
      `,
      [packCreateDto.categoryId, packCreateDto.name],
    );

    const category = await aloneCategoryResponse(client, packCreateDto.listId);

    const aloneListCategoryResponseDto: AloneListCategoryResponseDto = {
      id: packCreateDto.listId,
      category: category,
    };
    return aloneListCategoryResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  createPack,
};
