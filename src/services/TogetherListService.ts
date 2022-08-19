import { TogetherListCreateDto, TogetherListResponseDto } from '../interfaces/ITogetherList';

const createTogetherList = async (
  client: any,
  userId: number,
  togetherListCreateDto: TogetherListCreateDto,
): Promise<TogetherListResponseDto | string> => {
  try {
    //테스트 위해 invite code 더미로 넣어 둠
    const inviteCode = '1240';

    if (togetherListCreateDto.title.length > 12) return 'exceed_len';

    const { rows: listIdArray } = await client.query(
      `
      INSERT INTO "packing_list" (title, departure_date)
      VALUES ($1, $2), ($1, $2)
      RETURNING id
      `,
      [togetherListCreateDto.title, togetherListCreateDto.departureDate],
    );
    const togetherListId = listIdArray[0].id;
    const myListId = listIdArray[1].id;

    const { rows: group } = await client.query(
      `
      INSERT INTO "group" (id)
      VALUES (DEFAULT)
      RETURNING id
      `,
    );
    const groupId = group[0].id;

    await client.query(
      `
      INSERT INTO "user_group" (user_id, group_id)
      VALUES ($1, $2)
      `,
      [userId, groupId],
    );

    await client.query(
      `
      INSERT INTO "together_packing_list" (id, group_id, invite_code)
      VALUES ($1, $2, $3)
      `,
      [togetherListId, groupId, inviteCode],
    );

    await client.query(
      `
      INSERT INTO "alone_packing_list" (id, is_aloned)
      VALUES ($1, false)
      `,
      [myListId],
    );

    await client.query(
      `
      INSERT INTO "folder_packing_list" (folder_id, list_id)
      VALUES ($1, $2)
      `,
      [togetherListCreateDto.folderId, myListId],
    );

    const { rows: togetherMyIdArray } = await client.query(
      `
      INSERT INTO "together_alone_packing_list" (together_packing_list_id, my_packing_list_id)
      VALUES ($1, $2)
      RETURNING id
      `,
      [togetherListId, myListId],
    );
    const togetherMyId = togetherMyIdArray[0].id;

    await client.query(
      `
      INSERT INTO "category" (list_id, name)
      VALUES ($1, '기본')
      `,
      [myListId],
    );

    if (!togetherListCreateDto.templateId) {
      await client.query(
        `
        INSERT INTO "category" (list_id, name)
        VALUES ($1, '기본')
        `,
        [togetherListId],
      );
    } else {
      const { rows: templateCategoryIdArray } = await client.query(
        `
        SELECT c.id
        FROM "template_category" c
        WHERE c.template_id=$1 
        `,
        [togetherListCreateDto.templateId],
      );

      for await (const element of templateCategoryIdArray) {
        const templateCategoryId = element.id;

        const { rows: categoryIdArray } = await client.query(
          `
          INSERT INTO "category" (list_id, name)
          VALUES($1, (SELECT name FROM "template_category" WHERE id=$2))
          RETURNING id
          `,
          [togetherListId, templateCategoryId],
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
      SELECT p.title AS "title", TO_CHAR(p.departure_date,'YYYY.MM.DD') AS "departureDate", p.is_templated AS "isSaved",
        t.group_id AS "groupId", t.invite_code AS "inviteCode"
      FROM "packing_list" p
      JOIN "together_packing_list" t ON p.id=t.id 
      WHERE t.id=$1
      `,
      [togetherListId],
    );
    const etcData = etcDataArray[0];

    const { rows: togetherListCategoryArray } = await client.query(
      `
      SELECT c.id::text AS "id", c.name AS "name",
        COALESCE(json_agg(json_build_object(
          'id', p.id::text,
          'name', p.name,
          'isChecked', p.is_checked,
          'packer',
          CASE
              WHEN p.packer_id IS NULL THEN NULL
              ELSE json_build_object('id', u.id::text, 'nickname', u.nickname )
          END) ORDER BY p.id) FILTER(WHERE p.id IS NOT NULL),'[]') AS "pack"

      FROM "category" c
      LEFT JOIN "pack" p ON c.id = p.category_id
      LEFT JOIN "user" u ON p.packer_id = u.id
      WHERE c.list_id=$1

      GROUP BY c.id
      ORDER BY c.id
      `,
      [togetherListId],
    );

    const { rows: myListCategoryArray } = await client.query(
      `
      SELECT c.id::text AS "id", c.name AS "name",
      COALESCE(json_agg(json_build_object(
          'id', p.id::text,
          'name', p.name,
          'isChecked', p.is_checked,
          'packer', NULL
      ) ORDER BY p.id) FILTER(WHERE p.id IS NOT NULL),'[]') AS "pack"

      FROM "category" c
      LEFT JOIN "pack" p ON c.id = p.category_id
      WHERE c.list_id=$1

      GROUP BY c.id
      ORDER BY c.id
      `,
      [myListId],
    );

    const data: TogetherListResponseDto = {
      id: togetherMyId.toString(),
      title: etcData.title,
      departureDate: etcData.departureDate,
      togetherPackingList: {
        id: togetherListId.toString(),
        groupId: etcData.groupId.toString(),
        category: togetherListCategoryArray,
        inviteCode: etcData.inviteCode,
        isSaved: etcData.isSaved,
      },
      myPackingList: {
        id: myListId.toString(),
        category: myListCategoryArray,
      },
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const readTogetherList = async (
  client: any,
  listId: string,
  userId: number,
): Promise<TogetherListResponseDto | string> => {
  try {
    const { rows: existList } = await client.query(
      `
      SELECT *
      FROM "together_alone_packing_list" as l
      JOIN "packing_list" p ON l.together_packing_list_id=p.id OR l.my_packing_list_id=p.id
      WHERE l.id=$1 AND p.is_deleted=false
      `,
      [listId],
    );
    if (existList.length < 2) return 'no_list';

    const { rows: etcDataArray } = await client.query(
      `
      SELECT ta.together_packing_list_id::text AS "togetherListId", ta.my_packing_list_id::text AS "myListId",
        t.group_id::text AS "groupId", t.invite_code AS "inviteCode",
        p.title AS "title", TO_CHAR(p.departure_date,'YYYY.MM.DD') AS "departureDate", p.is_templated AS "isSaved"
      FROM (SELECT * FROM "together_alone_packing_list" WHERE id=$1) ta
      JOIN "together_packing_list" t ON ta.together_packing_list_id=t.id
      JOIN "packing_list" p ON t.id=p.id
      `,
      [listId],
    );
    const etcData = etcDataArray[0];

    const { rows: togetherListCategoryArray } = await client.query(
      `
      SELECT c.id::text AS "id", c.name AS "name",
        COALESCE(json_agg(json_build_object(
          'id', p.id::text,
          'name', p.name,
          'isChecked', p.is_checked,
          'packer',
          CASE
              WHEN p.packer_id IS NULL THEN NULL
              ELSE json_build_object('id', u.id::text, 'nickname', u.nickname )
          END) ORDER BY p.id) FILTER(WHERE p.id IS NOT NULL),'[]') AS "pack"

      FROM "category" c
      LEFT JOIN "pack" p ON c.id = p.category_id
      LEFT JOIN "user" u ON p.packer_id = u.id
      WHERE c.list_id=$1

      GROUP BY c.id
      ORDER BY c.id
      `,
      [etcData.togetherListId],
    );

    const { rows: myListCategoryArray } = await client.query(
      `
      SELECT c.id::text AS "id", c.name AS "name",
      COALESCE(json_agg(json_build_object(
          'id', p.id::text,
          'name', p.name,
          'isChecked', p.is_checked,
          'packer', NULL
      ) ORDER BY p.id) FILTER(WHERE p.id IS NOT NULL),'[]') AS "pack"

      FROM "category" c
      LEFT JOIN "pack" p ON c.id = p.category_id
      WHERE c.list_id=$1

      GROUP BY c.id
      ORDER BY c.id
      `,
      [etcData.myListId],
    );

    const { rows: groupInfo } = await client.query(
      `
      SELECT g.id::text AS "id",
            COALESCE(json_agg(json_build_object(
                'id', u.id::text,
                'name', u.nickname,
                'profileImage',u.profile_image
                ) ORDER BY ug.id) FILTER(WHERE u.id IS NOT NULL AND u.is_deleted=false),'[]') AS "member"
      FROM "user_group" ug
      JOIN "user" u ON ug.user_id=u.id
      RIGHT JOIN "group" g ON ug.group_id=g.id
      WHERE g.id=$1

      GROUP BY g.id
      `,
      [etcData.groupId],
    );

    const { rows: isMember } = await client.query(
      `
      SELECT EXISTS(
      SELECT *
      FROM "user_group" ug
      WHERE ug.group_id=$1 AND ug.user_id=$2)
      `,
      [etcData.groupId, userId],
    );

    const data: TogetherListResponseDto = {
      id: listId,
      title: etcData.title,
      departureDate: etcData.departureDate,
      togetherPackingList: {
        id: etcData.togetherListId,
        groupId: etcData.groupId,
        category: togetherListCategoryArray,
        inviteCode: etcData.inviteCode,
        isSaved: etcData.isSaved,
      },
      myPackingList: {
        id: etcData.myListId,
        category: myListCategoryArray,
      },
      group: groupInfo,
      isMember: isMember[0].exists,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const addMember = async (client: any, listId: string, userId: string): Promise<string | void> => {
  try {
    const { rows: togetherList } = await client.query(
      `
        SELECT *
        FROM "packing_list" as pl
        JOIN "together_packing_list" as t ON pl.id = t.id
        WHERE pl.id = $1 AND pl.is_deleted = false
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
        WHERE f.name = '기본' AND f.user_id = $1 AND f.is_aloned = false
        `,
      [userId],
    );

    let folderId;
    if (defaultFolder.length === 0) {
      const { rows: newFolder } = await client.query(
        `
          INSERT INTO "folder" (user_id, name, is_aloned)
          VALUES ($1, '기본', false)
          RETURNING *
          `,
        [userId],
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
        VALUES ($1, false)
        RETURNING *
        `,
      [packingList[0].id],
    );

    const { rows: togetherAloneList } = await client.query(
      `
        INSERT INTO "together_alone_packing_list" (my_packing_list_id, together_packing_list_id)
        VALUES ($1, $2)
        `,
      [aloneList[0].id, togetherList[0].id],
    );

    const { rows: folderList } = await client.query(
      `
        INSERT INTO "folder_packing_list" (folder_id, list_id)
        VALUES ($1, $2)
        `,
      [folderId, aloneList[0].id],
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export default {
  createTogetherList,
  readTogetherList,
  addMember,
};
