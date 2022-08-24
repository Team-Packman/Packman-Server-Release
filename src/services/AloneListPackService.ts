import { PackDeleteDto } from '../interfaces/IPack';
import { AloneListCategoryResponseDto } from '../interfaces/IAloneList';
import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';

const deletePack = async (
  client: any,
  packDeleteDto: PackDeleteDto,
): Promise<AloneListCategoryResponseDto | string> => {
  try {
    const { rows: existList } = await client.query(
      `
      SELECT *
      FROM "packing_list" as pl
      JOIN alone_packing_list apl on pl.id = apl.id
      WHERE apl.id = $1 and pl.is_deleted = false
      `,
      [packDeleteDto.listId],
    );

    if (existList.length === 0) return 'no_list';

    const { rows: existCategory } = await client.query(
      `
      SELECT *
      FROM "category" as c
      WHERE c.id = $1
      `,
      [packDeleteDto.categoryId],
    );

    if (existCategory.length === 0) return 'no_category';

    if (existCategory[0].list_id != packDeleteDto.listId) return 'no_list_category';

    const { rows: existPack } = await client.query(
      `
      SELECT *
      FROM "pack" as p
      WHERE p.id = $1
      `,
      [packDeleteDto.packId],
    );

    if (existPack.length === 0) return 'no_pack';

    if (existPack[0].category_id != packDeleteDto.categoryId) return 'no_category_pack';

    await client.query(
      `
      DELETE FROM "pack"
      WHERE id = $1
      `,
      [packDeleteDto.packId],
    );

    const category = await aloneCategoryResponse(client, packDeleteDto.listId);

    const aloneListCategoryResponseDto: AloneListCategoryResponseDto = {
      id: packDeleteDto.listId,
      category: category,
    };
    return aloneListCategoryResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  deletePack,
};
