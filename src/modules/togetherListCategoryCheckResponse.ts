async function togetherListCategoryCheckResponse(
  client: any,
  userId: number,
  listId: string,
  categoryId: string,
): Promise<string> {
  try {
    const { rows: existList } = await client.query(
      `
      SELECT *
      FROM "together_packing_list" tpl
      JOIN packing_list pl on tpl.id = pl.id
      JOIN user_group ug on tpl.group_id = ug.group_id
      WHERE ug.user_id = $1 AND tpl.id = $2 AND pl.is_deleted = false
      `,
      [userId, listId],
    );

    if (existList.length === 0) return 'no_list';

    const { rows: existCategory } = await client.query(
      `
        SELECT *
        FROM "category" as c
        WHERE c.id = $1
      `,
      [categoryId],
    );

    if (existCategory.length === 0) return 'no_category';

    if (existCategory[0].list_id != listId) return 'no_list_category';

    return 'ok';
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { togetherListCategoryCheckResponse };
