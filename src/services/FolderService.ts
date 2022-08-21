import { RecentCreatedListResponseDto } from '../interfaces/IList';
import dayjs from 'dayjs';

const getRecentCreatedList = async (
  client: any,
  userId: string,
): Promise<RecentCreatedListResponseDto | string> => {
  const { rows: list } = await client.query(
    `
    SELECT *
    FROM "folder" f
    JOIN folder_packing_list fpl ON f.id = fpl.folder_id
    WHERE f.user_id = $1
    `,
    [userId],
  );

  if (!list[0]) return 'no_list';

  const { rows: aloneList } = await client.query(
    `
    SELECT pl.id, apl.is_aloned
    FROM "folder" f
    LEFT JOIN folder_packing_list fpl ON f.id = fpl.folder_id
    LEFT JOIN packing_list pl ON fpl.list_id = pl.id
    LEFT JOIN alone_packing_list apl ON pl.id = apl.id
    WHERE f.user_id = $1
    ORDER BY pl.created_at DESC 
    `,
    [userId],
  );

  let recentListId = aloneList[0].id;

  if (aloneList[0].is_aloned === false) {
    const { rows: togetherListId } = await client.query(
      `
        SELECT tapl.together_packing_list_id AS id
        FROM "together_alone_packing_list" tapl
        WHERE tapl.my_packing_list_id = $1
        `,
      [recentListId],
    );
    recentListId = togetherListId[0].id;
  }

  const { rows: recentList } = await client.query(
    `
    SELECT  pl.title, TO_CHAR(pl.departure_date,'YYYY-MM-DD') as departure_date,
      Count(CASE WHEN p.is_checked = false THEN p.id END) AS remain,
      Count(p.id) AS total
    FROM   "packing_list" pl
    LEFT JOIN category c ON pl.id = c.list_id
    LEFT JOIN pack p ON c.id = p.category_id
    WHERE pl.id = $1
    GROUP BY pl.departure_date, pl.title
    `,
    [recentListId],
  );

  const remainDay = dayjs(recentList[0].departure_date).diff(dayjs().format('YYYY-MM-DD'), 'day');
  let url = '';

  if (aloneList[0].is_aloned === true) {
    url = `/alone/${recentListId}`;
  } else {
    url = `/together/${recentListId}`;
  }

  const data: RecentCreatedListResponseDto = {
    id: recentListId,
    title: recentList[0].title,
    remainDay: remainDay,
    packTotalNum: recentList[0].total,
    packRemainNum: recentList[0].remain,
    url: url,
  };

  return data;
};

import { AllFolderResponseDto, FolderCreateDto, FolderInfoDto } from '../interfaces/IFolder';

const createFolder = async (
  client: any,
  userId: string,
  folderCreateDto: FolderCreateDto,
): Promise<AllFolderResponseDto | string> => {
  try {
    if (folderCreateDto.name.length > 12) return 'exceed_len';

    const { rows: newFolder } = await client.query(
      `
      INSERT INTO "folder" (user_id, name, is_aloned)
      VALUES ($1, $2, $3)
    `,
      [userId, folderCreateDto.name, folderCreateDto.isAloned],
    );

    const { rows: folders } = await client.query(
      `
        SELECT  f.id::text,f.name, f.is_aloned AS "isAloned",COUNT(al.id) AS "listNum"
        FROM (
                SELECT * 
                FROM "folder" 
                WHERE user_id = $1
                ) AS f
        LEFT JOIN "folder_packing_list" as fl ON f.id = fl.folder_id
        LEFT JOIN "packing_list" as pl ON pl.id = fl.list_id AND pl.is_deleted = false
        LEFT JOIN "alone_packing_list" as al ON al.id = fl.list_id
        GROUP BY f.id, f.name, f.is_aloned
        ORDER BY f.id DESC
        `,
      [userId],
    );

    const aloneFolder: FolderInfoDto[] = [];
    const togetherFolder: FolderInfoDto[] = [];
    for await (const folder of folders) {
      if (folder.isAloned) {
        aloneFolder.push(folder);
      } else {
        togetherFolder.push(folder);
      }
    }

    const data: AllFolderResponseDto = {
      aloneFolder: aloneFolder,
      togetherFolder: togetherFolder,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  getRecentCreatedList,
  createFolder,
};
