import { ListInviteResponseDto, ListTitleUpdateDto } from '../interfaces/IList';

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

const updateListTitle = async (
  client: any,
  listTitleUpdateDto: ListTitleUpdateDto,
): Promise<ListTitleUpdateDto | string> => {
  try {
    let updatedTitle;

    if (listTitleUpdateDto.isAloned === true) {
      const { rows: existList } = await client.query(
        `
        SELECT *
        FROM "alone_packing_list" as l
        JOIN "packing_list" p ON l.id=p.id
        WHERE l.id=$1 AND l.is_aloned=true AND p.is_deleted=false
        `,
        [listTitleUpdateDto.id],
      );
      if (existList.length === 0) return 'no_list';

      const { rows: updatedData } = await client.query(
        `
        UPDATE "packing_list"
        SET title=$1
        WHERE id=$2
        RETURNING title 
        `,
        [listTitleUpdateDto.title, listTitleUpdateDto.id],
      );
      updatedTitle = updatedData[0].title;
    } else {
      const { rows: existList } = await client.query(
        `
        SELECT together_packing_list_id, my_packing_list_id
        FROM "together_alone_packing_list" as l
        JOIN "packing_list" p ON l.together_packing_list_id=p.id OR l.my_packing_list_id=p.id
        WHERE l.id=$1 AND p.is_deleted=false
        `,
        [listTitleUpdateDto.id],
      );
      if (existList.length < 2) return 'no_list';

      const togetherListId = existList[0].together_packing_list_id;
      const aloneListId = existList[0].my_packing_list_id;

      const { rows: updatedData } = await client.query(
        `
        UPDATE "packing_list"
        SET title=$1
        WHERE id=$2 OR id=$3
        RETURNING title
        `,
        [listTitleUpdateDto.title, togetherListId, aloneListId],
      );
      updatedTitle = updatedData[0].title;
    }

    const data = {
      id: listTitleUpdateDto.id,
      title: updatedTitle,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export default {
  getPackingByInviteCode,
  updateListTitle,
};
