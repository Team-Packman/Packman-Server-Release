import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';
import { ListCreateDto } from '../interfaces/IList';
import { AloneListResponseDto } from '../interfaces/IAloneList';

const createAloneList = async (
  client: any,
  aloneListCreateDto: ListCreateDto,
): Promise<AloneListResponseDto | string> => {
  try {
    if (aloneListCreateDto.title.length > 12) return 'exceed_len';

    const { rows: listId } = await client.query(
      `
        INSERT INTO "packing_list" (title, departure_date)
        VALUES ($1, $2)
        RETURNING id
      `,
      [aloneListCreateDto.title, aloneListCreateDto.departureDate],
    );
    const aloneListId = listId[0].id;

    await client.query(
      `
        INSERT INTO "alone_packing_list" (id)
        VALUES ($1)
      `,
      [aloneListId],
    );

    await client.query(
      `
        INSERT INTO "folder_packing_list" (folder_id, list_id)
        VALUES ($1, $2)
      `,
      [aloneListCreateDto.folderId, aloneListId],
    );

    if (aloneListCreateDto.templateId === "''") {
      await client.query(
        `
          INSERT INTO "category" (list_id, name)
          VALUES ($1, '기본')
        `,
        [aloneListId],
      );
    } else {
      const { rows: templateCategoryIdArray } = await client.query(
        `
          SELECT c.id
          FROM "template_category" c
          WHERE c.template_id=$1 
        `,
        [aloneListCreateDto.templateId],
      );

      for await (const element of templateCategoryIdArray) {
        const templateCategoryId = element.id;

        const { rows: categoryIdArray } = await client.query(
          `
            INSERT INTO "category" (list_id, name)
            VALUES($1, (SELECT name FROM "template_category" WHERE id=$2))
            RETURNING id
          `,
          [aloneListId, templateCategoryId],
        );
        const categoryId = categoryIdArray[0].id;

        await client.query(
          `
            INSERT INTO "pack" (category_id, name)
            SELECT c.id, p.name
            FROM "category" c, "template_pack" p
            WHERE c.id=$1 AND p.category_id=$2
          `,
          [categoryId, templateCategoryId],
        );
      }
    }

    const { rows: etcDataArray } = await client.query(
      `
        SELECT p.title AS "title", TO_CHAR(p.departure_date,'YYYY-MM-DD') AS "departureDate", p.is_saved AS "isSaved"
        FROM "packing_list" p
        WHERE p.id=$1
      `,
      [aloneListId],
    );
    const etcData = etcDataArray[0];

    const aloneListCategory = await aloneCategoryResponse(client, aloneListId);

    const data: AloneListResponseDto = {
      id: aloneListId.toString(),
      title: etcData.title,
      departureDate: etcData.departureDate,
      category: aloneListCategory,
      isSaved: etcData.isSaved,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

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
        SELECT p.title AS "title", TO_CHAR(p.departure_date,'YYYY-MM-DD') AS "departureDate", p.is_saved AS "isSaved"
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
  createAloneList,
  readAloneList,
};
