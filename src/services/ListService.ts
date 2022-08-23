import { ListInviteResponseDto, MyTemplateUpdateDto } from '../interfaces/IList';

const getPackingByInviteCode = async (
  client: any,
  inviteCode: string,
): Promise<ListInviteResponseDto | string> => {
  try {
    const { rows: packingList } = await client.query(
      `
        SELECT pl.id::text, pl.title
        FROM "together_packing_list" as t
        JOIN "packing_list" as pl ON pl.id = t.id
        WHERE t.invite_code = $1
    `,
      [inviteCode],
    );
    if (packingList.length === 0) return 'no_list';
    const data: ListInviteResponseDto = {
      id: packingList[0].id,
      title: packingList[0].title,
    };
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateMyTemplate = async (
  client: any,
  userId: number,
  myTemplateUpdateDto: MyTemplateUpdateDto,
): Promise<MyTemplateUpdateDto | string> => {
  try {
    let templateId: string;
    let title: string;
    let aloneListId: string = myTemplateUpdateDto.id;
    let listId: string = myTemplateUpdateDto.id;

    if (myTemplateUpdateDto.isAloned === true) {
      const { rows: existList } = await client.query(
        `
        SELECT *
        FROM "alone_packing_list" as l
        JOIN "packing_list" p ON l.id=p.id
        WHERE l.id=$1 AND l.is_aloned=true AND p.is_deleted=false
        `,
        [myTemplateUpdateDto.id],
      );
      if (existList.length === 0) return 'no_list';
      title = existList[0].title;
    } else {
      const { rows: existList } = await client.query(
        `
        SELECT *
        FROM "together_alone_packing_list" as l
        JOIN "packing_list" p ON l.together_packing_list_id=p.id OR l.my_packing_list_id=p.id
        WHERE l.id=$1 AND p.is_deleted=false
        `,
        [myTemplateUpdateDto.id],
      );
      if (existList.length < 2) return 'no_list';
      listId = existList[0].together_packing_list_id.toString();
      aloneListId = existList[0].my_packing_list_id.toString();
      title = existList[0].title;
    }

    if (myTemplateUpdateDto.isSaved === false) {
      await client.query(
        `
        UPDATE "packing_list"
        SET is_templated=true
        WHERE id=$1
        `,
        [aloneListId],
      );

      const { rows: template } = await client.query(
        `
        INSERT INTO "template" (is_aloned, title,packing_list_id, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [myTemplateUpdateDto.isAloned, title, aloneListId, userId],
      );
      templateId = template[0].id;
    } else {
      const { rows: existTemplate } = await client.query(
        `
        SELECT *
        FROM "template" t
        WHERE t.packing_list_id=$1
        `,
        [aloneListId],
      );
      if (existTemplate.length === 0) return 'no_template';
      templateId = existTemplate[0].id;
    }

    const { rows: categoryIdArray } = await client.query(
      `
        SELECT c.id
        FROM "category" c
        WHERE c.list_id=$1
      `,
      [listId],
    );

    for await (const element of categoryIdArray) {
      const categoryId = element.id;

      const { rows: templateCategoryIdArray } = await client.query(
        `
          INSERT INTO "template_category" (template_id, name)
          VALUES($1, (SELECT name FROM "category" WHERE id=$2))
          RETURNING *
          `,
        [templateId, categoryId],
      );
      const templateCategoryId = templateCategoryIdArray[0].id;

      await client.query(
        `
          INSERT INTO "template_pack" (category_id, name)
          SELECT t.id, p.name
          FROM "template_category" t, "pack" p
          WHERE t.id=$1 AND p.category_id=$2
          `,
        [templateCategoryId, categoryId],
      );
    }

    const { rows: returnData } = client.query(
      `
      SELECT is_templated as "isSaved"
      FROM packing_list p
      WHERE p.id=$1
      `,
      [aloneListId],
    );

    const data: MyTemplateUpdateDto = {
      id: myTemplateUpdateDto.id,
      isSaved: returnData[0].isSaved,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  getPackingByInviteCode,
  updateMyTemplate,
};
