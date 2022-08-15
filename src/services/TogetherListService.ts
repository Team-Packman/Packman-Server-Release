const addMember = async (client: any, listId: string, userId: string): Promise<string | void> => {
  try {
    const { rows: togetherList } = await client.query(
      `SELECT *
             FROM "packing_list" as pl
             JOIN "together_packing_list" as t ON pl.id = t.id
             WHERE pl.id = $1 
             LIMIT 1 
            `,
      [listId],
    );
    if (togetherList.length === 0) return 'no_list';

    // 그룹원 추가
    const { rows: existMember } = await client.query(
      `
        SELECT *
        FROM "user_group" as ug
        WHERE ug.user_id = $1 AND ug.group_id = $2
        `,
      [userId, togetherList[0].group_id],
    );
    if (existMember.length > 0) return 'already_exist_member';

    const { rows: userGroup } = await client.query(
      `
        INSERT INTO "user_group" (user_id, group_id)
        VALUES ($1, $2)
        `,
      [userId, togetherList[0].group_id],
    );

    // 기본 폴더 추가
    const { rows: defaultFolder } = await client.query(
      `
        SELECT * 
        FROM "folder" as f
        WHERE f.name = $1 AND f.user_id = $2 AND f.is_aloned = $3
        `,
      ['기본', userId, false],
    );

    let folderId;
    if (defaultFolder.length === 0) {
      const { rows: newFolder } = await client.query(
        `
            INSERT INTO "folder" (user_id, name, is_aloned)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
        [userId, '기본', false],
      );
      folderId = newFolder[0].id;
    } else {
      folderId = defaultFolder[0].id;
    }
    // 함께 패킹 속 혼자 패킹 생성

    const { rows: packingList } = await client.query(
      `
        INSERT INTO "packing_list" (title, departure_date)
        VALUES ($1, $2)
        RETURNING *
        `,
      [togetherList[0].title, togetherList[0].departure_date],
    );

    const { rows: aloneList } = await client.query(
      `
        INSERT INTO "alone_packing_list" (id, is_aloned)
        VALUES ($1, $2)
        RETURNING *
        `,
      [packingList[0].id, false],
    );

    const { rows: togetherPackingList } = await client.query(
      `
        INSERT INTO "together_packing_list" (id, my_packing_list_id, group_id)
        VALUES ($1, $2, $3)
        `,
      [togetherList[0].id, aloneList[0].id, togetherList[0].group_id],
    );

    const { rows: folderPackingList } = await client.query(
      `
        INSERT INTO "folder_packing_list" (folder_id, list_id)
        VALUES ($1, $2)
        `,
      [folderId, togetherList[0].id],
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  addMember,
};
