import { PackCreateDto, PackUpdateDto, PackDeleteDto } from '../interfaces/IPack';
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
    if (existCategory[0].list_id != packCreateDto.listId) return 'no_list_category';

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

    if (existPack[0].category_id != packUpdateDto.categoryId) return 'no_category_pack';

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

    if (existCategory[0].list_id != packUpdateDto.listId) return 'no_list_category';

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
  createPack,
  updatePack,
  deletePack,
};
