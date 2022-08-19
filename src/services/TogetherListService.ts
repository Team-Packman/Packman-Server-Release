// eslint-disable-next-line @typescript-eslint/no-var-requires
import {
  OnlyTogetherListResponseDto,
  PackerUpdateDto,
  TogetherListCreateDto,
  TogetherListResponseDto,
} from '../interfaces/ITogetherList';

const updatePacker = async (
  client: any,
  packerUpdateDto: PackerUpdateDto,
): Promise<OnlyTogetherListResponseDto | null | string> => {
  try {
    const { rows: existList } = await client.query(
      `
      SELECT *
      FROM "packing_list" pl
      WHERE pl.id =$1  AND pl.is_deleted=false
      `,
      [packerUpdateDto.listId],
    );
    if (existList.length === 0) return 'no_list';

    const { rows: existPack } = await client.query(
      `
      SELECT *
      FROM "pack" p
      WHERE p.id = $1 
      `,
      [packerUpdateDto.packId],
    );
    if (existPack.length === 0) return 'no_pack';

    const { rows: existListPack } = await client.query(
      `
      SELECT *
      FROM "packing_list" pl
      JOIN "category" c ON pl.id=c.list_id
      JOIN "pack" p ON c.id=p.category_id
      WHERE pl.id=$1 AND p.id =$2
    `,
      [packerUpdateDto.listId, packerUpdateDto.packId],
    );
    if (existListPack.length === 0) return 'no_list_pack';

    await client.query(
      `
      UPDATE "pack"
      SET packer_id=$1
      WHERE id=$2
    `,
      [packerUpdateDto.packerId, packerUpdateDto.packId],
    );

    const { rows: togetherListCategoryArray } = await client.query(
      `
      SELECT c.id::text AS "id", c.name AS "name",
        COALESCE(json_agg(json_build_object(
          'id', p.id::text,
          'name', p.name,
          'isChecked', p.is_checked,
          'packer',
          CASE
              WHEN p.packer_id IS NULL THEN NULL
              ELSE json_build_object('id', u.id::text, 'nickname', u.nickname )
          END) ORDER BY p.id) FILTER(WHERE p.id IS NOT NULL),'[]') AS "pack"

      FROM "category" c
      LEFT JOIN "pack" p ON c.id = p.category_id
      LEFT JOIN "user" u ON p.packer_id = u.id
      WHERE c.list_id=$1

      GROUP BY c.id
      ORDER BY c.id
      `,
      [packerUpdateDto.listId],
    );

    const data: OnlyTogetherListResponseDto = {
      id: packerUpdateDto.listId,
      category: togetherListCategoryArray,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  createTogetherList,
  readTogetherList,
  updatePacker,
};
