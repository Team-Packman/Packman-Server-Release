import { ListInviteResponseDto } from '../interfaces/IList';

const getPackingByInviteCode = async (
  client: any,
  inviteCode: string,
): Promise<ListInviteResponseDto | string> => {
  try {
    const { rows: packingList } = await client.query(
      `
        SELECT pl.id::text, pl.title
        FROM "together_packing_list" as t
        JOIN "packing_list" as pl ON pl.id = t.id
        WHERE t.invite_code = $1
    `,
      [inviteCode],
    );
    if (packingList.length === 0) return 'no_list';
    const data: ListInviteResponseDto = {
      id: packingList[0].id,
      title: packingList[0].title,
    };
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  getPackingByInviteCode,
};
