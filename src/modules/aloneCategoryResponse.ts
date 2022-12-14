import { AloneCategoryResponseDto } from '../interfaces/ICategory';

async function aloneCategoryResponse(
  client: any,
  aloneListId: string,
): Promise<AloneCategoryResponseDto[]> {
  try {
    const { rows: category } = await client.query(
      `
      SELECT c.id::text, c.name,	COALESCE(json_agg(json_build_object(
          'id', p.id::text,
          'name', p.name,
          'isChecked', p.is_checked,
          'packer', NULL
      ) ORDER BY p.id
			) FILTER(WHERE p.id IS NOT NULL),'[]') AS "pack"
      FROM "category" c
      LEFT JOIN "pack" p ON c.id = p.category_id
      WHERE c.list_id=$1
      GROUP BY c.id
      ORDER BY c.id
      `,
      [aloneListId],
    );

    return category;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { aloneCategoryResponse };
