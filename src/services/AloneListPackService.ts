import { PackUpdateDto } from '../interfaces/IPack';
import { AloneListCategoryResponseDto } from '../interfaces/IAloneList';
import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';

const updatePack = async (
  client: any,
  packUpdateDto: PackUpdateDto,
): Promise<AloneListCategoryResponseDto | string> => {
  try {
    if (packUpdateDto.name.length > 12) return 'exceed_len';

    const { rows: existPack } = await client.query(
      `
      SELECT *
      FROM "pack" as p
      WHERE p.id = $1
      `,
      [packUpdateDto.id],
    );

    if (existPack.length === 0) return 'no_pack';

    const { rows: existList } = await client.query(
      `
      SELECT *
      FROM "packing_list" as pl
      JOIN alone_packing_list apl on pl.id = apl.id
      WHERE apl.id = $1 and pl.is_deleted = false
      `,
      [packUpdateDto.listId],
    );

    if (existList.length === 0) return 'no_list';

    const { rows: existCategory } = await client.query(
      `
      SELECT *
      FROM "category" as c
      WHERE c.id = $1
      `,
      [packUpdateDto.categoryId],
    );

    if (existCategory.length === 0) return 'no_category';

    const { rows: existListCategory } = await client.query(
      `
      SELECT *
      FROM "category" as c
      WHERE c.id = $1 AND c.list_id = $2
      `,
      [packUpdateDto.categoryId, packUpdateDto.listId],
    );

    if (existListCategory.length === 0) return 'no_list_category';
    const { rows: existCategoryPack } = await client.query(
      `
      SELECT *
      FROM "pack" as p
      WHERE p.id = $1 AND p.category_id = $2
      `,
      [packUpdateDto.id, packUpdateDto.categoryId],
    );

    if (existCategoryPack.length === 0) return 'no_category_pack';

    await client.query(
      `
      UPDATE "pack"
      SET name = $1, is_checked = $2
      WHERE id = $3
      `,
      [packUpdateDto.name, packUpdateDto.isChecked, packUpdateDto.id],
    );

    const category = await aloneCategoryResponse(client, packUpdateDto.listId);

    const aloneListCategoryResponseDto: AloneListCategoryResponseDto = {
      id: packUpdateDto.listId,
      category: category,
    };
    return aloneListCategoryResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  updatePack,
};
