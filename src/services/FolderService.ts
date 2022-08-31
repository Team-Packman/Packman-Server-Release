import { RecentCreatedListResponseDto } from '../interfaces/IList';
import {
  AllFolderResponseDto,
  FolderCreateDto,
  FolderResponseDto,
  TogetherListInFolderResponseDto,
  AloneListInFolderResponseDto,
  FolderUpdateDto,
} from '../interfaces/IFolder';
import { folderResponse } from '../modules/folderResponse';
import dayjs from 'dayjs';
import TogetherListService from './TogetherListService';

const getRecentCreatedList = async (
  client: any,
  userId: string,
): Promise<RecentCreatedListResponseDto | string> => {
  try {
    const { rows: list } = await client.query(
      `
      SELECT *
      FROM "folder" f
      JOIN folder_packing_list fpl ON f.id = fpl.folder_id
      JOIN packing_list pl on fpl.list_id = pl.id
      WHERE f.user_id = $1 AND pl.is_deleted = false
      `,
      [userId],
    );

    if (list.length === 0) return 'no_list';

    const { rows: aloneList } = await client.query(
      `
        SELECT pl.id::text, apl.is_aloned
        FROM "folder" f
        JOIN folder_packing_list fpl ON f.id = fpl.folder_id
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
          SELECT tapl.together_packing_list_id::text AS id
          FROM "together_alone_packing_list" tapl
          WHERE tapl.my_packing_list_id = $1
        `,
        [recentListId],
      );
      recentListId = togetherListId[0].id;
    }

    const { rows: recentList } = await client.query(
      `
        SELECT  pl.title, TO_CHAR(pl.departure_date,'YYYY-MM-DD') as "departureDate",
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

    const remainDay = dayjs(recentList[0].departureDate).diff(dayjs().format('YYYY-MM-DD'), 'day');
    let url = '';

    if (aloneList[0].is_aloned === true) {
      url = `/alone/${recentListId}`;
    } else {
      url = `/together/${recentListId}`;
    }

    const data: RecentCreatedListResponseDto = {
      id: recentListId,
      title: recentList[0].title,
      remainDay: remainDay.toString(),
      packTotalNum: recentList[0].total,
      packRemainNum: recentList[0].remain,
      url: url,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const createFolder = async (
  client: any,
  userId: string,
  folderCreateDto: FolderCreateDto,
): Promise<AllFolderResponseDto | string> => {
  try {
    if (folderCreateDto.name.length > 8) return 'exceed_len';

    await client.query(
      `
        INSERT INTO "folder" (user_id, name, is_aloned)
        VALUES ($1, $2, $3)
      `,
      [userId, folderCreateDto.name, folderCreateDto.isAloned],
    );

    const folder = await folderResponse(client, userId);

    return folder;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateFolder = async (
  client: any,
  userId: string,
  folderUpdateDto: FolderUpdateDto,
): Promise<AllFolderResponseDto | string> => {
  try {
    if (folderUpdateDto.name.length > 8) return 'exceed_len';
    const { rows: existFolder } = await client.query(
      `
        SELECT * 
        FROM "folder" f
        WHERE f.user_id = $1 AND f.id= $2
      `,
      [userId, folderUpdateDto.id],
    );
    if (existFolder.length === 0) {
      return 'no_folder';
    }
    await client.query(
      `
        UPDATE "folder"
        SET name = $1
        WHERE id = $2
      `,
      [folderUpdateDto.name, folderUpdateDto.id],
    );

    const folder = await folderResponse(client, userId);

    return folder;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteFolder = async (
  client: any,
  userId: string,
  folderId: string,
): Promise<AllFolderResponseDto | string> => {
  try {
    const { rows: existFolder } = await client.query(
      `
        SELECT *
        FROM "folder" f
        WHERE f.user_id = $1 AND f.id = $2
      `,
      [userId, folderId],
    );
    if (existFolder.length === 0) return 'no_folder';

    if (existFolder[0].is_aloned) {
      await client.query(
        `
          UPDATE "packing_list" pl
          SET is_deleted = true
          WHERE pl.id IN ( 
                            SELECT fl.list_id
                            FROM "folder_packing_list" fl
                            WHERE fl.folder_id = $1
                          )
        `,
        [folderId],
      );
    } else {
      const { rows: togetherList } = await client.query(
        `
          SELECT tal.id AS id
          FROM "folder_packing_list" fl
          JOIN "together_alone_packing_list" tal ON tal.my_packing_list_id = fl.list_id
          WHERE fl.folder_id = $1
        `,
        [folderId],
      );
      if (togetherList.length > 0) {
        const togetherIdArray = togetherList.map((list: { id: string }) => list.id);
        const data = await TogetherListService.deleteTogetherList(
          client,
          Number(userId),
          folderId,
          togetherIdArray.join(','),
        );
        if (data === 'no_folder') return 'no_folder';
      }
    }

    await client.query(
      `
        DELETE FROM "folder" f
        WHERE f.id = $1 
      `,
      [folderId],
    );

    const folder = await folderResponse(client, userId);

    return folder;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getFolders = async (client: any, userId: string): Promise<AllFolderResponseDto> => {
  try {
    const data = await folderResponse(client, userId);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getTogetherFolders = async (client: any, userId: string): Promise<FolderResponseDto[]> => {
  try {
    const { rows: togetherFolders } = await client.query(
      `
        SELECT f.id::text, f.name
        FROM "folder" f
        WHERE f.user_id = $1 and f.is_aloned = false
        ORDER BY f.id DESC
      `,
      [userId],
    );

    const data: FolderResponseDto[] = togetherFolders;

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAloneFolders = async (client: any, userId: string): Promise<FolderResponseDto[]> => {
  try {
    const { rows: aloneFolders } = await client.query(
      `
        SELECT f.id::text, f.name
        FROM "folder" f
        WHERE f.user_id = $1 and f.is_aloned = true
        ORDER BY f.id DESC
      `,
      [userId],
    );

    const data: FolderResponseDto[] = aloneFolders;

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getTogetherListInFolder = async (
  client: any,
  userId: string,
  folderId: string,
): Promise<TogetherListInFolderResponseDto | string> => {
  try {
    const { rows: existFolder } = await client.query(
      `
        SELECT *
        FROM "folder" f
        WHERE f.id = $1 and f.is_aloned = false
      `,
      [folderId],
    );

    if (existFolder.length === 0) return 'no_folder';

    const { rows: currentFolder } = await client.query(
      `
        SELECT f.id::text, f.name
        FROM "folder" f
        WHERE f.user_id = $1 and f.id = $2  
      `,
      [userId, folderId],
    );

    if (currentFolder.length === 0) return 'no_user_folder';

    const { rows: folder } = await client.query(
      `
        SELECT f.id::text, f.name
        FROM "folder" f
        WHERE f.user_id = $1 and f.is_aloned = false
        ORDER BY f.id DESC
      `,
      [userId],
    );

    const { rows: listNum } = await client.query(
      `
        SELECT COUNT(*) as "listNum"
        FROM folder_packing_list fpl
        JOIN packing_list pl on pl.id = fpl.list_id
        WHERE fpl.folder_id = $1 and pl.is_deleted = false
      `,
      [folderId],
    );

    const { rows: togetherList } = await client.query(
      `
      SELECT tapl.id::text as id, pl.title, TO_CHAR(pl.departure_date,'YYYY-MM-DD') as "departureDate",
        Count(p.id) AS "packTotalNum",
        Count(CASE WHEN p.is_checked = false THEN p.id END) AS "packRemainNum"
      FROM folder_packing_list fpl
      JOIN together_alone_packing_list tapl on fpl.list_id = tapl.my_packing_list_id
      JOIN packing_list pl on tapl.together_packing_list_id = pl.id
      LEFT JOIN category c ON pl.id = c.list_id
      LEFT JOIN pack p ON c.id = p.category_id
      WHERE fpl.folder_id = $1 and pl.is_deleted = false
      GROUP BY tapl.together_packing_list_id, pl.title, pl.departure_date, tapl.id
      ORDER BY tapl.together_packing_list_id DESC
      `,
      [folderId],
    );

    const data: TogetherListInFolderResponseDto = {
      currentFolder: currentFolder[0],
      folder: folder,
      listNum: listNum[0].listNum,
      togetherPackingList: togetherList,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAloneListInFolder = async (
  client: any,
  userId: string,
  folderId: string,
): Promise<AloneListInFolderResponseDto | string> => {
  try {
    const { rows: existFolder } = await client.query(
      `
        SELECT *
        FROM "folder" f
        WHERE f.id = $1 and f.is_aloned = true
      `,
      [folderId],
    );

    if (existFolder.length === 0) return 'no_folder';

    const { rows: currentFolder } = await client.query(
      `
        SELECT f.id::text, f.name
        FROM "folder" f
        WHERE f.user_id = $1 and f.id = $2  
      `,
      [userId, folderId],
    );

    if (currentFolder.length === 0) return 'no_user_folder';

    const { rows: folder } = await client.query(
      `
        SELECT f.id::text, f.name
        FROM "folder" f
        WHERE f.user_id = $1 and f.is_aloned = true
        ORDER BY f.id DESC
      `,
      [userId],
    );

    const { rows: listNum } = await client.query(
      `
        SELECT COUNT(*) as "listNum"
        FROM folder_packing_list fpl
        JOIN packing_list pl on pl.id = fpl.list_id
        WHERE fpl.folder_id = $1 and pl.is_deleted = false
      `,
      [folderId],
    );

    const { rows: aloneList } = await client.query(
      `
        SELECT apl.id::text as id, pl.title, TO_CHAR(pl.departure_date,'YYYY-MM-DD') as "departureDate",
          Count(p.id) AS "packTotalNum",
          Count(CASE WHEN p.is_checked = false THEN p.id END) AS "packRemainNum"
        FROM folder_packing_list fpl
        JOIN packing_list pl on fpl.list_id = pl.id
        JOIN alone_packing_list apl on pl.id = apl.id
        LEFT JOIN category c ON pl.id = c.list_id
        LEFT JOIN pack p ON c.id = p.category_id
        WHERE fpl.folder_id = $1 and pl.is_deleted = false and apl.is_aloned = true
        GROUP BY apl.id, pl.title, pl.departure_date
        ORDER BY apl.id DESC
      `,
      [folderId],
    );

    const data: AloneListInFolderResponseDto = {
      currentFolder: currentFolder[0],
      folder: folder,
      listNum: listNum[0].listNum,
      alonePackingList: aloneList,
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
  updateFolder,
  deleteFolder,
  getFolders,
  getTogetherFolders,
  getAloneFolders,
  getTogetherListInFolder,
  getAloneListInFolder,
};
