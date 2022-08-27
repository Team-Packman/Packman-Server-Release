import {
  PackerUpdateDto,
  TogetherListResponseDto,
  TogetherListCategoryResponseDto,
  TogetherListInfoResponseDto,
  UseForMapInDeleteDto,
} from '../interfaces/ITogetherList';
import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';
import { togetherCategoryResponse } from '../modules/togetherCategoryResponse';
import { nanoid } from 'nanoid';
import { ListCreateDto } from '../interfaces/IList';

const createTogetherList = async (
  client: any,
  userId: number,
  togetherListCreateDto: ListCreateDto,
): Promise<TogetherListResponseDto | string> => {
  try {
    const inviteCode = nanoid(5);

    if (togetherListCreateDto.title.length > 12) return 'exceed_len';

    const { rows: listIdArray } = await client.query(
      `
        INSERT INTO "packing_list" (title, departure_date)
        VALUES ($1, $2), ($1, $2)
        RETURNING id, is_saved
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
        SELECT p.title AS "title", TO_CHAR(p.departure_date,'YYYY-MM-DD') AS "departureDate",
          t.group_id AS "groupId", t.invite_code AS "inviteCode"
        FROM "packing_list" p
        JOIN "together_packing_list" t ON p.id=t.id 
        WHERE t.id=$1
      `,
      [togetherListId],
    );
    const etcData = etcDataArray[0];

    const togetherCategory = await togetherCategoryResponse(client, togetherListId);
    const myListCategory = await aloneCategoryResponse(client, myListId);

    const data: TogetherListResponseDto = {
      id: togetherMyId.toString(),
      title: etcData.title,
      departureDate: etcData.departureDate,
      togetherPackingList: {
        id: togetherListId.toString(),
        groupId: etcData.groupId.toString(),
        category: togetherCategory,
        inviteCode: etcData.inviteCode,
        isSaved: listIdArray[1].is_saved,
      },
      myPackingList: {
        id: myListId.toString(),
        category: myListCategory,
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
        ORDER BY p.id
      `,
      [listId],
    );
    if (existList.length < 2) return 'no_list';

    const { rows: etcDataArray } = await client.query(
      `
        SELECT ta.together_packing_list_id::text AS "togetherListId", ta.my_packing_list_id::text AS "myListId",
          t.group_id::text AS "groupId", t.invite_code AS "inviteCode",
          p.title AS "title", TO_CHAR(p.departure_date,'YYYY-MM-DD') AS "departureDate"
        FROM (SELECT * FROM "together_alone_packing_list" WHERE id=$1) ta
        JOIN "together_packing_list" t ON ta.together_packing_list_id=t.id
        JOIN "packing_list" p ON t.id=p.id
      `,
      [listId],
    );
    const etcData = etcDataArray[0];

    const togetherCategory = await togetherCategoryResponse(client, etcData.togetherListId);
    const myCategory = await aloneCategoryResponse(client, etcData.myListId);

    const { rows: groupInfo } = await client.query(
      `
        SELECT g.id::text AS "id",
          COALESCE(json_agg(json_build_object(
              'id', u.id::text,
              'nickname', u.nickname,
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
        category: togetherCategory,
        inviteCode: etcData.inviteCode,
        isSaved: existList[1].is_saved,
      },
      myPackingList: {
        id: etcData.myListId,
        category: myCategory,
      },
      group: groupInfo[0],
      isMember: isMember[0].exists,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updatePacker = async (
  client: any,
  packerUpdateDto: PackerUpdateDto,
): Promise<TogetherListCategoryResponseDto | string> => {
  try {
    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "packing_list" pl
        WHERE pl.id =$1  AND pl.is_deleted=false
      `,
      [packerUpdateDto.listId],
    );
    if (existList.length === 0) return 'no_list';

    const { rows: existPack } = await client.query(
      `
        SELECT *
        FROM "pack" p
        WHERE p.id = $1 
      `,
      [packerUpdateDto.packId],
    );
    if (existPack.length === 0) return 'no_pack';

    const { rows: existListPack } = await client.query(
      `
        SELECT *
        FROM "packing_list" pl
        JOIN "category" c ON pl.id=c.list_id
        JOIN "pack" p ON c.id=p.category_id
        WHERE pl.id=$1 AND p.id =$2
      `,
      [packerUpdateDto.listId, packerUpdateDto.packId],
    );
    if (existListPack.length === 0) return 'no_list_pack';

    const { rows: existUser } = await client.query(
      `
        SELECT *
        FROM "user" u
        WHERE u.id=$1 AND u.is_deleted = false
     `,
      [packerUpdateDto.packerId],
    );
    if (existUser.length === 0) return 'no_user';

    await client.query(
      `
        UPDATE "pack"
        SET packer_id=$1
        WHERE id=$2
      `,
      [packerUpdateDto.packerId, packerUpdateDto.packId],
    );

    const togetherCategory = await togetherCategoryResponse(client, packerUpdateDto.listId);

    const data: TogetherListCategoryResponseDto = {
      id: packerUpdateDto.listId,
      category: togetherCategory,
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

    await client.query(
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

    await client.query(
      `
        INSERT INTO "together_alone_packing_list" (my_packing_list_id, together_packing_list_id)
        VALUES ($1, $2)
      `,
      [aloneList[0].id, togetherList[0].id],
    );

    await client.query(
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

const deleteTogetherList = async (
  client: any,
  userId: number,
  folderId: string,
  listMappingId: string,
): Promise<TogetherListInfoResponseDto | string> => {
  try {
    // listMappingIdArray는 혼자-함께 패킹리스트 연결 id를 의미(together_alone_packing_list table의 id)
    const listMappingIdArray: string[] = listMappingId.split(',');

    const { rows: existFolder } = await client.query(
      `
        SELECT *
        FROM "folder" as f
        WHERE f.id=$1 AND f.is_aloned=false AND f.user_id=$2
      `,
      [folderId, userId],
    );
    if (existFolder.length === 0) return 'no_folder';

    const { rows: existList } = await client.query(
      `
        SELECT p.id
        FROM "together_alone_packing_list" as l
        JOIN "packing_list" p ON l.together_packing_list_id=p.id OR l.my_packing_list_id=p.id
        WHERE l.id IN (${listMappingIdArray}) AND p.is_deleted=false
        ORDER BY p.id
      `,
    );
    if (existList.length !== listMappingIdArray.length * 2) return 'no_list';
    //listIdArray = 삭제할 모든 together, alone list id 담김
    const listIdArray = await existList.map((element: UseForMapInDeleteDto) => element.id);
    //aloneListIdArray = 삭제할 alone list id 담김
    const aloneListIdArray = await listIdArray.filter(
      (element: number, index: number) => index % 2 === 1,
    );
    //togetherListIdArray = 삭제할 together list id 담김, together list는 상황에 따라 삭제여부 결정
    const togetherListIdArray = await listIdArray.filter(
      (element: number, index: number) => index % 2 === 0,
    );

    const { rows: existFolderList } = await client.query(
      `
        SELECT *
        FROM "folder_packing_list" as f
        WHERE f.folder_id=$1 AND f.list_id IN (${aloneListIdArray})
      `,
      [folderId],
    );
    if (existFolderList.length !== aloneListIdArray.length) return 'no_folder_list';

    /**
     * 주석 앞의 '기본'은 들어온 모든 리스트가 해야 하는 동작을 의미
     * '기본'이 없다면 user_group의 개수가 1이기에 together까지 삭제하는 경우 행하는 동작
     **/

    // 기본 - folder_packing_list table에서 지울 alonelist가 속한 튜플 삭제
    await client.query(
      `
        DELETE
        FROM "folder_packing_list" fpl
        WHERE fpl.list_id IN (${aloneListIdArray})
      `,
    );

    // 기본 - together_alone_packing_list에서 지울 alonelist가 속한 튜플 삭제
    await client.query(
      `
        DELETE
        FROM "together_alone_packing_list" tapl
        WHERE tapl.my_packing_list_id IN (${aloneListIdArray})
      `,
    );

    // user_group의 개수가 1이기에 삭제해야 하는 together_packing_list와 해당 패킹리스트의 group id 선별
    const { rows: deleteItemArray } = await client.query(
      `
      SELECT tpl.id, tpl.group_id as "groupId"
      FROM "together_packing_list" tpl
      JOIN "user_group" ug ON tpl.group_id=ug.group_id
      WHERE tpl.id IN (${togetherListIdArray})
      GROUP BY tpl.id
      HAVING count(ug.id)=1
      `,
    );

    let deleteTogetherListIdArray: number[] = [];
    if (deleteItemArray.length !== 0) {
      // 삭제해야 할 together_packing_list의 id 배열
      deleteTogetherListIdArray = await deleteItemArray.map(
        (element: UseForMapInDeleteDto) => element.id,
      );
      // 삭제해야 할 together_packing_list group의 id 배열
      const deleteGroupIdArray = await deleteItemArray.map(
        (element: UseForMapInDeleteDto) => element.groupId,
      );

      //together_packing_list를 삭제 하는 경우 group도 삭제
      await client.query(
        `
          DELETE
          FROM "group" g
          WHERE g.id IN (${deleteGroupIdArray})
      `,
      );
    }

    // 기본 - is_deleted 처리할 패킹리스트 모음(모든 alone_packing_list + user_group 수가 1이라 삭제할 together_packing_list)
    const deleteListArray = aloneListIdArray.concat(deleteTogetherListIdArray);

    // 기본 - 위에서 모은 packing_list is_deleted 처리
    await client.query(
      `
        UPDATE "packing_list"
        SET is_deleted=true
        WHERE id IN (${deleteListArray})
      `,
    );

    const { rows: togetherPackingListInfoArray } = await client.query(
      `
        SELECT tapl.id::text, pl.title, pl.departure_date::text as "departureDate",
              count(p.id)::text as "packTotalNum", count(p.id) FILTER ( WHERE p.is_checked=false )::text as "packRemainNum"
        FROM "folder_packing_list" fpl
        JOIN "together_alone_packing_list" tapl ON fpl.list_id=tapl.my_packing_list_id
        JOIN "packing_list" pl ON tapl.together_packing_list_id= pl.id
        LEFT JOIN "category" c ON pl.id=c.list_id
        LEFT JOIN "pack" p ON c.id=p.category_id
        WHERE fpl.folder_id=$1 AND pl.is_deleted=false
        GROUP BY tapl.id, pl.id
        ORDER BY pl.id DESC
      `,
      [folderId],
    );

    const data: TogetherListInfoResponseDto = {
      togetherPackingList: togetherPackingListInfoArray,
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
  updatePacker,
  addMember,
  deleteTogetherList,
};
