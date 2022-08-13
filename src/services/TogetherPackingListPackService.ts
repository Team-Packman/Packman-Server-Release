import { PackCreateDto, PackResponseDto, PackUpdateDto } from '../interfaces/IPack';

import convertSnakeToCamel from '../modules/convertSnakeToCamel';

const createPack = async (
  client: any,
  packCreateDto: PackCreateDto,
): Promise<PackResponseDto | string> => {
  if (packCreateDto.name.length > 12) return 'exceed_len';

  const { rows: existList } = await client.query(
    `SELECT *
     FROM "packing_list" as pl
     WHERE pl.id = $1
    `,
    [packCreateDto.listId],
  );

  if (existList.length === 0) return 'no_list';

  const { rows: existCategory } = await client.query(
    `SELECT *
     FROM "category" as c
     WHERE c.id = $1
    `,
    [packCreateDto.categoryId],
  );

  if (existCategory.length === 0) return 'no_category';

  const { rows: existListCategory } = await client.query(
    `SELECT *
     FROM "category" as c
     WHERE c.id = $1 AND c.list_id = $2
    `,
    [packCreateDto.categoryId, packCreateDto.listId],
  );

  if (existListCategory.length === 0) return 'no_list_category';

  const { rows } = await client.query(
    `
    INSERT INTO "pack" (category_id, name)
    VALUES ($1, $2)
    `,
    [packCreateDto.categoryId, packCreateDto.name],
  );
  const { rows: category } = await client.query(
    `
    SELECT    c.id,
    c.name,
    coalesce(json_agg( json_build_object( 'id', p.ID::text, 'name', p.name, 'is_checked', p.is_checked,'packer',
    CASE
              WHEN u.id IS NULL THEN NULL
              ELSE json_build_object('id', u.ID::text, 'name', u.nickname)
              end)) filter( WHERE p.id IS NOT NULL ), '[]' ) AS pack
    FROM      category c
    LEFT JOIN pack p
    ON        c.id = p.category_id
    LEFT JOIN "user" u
    ON        u.id = p.packer_id
    WHERE     c.list_id = $1
    GROUP BY  c.id
    `,
    [packCreateDto.listId],
  );

  const packResponseDto: PackResponseDto = {
    id: packCreateDto.listId,
    category: category,
  };
  return convertSnakeToCamel.keysToCamel(packResponseDto);
};

const updatePack = async (
  client: any,
  packUpdateDto: PackUpdateDto,
): Promise<PackResponseDto | string> => {
  if (packUpdateDto.name.length > 12) return 'exceed_len';

  const { rows: existPack } = await client.query(
    `SELECT *
     FROM "pack" as p
     WHERE p.id = $1
    `,
    [packUpdateDto.id],
  );

  if (existPack.length === 0) return 'no_pack';

  const { rows: existList } = await client.query(
    `SELECT *
     FROM "packing_list" as pl
     WHERE pl.id = $1
    `,
    [packUpdateDto.listId],
  );

  if (existList.length === 0) return 'no_list';

  const { rows: existCategory } = await client.query(
    `SELECT *
     FROM "category" as c
     WHERE c.id = $1
    `,
    [packUpdateDto.categoryId],
  );

  if (existCategory.length === 0) return 'no_category';

  const { rows: existListCategory } = await client.query(
    `SELECT *
     FROM "category" as c
     WHERE c.id = $1 AND c.list_id = $2
    `,
    [packUpdateDto.categoryId, packUpdateDto.listId],
  );

  if (existListCategory.length === 0) return 'no_list_category';
  const { rows: existCategoryPack } = await client.query(
    `SELECT *
     FROM "pack" as p
     WHERE p.id = $1 AND p.category_id = $2
    `,
    [packUpdateDto.id, packUpdateDto.categoryId],
  );

  if (existCategoryPack.length === 0) return 'no_category_pack';

  const { rows } = await client.query(
    `
    UPDATE "pack"
    SET name = $1, is_checked = $2, updated_at = now()
    WHERE id = $3
    `,
    [packUpdateDto.name, packUpdateDto.isChecked, packUpdateDto.id],
  );

  const { rows: category } = await client.query(
    `
    SELECT    c.id,
    c.name,
    coalesce(json_agg( json_build_object( 'id', p.ID::text, 'name', p.name, 'isChecked', p.is_checked,'packer',
    CASE
              WHEN u.id IS NULL THEN NULL
              ELSE json_build_object('id', u.ID::text, 'name', u.nickname)
              end)) filter( WHERE p.id IS NOT NULL ), '[]' ) AS pack
    FROM      category c
    LEFT JOIN pack p
    ON        c.id = p.category_id
    LEFT JOIN "user" u
    ON        u.id = p.packer_id
    WHERE     c.list_id = $1
    GROUP BY  c.id
    `,
    [packUpdateDto.listId],
  );

  const packResponseDto: PackResponseDto = {
    id: packUpdateDto.listId,
    category: category,
  };
  return convertSnakeToCamel.keysToCamel(packResponseDto);
};

export default {
  createPack,
  updatePack,
};
