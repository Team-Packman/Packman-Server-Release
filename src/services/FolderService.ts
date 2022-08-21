import { RecentCreatedListResponseDto } from '../interfaces/IList';
import { FolderResponseDto } from '../interfaces/IFolder';
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

const getAloneFolders = async (
  client: any,
  userId: string,
): Promise<FolderResponseDto[] | string> => {
  try {
    const { rows: aloneFolders } = await client.query(
      `
      SELECT f.id, f.name
      FROM "folder" f
      WHERE f.user_id = $1 and f.is_aloned = true
      ORDER BY f.id
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

export default {
  getRecentCreatedList,
  getAloneFolders,
};
