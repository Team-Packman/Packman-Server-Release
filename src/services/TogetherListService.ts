// eslint-disable-next-line @typescript-eslint/no-var-requires
import { TogetherListCreateDto, TogetherListResponseDto } from '../interfaces/ITogetherList';

const createTogetherList = async (
  client: any,
  userId: number,
  togetherListCreateDto: TogetherListCreateDto,
): Promise<TogetherListResponseDto | string> => {
  try {
    //테스트 위해 invite code 더미로 넣어 둠
    const inviteCode = '1237';

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

export default {
  createTogetherList,
};
