import { AloneListCheckResponseDto } from '../interfaces/IAloneList';

async function aloneListCheckResponse(
  client: any,
  userId: number,
  listId: string,
): Promise<AloneListCheckResponseDto[]> {
  try {
    const { rows: existList } = await client.query(
      `
        SELECT pl.title,TO_CHAR(pl.departure_date,'YYYY-MM-DD') AS "departureDate",
               pl.is_saved AS "isSaved", apl.invite_code AS "inviteCode"
        FROM "folder" f
        JOIN "folder_packing_list" fpl ON f.id=fpl.folder_id
        JOIN "packing_list" pl ON fpl.list_id=pl.id
        JOIN "alone_packing_list" apl ON pl.id=apl.id
        WHERE f.user_id=$1 AND f.is_aloned=true AND pl.is_deleted=false AND apl.id=$2 AND apl.is_aloned=true
      `,
      [userId, listId],
    );

    return existList;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { aloneListCheckResponse };
