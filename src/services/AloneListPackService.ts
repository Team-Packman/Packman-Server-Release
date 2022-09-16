import { PackCreateDto, PackUpdateDto, PackDeleteDto } from '../interfaces/IPack';
import { AloneListCategoryResponseDto } from '../interfaces/IAloneList';
import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';
import { aloneListCategoryCheckResponse } from '../modules/aloneListCategoryCheckResponse';

const createPack = async (
  client: any,
  userId: number,
  packCreateDto: PackCreateDto,
): Promise<AloneListCategoryResponseDto | string> => {
  try {
    if (packCreateDto.name.length > 12) return 'exceed_len';

    const check = await aloneListCategoryCheckResponse(
      client,
      userId,
      packCreateDto.listId,
      packCreateDto.categoryId,
    );

    if (check === 'no_list') return 'no_list';
    else if (check === 'no_category') return 'no_category';
    else if (check === 'no_list_category') return 'no_list_category';

    await client.query('BEGIN');

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

    await client.query('COMMIT');

    return aloneListCategoryResponseDto;
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(error);
    throw error;
  }
};

const updatePack = async (
  client: any,
  userId: number,
  packUpdateDto: PackUpdateDto,
): Promise<AloneListCategoryResponseDto | string> => {
  try {
    if (packUpdateDto.name.length > 12) return 'exceed_len';

    const check = await aloneListCategoryCheckResponse(
      client,
      userId,
      packUpdateDto.listId,
      packUpdateDto.categoryId,
    );

    if (check === 'no_list') return 'no_list';
    else if (check === 'no_category') return 'no_category';
    else if (check === 'no_list_category') return 'no_list_category';

    await client.query('BEGIN');

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

    await client.query('COMMIT');

    return aloneListCategoryResponseDto;
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(error);
    throw error;
  }
};

const deletePack = async (
  client: any,
  userId: number,
  packDeleteDto: PackDeleteDto,
): Promise<AloneListCategoryResponseDto | string> => {
  try {
    const check = await aloneListCategoryCheckResponse(
      client,
      userId,
      packDeleteDto.listId,
      packDeleteDto.categoryId,
    );

    if (check === 'no_list') return 'no_list';
    else if (check === 'no_category') return 'no_category';
    else if (check === 'no_list_category') return 'no_list_category';

    await client.query('BEGIN');

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

    await client.query('COMMIT');

    return aloneListCategoryResponseDto;
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(error);
    throw error;
  }
};

export default {
  createPack,
  updatePack,
  deletePack,
};
