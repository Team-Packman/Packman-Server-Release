async function listCategoryCheckResponse(
  client: any,
  userId: number,
  listId: string,
  categoryId: string,
): Promise<string> {
  try {
    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "folder" f
        JOIN folder_packing_list fpl on f.id = fpl.folder_id
        JOIN together_alone_packing_list tapl on fpl.list_id = tapl.my_packing_list_id
        JOIN packing_list pl on tapl.together_packing_list_id = pl.id
        WHERE f.user_id = $1 AND tapl.together_packing_list_id = $2
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

export { listCategoryCheckResponse };
