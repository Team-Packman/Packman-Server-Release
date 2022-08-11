import { PackCreateDto, PackResponseDto } from '../interfaces/IPack';

import convertSnakeToCamel from '../modules/convertSnakeToCamel';

const createPack = async (client: any, packCreateDto: PackCreateDto): Promise<PackResponseDto> => {
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

export default {
  createPack,
};
