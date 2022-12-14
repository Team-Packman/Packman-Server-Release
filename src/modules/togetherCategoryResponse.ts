import { TogetherCategoryResponseDto } from '../interfaces/ICategory';

async function togetherCategoryResponse(
  client: any,
  togetherListId: string,
): Promise<TogetherCategoryResponseDto[]> {
  try {
    const { rows: category } = await client.query(
      ` 
      SELECT c.id::text, c.name, COALESCE(JSON_AGG(json_build_object(
          'id', p.id::text,
          'name', p.name, 
          'isChecked', p.is_checked, 
          'packer', 
          CASE WHEN (u.id IS NOT NULL AND u.is_deleted = false) THEN json_build_object('id', u.id::text, 'nickname', u.nickname)
          END) ORDER BY p.id
        ) FILTER (WHERE p.id IS NOT NULL), '[]') AS pack
      FROM "category" as c 
      LEFT JOIN "pack" as p ON c.id = p.category_id
      LEFT JOIN "user" as u ON u.id = p.packer_id
      WHERE c.list_id = $1
      GROUP BY c.id
      ORDER BY c.id
      `,
      [togetherListId],
    );

    return category;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { togetherCategoryResponse };
