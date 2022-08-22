import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';
import { AloneListResponseDto } from '../interfaces/IAloneList';

const readAloneList = async (
  client: any,
  aloneListId: string,
): Promise<AloneListResponseDto | string> => {
  try {
    const { rows: existList } = await client.query(
      `
      SELECT *
      FROM "alone_packing_list" as l
      JOIN "packing_list" p ON l.id=p.id
      WHERE l.id=$1 AND l.is_aloned=true AND p.is_deleted=false
      `,
      [aloneListId],
    );
    if (existList.length === 0) return 'no_list';

    const { rows: etcDataArray } = await client.query(
      `
      SELECT p.title AS "title", TO_CHAR(p.departure_date,'YYYY.MM.DD') AS "departureDate", p.is_templated AS "isSaved"
      FROM "packing_list" p
      WHERE p.id=$1
      `,
      [aloneListId],
    );
    const etcData = etcDataArray[0];

    const category = await aloneCategoryResponse(client, aloneListId);

    const data: AloneListResponseDto = {
      id: aloneListId.toString(),
      title: etcData.title,
      departureDate: etcData.departureDate,
      category: category,
      isSaved: etcData.isSaved,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  readAloneList,
};
