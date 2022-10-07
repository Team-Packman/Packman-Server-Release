import { PackCreateDto, PackUpdateDto, PackDeleteDto } from '../interfaces/IPack';
import { TogetherListCategoryResponseDto } from '../interfaces/ITogetherList';
import { togetherListCategoryCheckResponse } from '../modules/togetherListCategoryCheckResponse';
import { togetherCategoryResponse } from '../modules/togetherCategoryResponse';

const createPack = async (
  client: any,
  userId: number,
  packCreateDto: PackCreateDto,
): Promise<TogetherListCategoryResponseDto | string> => {
  try {
    if (packCreateDto.name.length > 12) return 'exceed_len';

    const check = await togetherListCategoryCheckResponse(
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

    const category = await togetherCategoryResponse(client, packCreateDto.listId);

    const togetherListCategoryResponseDto: TogetherListCategoryResponseDto = {
      id: packCreateDto.listId,
      category: category,
    };

    await client.query('COMMIT');

    return togetherListCategoryResponseDto;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

const updatePack = async (
  client: any,
  userId: number,
  packUpdateDto: PackUpdateDto,
): Promise<TogetherListCategoryResponseDto | string> => {
  try {
    if (packUpdateDto.name.length > 12) return 'exceed_len';

    const check = await togetherListCategoryCheckResponse(
      client,
      userId,
      packUpdateDto.listId,
      packUpdateDto.categoryId,
    );

    if (check === 'no_list') return 'no_list';
    else if (check === 'no_category') return 'no_category';
    else if (check === 'no_list_category') return 'no_list_category';

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

    await client.query('BEGIN');

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

    await client.query('COMMIT');

    return togetherListCategoryResponseDto;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

const deletePack = async (
  client: any,
  userId: number,
  packDeleteDto: PackDeleteDto,
): Promise<TogetherListCategoryResponseDto | string> => {
  try {
    const check = await togetherListCategoryCheckResponse(
      client,
      userId,
      packDeleteDto.listId,
      packDeleteDto.categoryId,
    );

    if (check === 'no_list') return 'no_list';
    else if (check === 'no_category') return 'no_category';
    else if (check === 'no_list_category') return 'no_list_category';

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

    await client.query('BEGIN');

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

    await client.query('COMMIT');

    return togetherListCategoryResponseDto;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

export default {
  createPack,
  updatePack,
  deletePack,
};
