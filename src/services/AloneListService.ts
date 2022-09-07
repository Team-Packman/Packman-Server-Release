import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';
import { ListCreateDto } from '../interfaces/IList';
import {
  AloneListInfoResponseDto,
  AloneListResponseDto,
  InviteAloneListResponseDto,
} from '../interfaces/IAloneList';
import { generateInviteCode } from '../modules/generateInviteCode';
import { folderCheckResponse } from '../modules/folderCheckResponse';

const createAloneList = async (
  client: any,
  userId: number,
  aloneListCreateDto: ListCreateDto,
): Promise<AloneListResponseDto | string> => {
  try {
    const inviteCode: string = await generateInviteCode(client);
    if (aloneListCreateDto.title.length > 12) return 'exceed_len';

    const check = await folderCheckResponse(client, userId, aloneListCreateDto.folderId, true);
    if (check === 'no_folder') return 'no_folder';

    const { rows: insertListInfo } = await client.query(
      `
        INSERT INTO "packing_list" (title, departure_date)
        VALUES ($1, $2)
        RETURNING id, title, TO_CHAR(departure_date,'YYYY-MM-DD') AS "departureDate", is_saved AS "isSaved"
      `,
      [aloneListCreateDto.title, aloneListCreateDto.departureDate],
    );
    const aloneListId = insertListInfo[0].id;

    const { rows: insertAloneListInfo } = await client.query(
      `
        INSERT INTO "alone_packing_list" (id, invite_code)
        VALUES ($1, $2)
        RETURNING invite_code AS "inviteCode"
      `,
      [aloneListId, inviteCode],
    );

    await client.query(
      `
        INSERT INTO "folder_packing_list" (folder_id, list_id)
        VALUES ($1, $2)
      `,
      [aloneListCreateDto.folderId, aloneListId],
    );

    if (aloneListCreateDto.templateId === '') {
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

    const aloneListCategory = await aloneCategoryResponse(client, aloneListId);

    const data: AloneListResponseDto = {
      id: aloneListId.toString(),
      title: insertListInfo[0].title,
      departureDate: insertListInfo[0].departureDate,
      category: aloneListCategory,
      inviteCode: insertAloneListInfo[0].inviteCode,
      isSaved: insertListInfo[0].isSaved,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAloneList = async (
  client: any,
  aloneListId: string,
): Promise<AloneListResponseDto | string> => {
  try {
    const { rows: existList } = await client.query(
      `
        SELECT invite_code AS "inviteCode"
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
      inviteCode: existList[0].inviteCode,
      isSaved: etcData.isSaved,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteAloneList = async (
  client: any,
  userId: number,
  folderId: string,
  aloneListId: string,
): Promise<AloneListInfoResponseDto | string> => {
  try {
    const aloneListIdArray: string[] = aloneListId.split(',');
    const check = await folderCheckResponse(client, userId, folderId, true);
    if (check === 'no_folder') return 'no_folder';

    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "alone_packing_list" as l
        JOIN "packing_list" p ON l.id=p.id
        WHERE l.id IN (${aloneListIdArray}) AND l.is_aloned=true AND p.is_deleted=false
      `,
    );
    if (existList.length !== aloneListIdArray.length) return 'no_list';

    const { rows: existFolderList } = await client.query(
      `
        SELECT *
        FROM "folder_packing_list" as f
        WHERE f.folder_id=$1 AND f.list_id IN (${aloneListIdArray})
      `,
      [folderId],
    );
    if (existFolderList.length !== aloneListIdArray.length) return 'no_folder_list';

    await client.query(
      `
        UPDATE "packing_list"
        SET is_deleted=true
        WHERE id IN (${aloneListIdArray})
      `,
    );

    const { rows: alonePackingListInfoArray } = await client.query(
      `
        SELECT pl.id::text, pl.title, TO_CHAR(pl.departure_date,'YYYY-MM-DD') AS "departureDate",
              count(p.id)::text as "packTotalNum", count(p.id) FILTER ( WHERE p.is_checked=false )::text as "packRemainNum"
        FROM "folder_packing_list" fpl
        JOIN "packing_list" pl ON fpl.list_id=pl.id
        LEFT JOIN "category" c ON pl.id=c.list_id
        LEFT JOIN "pack" p ON c.id=p.category_id
        WHERE fpl.folder_id=$1 AND pl.is_deleted=false
        GROUP BY pl.id
        ORDER BY pl.id DESC
      `,
      [folderId],
    );

    const data: AloneListInfoResponseDto = {
      alonePackingList: alonePackingListInfoArray,
    };
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getInviteAloneList = async (
  client: any,
  userId: number,
  inviteCode: string,
): Promise<InviteAloneListResponseDto | string> => {
  try {
    const { rows: aloneList } = await client.query(
      `
        SELECT apl.id::TEXT, f.user_id as "userId"
        FROM alone_packing_list apl
        JOIN packing_list pl on apl.id = pl.id
        JOIN folder_packing_list fpl on apl.id = fpl.list_id
        JOIN folder f on fpl.folder_id = f.id
        WHERE apl.invite_code = $1 AND pl.is_deleted = false
      `,
      [inviteCode],
    );

    if (aloneList.length === 0) return 'no_list';

    const ownerId = aloneList[0].userId;

    let isOwner = false;
    if (userId === ownerId) isOwner = true;

    const data: InviteAloneListResponseDto = {
      id: aloneList[0].id,
      isOwner: isOwner,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  createAloneList,
  getAloneList,
  deleteAloneList,
  getInviteAloneList,
};
