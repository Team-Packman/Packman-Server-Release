import { TogetherListCreateDto, TogetherListResponseDto } from '../interfaces/ITogetherList';

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
export default {
  createTogetherList,
  readTogetherList,
};
