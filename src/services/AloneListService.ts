import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';
import { ListCreateDto } from '../interfaces/IList';
import {
  AloneListInfoResponseDto,
  AloneListLogDto,
  AloneListResponseDto,
  InviteAloneListResponseDto,
} from '../interfaces/IAloneList';
import { generateInviteCode } from '../modules/generateInviteCode';
import { folderCheckResponse } from '../modules/folderCheckResponse';
import logger from '../config/logger';

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

    await client.query('BEGIN');

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
          ORDER BY c.id 
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
            ORDER BY p.id
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
    await client.query('COMMIT');

    const log: AloneListLogDto = {
      id: aloneListId.toString(),
      templateId: aloneListCreateDto.templateId,
      title: insertListInfo[0].title,
      departureDate: insertListInfo[0].departureDate,
      category: aloneListCategory,
    };

    logger.logger.info(
      `POST, /list/alone, 혼자 패킹리스트 생성, 200, userId: ${userId}, data: ` +
        JSON.stringify(log),
    );

    return data;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

const getAloneList = async (
  client: any,
  aloneListId: string,
): Promise<AloneListResponseDto | string> => {
  const { rows: existList } = await client.query(
    `
      SELECT pl.title,TO_CHAR(pl.departure_date,'YYYY-MM-DD') AS "departureDate",
              pl.is_saved AS "isSaved", apl.invite_code AS "inviteCode",
              fpl.folder_id::text AS "folderId"
      FROM "alone_packing_list" apl
      JOIN "packing_list" pl ON apl.id=pl.id
      JOIN "folder_packing_list" fpl ON pl.id=fpl.list_id
      WHERE apl.id=$1 AND apl.is_aloned=true AND pl.is_deleted=false
    `,
    [aloneListId],
  );
  if (existList.length === 0) return 'no_list';

  const category = await aloneCategoryResponse(client, aloneListId);

  const data: AloneListResponseDto = {
    id: aloneListId.toString(),
    folderId: existList[0].folderId,
    title: existList[0].title,
    departureDate: existList[0].departureDate,
    category: category,
    inviteCode: existList[0].inviteCode,
    isSaved: existList[0].isSaved,
  };

  return data;
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

    await client.query('BEGIN');

    await client.query(
      `
        DELETE
        FROM "folder_packing_list" fpl
        WHERE fpl.list_id IN (${aloneListIdArray})
      `,
    );

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

    await client.query('COMMIT');

    return data;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

const getInviteAloneList = async (
  client: any,
  userId: number,
  inviteCode: string,
): Promise<InviteAloneListResponseDto | string> => {
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

  logger.logger.info(
    `GET, /list/alone/invite/:inviteCode, 혼자 패킹리스트 초대, 200, userId: ${userId}, data: ` +
      JSON.stringify(data),
  );

  return data;
};

export default {
  createAloneList,
  getAloneList,
  deleteAloneList,
  getInviteAloneList,
};
