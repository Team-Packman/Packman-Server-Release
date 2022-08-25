import { PackCreateDto, PackUpdateDto, PackDeleteDto } from '../interfaces/IPack';
import { TogetherListCategoryResponseDto } from '../interfaces/ITogetherList';
import { togetherCategoryResponse } from '../modules/togetherCategoryResponse';

const createPack = async (
  client: any,
  packCreateDto: PackCreateDto,
): Promise<TogetherListCategoryResponseDto | string> => {
  try {
    if (packCreateDto.name.length > 12) return 'exceed_len';

    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "packing_list" as pl
        WHERE pl.id = $1
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

    const category = await togetherCategoryResponse(client, packCreateDto.listId);

    const togetherListCategoryResponseDto: TogetherListCategoryResponseDto = {
      id: packCreateDto.listId,
      category: category,
    };
    return togetherListCategoryResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updatePack = async (
  client: any,
  packUpdateDto: PackUpdateDto,
): Promise<TogetherListCategoryResponseDto | string> => {
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
        WHERE pl.id = $1
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

    const category = await togetherCategoryResponse(client, packUpdateDto.listId);

    const togetherListCategoryResponseDto: TogetherListCategoryResponseDto = {
      id: packUpdateDto.listId,
      category: category,
    };
    return togetherListCategoryResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deletePack = async (
  client: any,
  packDeleteDto: PackDeleteDto,
): Promise<TogetherListCategoryResponseDto | string> => {
  try {
    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "packing_list" as pl
        WHERE pl.id = $1
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

    const { rows: existPack } = await client.query(
      `
        SELECT *
        FROM "pack" as p
        WHERE p.id = $1
      `,
      [packDeleteDto.packId],
    );

    if (existPack.length === 0) return 'no_pack';

    const { rows: existListCategory } = await client.query(
      `
        SELECT *
        FROM "category" as c
        WHERE c.id = $1 AND c.list_id = $2
      `,
      [packDeleteDto.categoryId, packDeleteDto.listId],
    );

    if (existListCategory.length === 0) return 'no_list_category';
    const { rows: existCategoryPack } = await client.query(
      `
        SELECT *
        FROM "pack" as p
        WHERE p.id = $1 AND p.category_id = $2
      `,
      [packDeleteDto.packId, packDeleteDto.categoryId],
    );

    if (existCategoryPack.length === 0) return 'no_category_pack';

    await client.query(
      `
        DELETE FROM "pack"
        WHERE id = $1
      `,
      [packDeleteDto.packId],
    );

    const category = await togetherCategoryResponse(client, packDeleteDto.listId);

    const togetherListCategoryResponseDto: TogetherListCategoryResponseDto = {
      id: packDeleteDto.listId,
      category: category,
    };
    return togetherListCategoryResponseDto;
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
