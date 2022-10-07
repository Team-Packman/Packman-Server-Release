import { SharedAloneListResponseDto } from '../interfaces/IAloneList';
import { TitleUpdateDto, DateUpdateDto, MyTemplateUpdateDto } from '../interfaces/IList';
import { SharedTogetherListResponseDto } from '../interfaces/ITogetherList';
import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';
import { aloneListCheckResponse } from '../modules/aloneListCheckResponse';
import { togetherCategoryResponse } from '../modules/togetherCategoryResponse';
import { togetherListCheckResponse } from '../modules/togetherListCheckResponse';

const updateTitle = async (
  client: any,
  userId: number,
  titleUpdateDto: TitleUpdateDto,
): Promise<TitleUpdateDto | string> => {
  try {
    let updatedTitle;
    if (titleUpdateDto.title.length > 12) return 'exceed_len';

    await client.query('BEGIN');

    if (titleUpdateDto.isAloned === true) {
      const existList = await aloneListCheckResponse(client, userId, titleUpdateDto.id);
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
      const existList = await togetherListCheckResponse(client, userId, titleUpdateDto.id);
      if (existList.length < 2) return 'no_list';

      const togetherListId = existList[0].togetherListId;
      const aloneListId = existList[0].myListId;

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
    await client.query('COMMIT');

    return data;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

const updateDate = async (
  client: any,
  userId: number,
  dateUpdateDto: DateUpdateDto,
): Promise<DateUpdateDto | string> => {
  try {
    let updatedDate;

    await client.query('BEGIN');

    if (dateUpdateDto.isAloned === true) {
      const existList = await aloneListCheckResponse(client, userId, dateUpdateDto.id);
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
      const existList = await togetherListCheckResponse(client, userId, dateUpdateDto.id);
      if (existList.length < 2) return 'no_list';

      const togetherListId = existList[0].togetherListId;
      const aloneListId = existList[0].myListId;

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
    await client.query('COMMIT');

    return data;
  } catch (error) {
    await client.query('ROLLBACK');
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
      const existList = await aloneListCheckResponse(client, userId, myTemplateUpdateDto.id);
      if (existList.length === 0) return 'no_list';
      title = existList[0].title;
      isSaved = existList[0].isSaved;
    } else {
      const existList = await togetherListCheckResponse(client, userId, myTemplateUpdateDto.id);
      if (existList.length < 2) return 'no_list';
      listId = existList[0].togetherListId;
      aloneListId = existList[0].myListId;
      title = existList[0].title;
      isSaved = existList[1].isSaved;
    }
    if (isSaved !== myTemplateUpdateDto.isSaved) return 'no_template';

    await client.query('BEGIN');

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
        ORDER BY c.id
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
          ORDER BY p.id
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

    await client.query('COMMIT');

    return data;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

const getSharedList = async (
  client: any,
  listType: string,
  inviteCode: string,
): Promise<SharedAloneListResponseDto | SharedTogetherListResponseDto | string> => {
  let table;

  if (listType === 'alone') table = 'alone_packing_list';
  else if (listType === 'together') table = 'together_packing_list';
  else return 'invalid_list_type';

  const { rows: list } = await client.query(
    `
      SELECT pl.id::TEXT
      FROM "${table}" pl
      JOIN packing_list p on pl.id = p.id
      WHERE pl.invite_code= $1 AND p.is_deleted = false
    `,
    [inviteCode],
  );

  if (list.length === 0) return 'no_list';

  const listId = list[0].id;

  const { rows: listInfo } = await client.query(
    `
      SELECT p.title AS "title", TO_CHAR(p.departure_date,'YYYY-MM-DD') AS "departureDate"
      FROM "packing_list" p
      WHERE p.id= $1
    `,
    [listId],
  );

  if (listType === 'alone') {
    const category = await aloneCategoryResponse(client, listId);

    const data: SharedAloneListResponseDto = {
      id: listId,
      title: listInfo[0].title,
      departureDate: listInfo[0].departureDate,
      category: category,
    };

    return data;
  } else {
    const category = await togetherCategoryResponse(client, listId);

    const data: SharedTogetherListResponseDto = {
      id: listId,
      title: listInfo[0].title,
      departureDate: listInfo[0].departureDate,
      category: category,
    };

    return data;
  }
};

export default {
  updateTitle,
  updateDate,
  updateMyTemplate,
  getSharedList,
};
