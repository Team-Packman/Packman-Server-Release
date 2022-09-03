import { SharedAloneListResponseDto } from '../interfaces/IAloneList';
import {
  ListInviteResponseDto,
  TitleUpdateDto,
  DateUpdateDto,
  MyTemplateUpdateDto,
} from '../interfaces/IList';
import { SharedTogetherListResponseDto } from '../interfaces/ITogetherList';
import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';
import { togetherCategoryResponse } from '../modules/togetherCategoryResponse';

const getPackingByInviteCode = async (
  client: any,
  inviteCode: string,
  userId: number,
): Promise<ListInviteResponseDto | string> => {
  try {
    const { rows: packingList } = await client.query(
      `
      SELECT tapl.id::text, t.group_id, t.id AS "togetherId"
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

    const { rows: existMember } = await client.query(
      `
          SELECT *
          FROM "user_group" as ug
          WHERE ug.user_id = $1 AND ug.group_id = $2
        `,
      [userId, packingList[0].group_id],
    );
    if (existMember.length > 0) isMember = true;

    if (isMember === true) {
      const { rows: newPackingList } = await client.query(
        `
            SELECT tal.id::text
            FROM "together_alone_packing_list" tal 
            JOIN "folder_packing_list" fl ON tal.my_packing_list_id = fl.list_id
            JOIN "folder" f ON f.id = fl.folder_id
            JOIN "packing_list" pl ON pl.id =  fl.list_id
            WHERE tal.together_packing_list_id = $1 AND f.user_id = $2 AND pl.is_deleted = false
          `,
        [packingList[0].togetherId, userId],
      );
      if (newPackingList.length === 0) return 'no_list';
      const data: ListInviteResponseDto = {
        id: newPackingList[0].id,
        isMember: isMember,
      };
      return data;
    }

    const data: ListInviteResponseDto = {
      id: packingList[0].id,
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

const getSharedList = async (
  client: any,
  listType: string,
  inviteCode: string,
): Promise<SharedAloneListResponseDto | SharedTogetherListResponseDto | string> => {
  try {
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
  getSharedList,
};
