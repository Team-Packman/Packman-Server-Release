import {
  ListInviteResponseDto,
  TitleUpdateDto,
  DateUpdateDto,
  MyTemplateUpdateDto,
} from '../interfaces/IList';

const getPackingByInviteCode = async (
  client: any,
  inviteCode: string,
  userId: number,
): Promise<ListInviteResponseDto | string> => {
  try {
    const { rows: packingList } = await client.query(
      `
      SELECT tapl.id::text, pl.title, t.group_id
      FROM "together_packing_list" as t
      JOIN "packing_list" as pl ON pl.id = t.id
      JOIN together_alone_packing_list tapl on t.id = tapl.together_packing_list_id
      WHERE t.invite_code = $1 AND pl.is_deleted = false
      `,
      [inviteCode],
    );
    if (packingList.length === 0) return 'no_list';

    // 이미 추가된 멤버인지
    let isMember = false;

    if (userId !== 0) {
      const { rows: existMember } = await client.query(
        `
          SELECT *
          FROM "user_group" as ug
          WHERE ug.user_id = $1 AND ug.group_id = $2
        `,
        [userId, packingList[0].group_id],
      );
      if (existMember.length > 0) isMember = true;
    }
    const data: ListInviteResponseDto = {
      id: packingList[0].id,
      title: packingList[0].title,
      isMember: isMember,
    };
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateTitle = async (
  client: any,
  titleUpdateDto: TitleUpdateDto,
): Promise<TitleUpdateDto | string> => {
  try {
    let updatedTitle;
    if (titleUpdateDto.title.length > 12) return 'exceed_len';

    if (titleUpdateDto.isAloned === true) {
      const { rows: existList } = await client.query(
        `
          SELECT *
          FROM "alone_packing_list" as l
          JOIN "packing_list" p ON l.id=p.id
          WHERE l.id=$1 AND l.is_aloned=true AND p.is_deleted=false
        `,
        [titleUpdateDto.id],
      );
      if (existList.length === 0) return 'no_list';

      const { rows: updatedData } = await client.query(
        `
          UPDATE "packing_list"
          SET title=$1
          WHERE id=$2
          RETURNING title 
        `,
        [titleUpdateDto.title, titleUpdateDto.id],
      );
      updatedTitle = updatedData[0].title;
    } else {
      const { rows: existList } = await client.query(
        `
          SELECT together_packing_list_id, my_packing_list_id
          FROM "together_alone_packing_list" as l
          JOIN "packing_list" p ON l.together_packing_list_id=p.id OR l.my_packing_list_id=p.id
          WHERE l.id=$1 AND p.is_deleted=false
        `,
        [titleUpdateDto.id],
      );
      if (existList.length < 2) return 'no_list';

      const togetherListId = existList[0].together_packing_list_id;
      const aloneListId = existList[0].my_packing_list_id;

      const { rows: updatedData } = await client.query(
        `
          UPDATE "packing_list"
          SET title=$1
          WHERE id=$2 OR id=$3
          RETURNING title
        `,
        [titleUpdateDto.title, togetherListId, aloneListId],
      );
      updatedTitle = updatedData[0].title;
    }

    const data = {
      id: titleUpdateDto.id,
      title: updatedTitle,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateDate = async (
  client: any,
  dateUpdateDto: DateUpdateDto,
): Promise<DateUpdateDto | string> => {
  try {
    let updatedDate;

    if (dateUpdateDto.isAloned === true) {
      const { rows: existList } = await client.query(
        `
          SELECT *
          FROM "alone_packing_list" as l
          JOIN "packing_list" p ON l.id=p.id
          WHERE l.id=$1 AND l.is_aloned=true AND p.is_deleted=false
        `,
        [dateUpdateDto.id],
      );
      if (existList.length === 0) return 'no_list';

      const { rows: updatedData } = await client.query(
        `
          UPDATE "packing_list"
          SET departure_date=$1
          WHERE id=$2
          RETURNING TO_CHAR(departure_date,'YYYY-MM-DD') AS "departureDate"
        `,
        [dateUpdateDto.departureDate, dateUpdateDto.id],
      );
      updatedDate = updatedData[0].departureDate;
    } else {
      const { rows: existList } = await client.query(
        `
          SELECT together_packing_list_id, my_packing_list_id
          FROM "together_alone_packing_list" as l
          JOIN "packing_list" p ON l.together_packing_list_id=p.id OR l.my_packing_list_id=p.id
          WHERE l.id=$1 AND p.is_deleted=false
        `,
        [dateUpdateDto.id],
      );
      if (existList.length < 2) return 'no_list';

      const togetherListId = existList[0].together_packing_list_id;
      const aloneListId = existList[0].my_packing_list_id;

      const { rows: updatedData } = await client.query(
        `
          UPDATE "packing_list"
          SET departure_date=$1
          WHERE id=$2 OR id=$3
          RETURNING TO_CHAR(departure_date,'YYYY-MM-DD') AS "departureDate"
        `,
        [dateUpdateDto.departureDate, togetherListId, aloneListId],
      );
      updatedDate = updatedData[0].departureDate;
    }

    const data = {
      id: dateUpdateDto.id,
      departureDate: updatedDate,
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
    let isSaved: boolean;
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
      isSaved = existList[0].is_saved;
    } else {
      const { rows: existList } = await client.query(
        `
          SELECT *
          FROM "together_alone_packing_list" as l
          JOIN "packing_list" p ON l.together_packing_list_id=p.id OR l.my_packing_list_id=p.id
          WHERE l.id=$1 AND p.is_deleted=false
          ORDER BY p.id
        `,
        [myTemplateUpdateDto.id],
      );
      if (existList.length < 2) return 'no_list';
      listId = existList[0].together_packing_list_id.toString();
      aloneListId = existList[0].my_packing_list_id.toString();
      title = existList[0].title;
      isSaved = existList[1].is_saved;
    }
    if (isSaved !== myTemplateUpdateDto.isSaved) return 'no_template';

    if (myTemplateUpdateDto.isSaved === false) {
      await client.query(
        `
          UPDATE "packing_list"
          SET is_saved=true
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

      await client.query(
        `
          UPDATE "template"
          SET title=$1
          WHERE id=$2
        `,
        [title, templateId],
      );

      await client.query(
        `
          DELETE
          FROM "template_category" tc
          WHERE tc.template_id=$1
        `,
        [templateId],
      );
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

    const { rows: returnData } = await client.query(
      `
        SELECT is_saved as "isSaved"
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
  updateTitle,
  updateDate,
  updateMyTemplate,
};
