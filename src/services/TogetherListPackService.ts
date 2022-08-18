import { PackDeleteDto, PackResponseDto } from '../interfaces/IPack';

const deletePack = async (
  client: any,
  packDeleteDto: PackDeleteDto,
): Promise<PackResponseDto | string> => {
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

    const { rows } = await client.query(
      `
      DELETE FROM "pack"
      WHERE id = $1
      `,
      [packDeleteDto.packId],
    );

    const { rows: category } = await client.query(
      `
      SELECT    c.id,
      c.name,
      coalesce(json_agg( json_build_object( 'id', p.ID::text, 'name', p.name, 'is_checked', p.is_checked,'packer',
      CASE
                WHEN u.id IS NULL THEN NULL
                ELSE json_build_object('id', u.ID::text, 'name', u.nickname)
                end) ORDER BY p.id) filter( WHERE p.id IS NOT NULL ), '[]' ) AS pack
      FROM      category c
      LEFT JOIN pack p
      ON        c.id = p.category_id
      LEFT JOIN "user" u
      ON        u.id = p.packer_id
      WHERE     c.list_id = $1
      GROUP BY  c.id
      ORDER BY  c.id
      `,
      [packDeleteDto.listId],
    );

    const packResponseDto: PackResponseDto = {
      id: packDeleteDto.listId,
      category: category,
    };
    return packResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  deletePack,
};
