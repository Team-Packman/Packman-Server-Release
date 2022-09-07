import { TogetherListCheckResponseDto } from '../interfaces/ITogetherList';

async function togetherListCheckResponse(
  client: any,
  userId: number,
  listId: string,
): Promise<TogetherListCheckResponseDto[]> {
  try {
    await client.query(
      `
        SELECT *
        FROM "together_alone_packing_list" as l
        JOIN "packing_list" p ON l.together_packing_list_id=p.id OR l.my_packing_list_id=p.id
        WHERE l.id=$1 AND p.is_deleted=false
        ORDER BY p.id
      `,
      [listId],
    );

    console.log(userId, listId);
    const { rows: existList } = await client.query(
      `
        SELECT pl.title,TO_CHAR(pl.departure_date,'YYYY-MM-DD') AS "departureDate", pl.is_saved AS "isSaved",
               tapl.my_packing_list_id::text AS "myListId", tapl.together_packing_list_id::text AS "togetherListId"
        FROM "folder" f
        JOIN "folder_packing_list" fpl ON f.id=fpl.folder_id AND f.user_id=$1 AND f.is_aloned=false
        JOIN "together_alone_packing_list" tapl ON fpl.list_id=tapl.my_packing_list_id
        JOIN "packing_list" pl ON tapl.together_packing_list_id=pl.id OR tapl.my_packing_list_id=pl.id
        WHERE tapl.id=$2 AND pl.is_deleted=false
        ORDER BY pl.id
      `,
      [userId, listId],
    );
    console.log(existList);

    return existList;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { togetherListCheckResponse };