import {
  PackerUpdateDto,
  TogetherListResponseDto,
  TogetherListCategoryResponseDto,
  TogetherAloneResponseDto,
  TogetherListInfoResponseDto,
  UseForMapInDeleteDto,
  UseForReduceInDeleteDto,
} from '../interfaces/ITogetherList';
import { aloneCategoryResponse } from '../modules/aloneCategoryResponse';
import { togetherCategoryResponse } from '../modules/togetherCategoryResponse';
import { ListCreateDto, ListInviteResponseDto } from '../interfaces/IList';
import { generateInviteCode } from '../modules/generateInviteCode';
import { folderCheckResponse } from '../modules/folderCheckResponse';
import { togetherListCheckResponse } from '../modules/togetherListCheckResponse';

const createTogetherList = async (
  client: any,
  userId: number,
  togetherListCreateDto: ListCreateDto,
): Promise<TogetherListResponseDto | string> => {
  try {
    const inviteCode: string = await generateInviteCode(client);

    if (togetherListCreateDto.title.length > 12) return 'exceed_len';

    const check = await folderCheckResponse(client, userId, togetherListCreateDto.folderId, false);
    if (check === 'no_folder') return 'no_folder';

    const { rows: insertListInfo } = await client.query(
      `
        INSERT INTO "packing_list" (title, departure_date)
        VALUES ($1, $2), ($1, $2)
        RETURNING id, title, TO_CHAR(departure_date,'YYYY-MM-DD') AS "departureDate", is_saved AS "isSaved"
      `,
      [togetherListCreateDto.title, togetherListCreateDto.departureDate],
    );
    const togetherListId = insertListInfo[0].id;
    const myListId = insertListInfo[1].id;

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

    const { rows: insertTogetherList } = await client.query(
      `
        INSERT INTO "together_packing_list" (id, group_id, invite_code)
        VALUES ($1, $2, $3)
        RETURNING invite_code AS "inviteCode"
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

    if (togetherListCreateDto.templateId === '') {
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
          ORDER BY c.id
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
            ORDER BY p.id
          `,
          [categoryId, templateCategoryId],
        );
      }
    }

    const togetherCategory = await togetherCategoryResponse(client, togetherListId);
    const myListCategory = await aloneCategoryResponse(client, myListId);

    const data: TogetherListResponseDto = {
      id: togetherMyId.toString(),
      title: insertListInfo[0].title,
      departureDate: insertListInfo[0].departureDate,
      togetherPackingList: {
        id: togetherListId.toString(),
        groupId: groupId.toString(),
        category: togetherCategory,
        inviteCode: insertTogetherList[0].inviteCode,
        isSaved: insertListInfo[1].isSaved,
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

const getTogetherList = async (
  client: any,
  listId: string,
  userId: number,
): Promise<TogetherListResponseDto | string> => {
  try {
    const existList = await togetherListCheckResponse(client, userId, listId);
    if (existList.length < 2) return 'no_list';

    const { rows: etcData } = await client.query(
      `
        SELECT tpl.group_id::text AS "groupId", tpl.invite_code AS "inviteCode"
        FROM "together_packing_list" tpl
        WHERE tpl.id=$1
      `,
      [existList[0].togetherListId],
    );

    const togetherCategory = await togetherCategoryResponse(client, existList[0].togetherListId);
    const myCategory = await aloneCategoryResponse(client, existList[0].myListId);

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
      [etcData[0].groupId],
    );

    const { rows: isMember } = await client.query(
      `
        SELECT EXISTS(
        SELECT *
        FROM "user_group" ug
        WHERE ug.group_id=$1 AND ug.user_id=$2)
      `,
      [etcData[0].groupId, userId],
    );

    const data: TogetherListResponseDto = {
      id: listId,
      folderId: existList[0].folderId,
      title: existList[0].title,
      departureDate: existList[0].departureDate,
      togetherPackingList: {
        id: existList[0].togetherListId,
        groupId: etcData[0].groupId,
        category: togetherCategory,
        inviteCode: etcData[0].inviteCode,
        isSaved: existList[1].isSaved,
      },
      myPackingList: {
        id: existList[0].myListId,
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
  userId: number,
  packerUpdateDto: PackerUpdateDto,
): Promise<TogetherListCategoryResponseDto | string> => {
  try {
    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "together_packing_list" tpl
        JOIN "packing_list" pl ON tpl.id=pl.id
        JOIN "user_group" ug ON tpl.group_id=ug.group_id
        WHERE tpl.id=$1  AND pl.is_deleted=false AND ug.user_id=$2
      `,
      [packerUpdateDto.listId, userId],
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

const addMember = async (
  client: any,
  listId: string,
  userId: string,
): Promise<string | TogetherAloneResponseDto> => {
  try {
    const { rows: togetherList } = await client.query(
      `
        SELECT tpl.group_id as "groupId", pl.title as title, pl.departure_date as "departureDate", tpl.id as "togetherId"
        FROM together_alone_packing_list tapl
        JOIN together_packing_list tpl on tapl.together_packing_list_id = tpl.id
        JOIN packing_list pl on tpl.id = pl.id
        WHERE tapl.id = $1 AND pl.is_deleted = false
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
      [userId, togetherList[0].groupId],
    );
    if (existMember.length > 0) return 'already_exist_member';

    await client.query(
      `
        INSERT INTO "user_group" (user_id, group_id)
        VALUES ($1, $2)
      `,
      [userId, togetherList[0].groupId],
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
      [togetherList[0].title, togetherList[0].departureDate],
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
        INSERT INTO "category" (list_id, name)
        VALUES ($1, '기본')
      `,
      [packingList[0].id],
    );

    const { rows: aloneTogether } = await client.query(
      `
        INSERT INTO "together_alone_packing_list" (my_packing_list_id, together_packing_list_id)
        VALUES ($1, $2)
        RETURNING id::text
      `,
      [aloneList[0].id, togetherList[0].togetherId],
    );

    await client.query(
      `
        INSERT INTO "folder_packing_list" (folder_id, list_id)
        VALUES ($1, $2)
      `,
      [folderId, aloneList[0].id],
    );

    const data = {
      listId: aloneTogether[0].id,
    };

    return data;
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

    const check = await folderCheckResponse(client, userId, folderId, false);
    if (check === 'no_folder') return 'no_folder';

    const { rows: existList } = await client.query(
      `
        SELECT my_packing_list_id as "myListId", together_packing_list_id as "togetherListId"
        FROM "together_alone_packing_list" as l
        JOIN "packing_list" p ON l.together_packing_list_id=p.id OR l.my_packing_list_id=p.id
        WHERE l.id IN (${listMappingIdArray}) AND p.is_deleted=false
        ORDER BY p.id
      `,
    );
    if (existList.length !== listMappingIdArray.length * 2) return 'no_list';

    //aloneListIdArray = 삭제할 alone list id 담김
    const aloneListIdArray = existList.reduce(
      (acc: number[], element: UseForReduceInDeleteDto) =>
        acc.includes(element.myListId) ? acc : [...acc, element.myListId],
      [],
    );

    //togetherListIdArray = 삭제할 together list id 담김, together list는 상황에 따라 삭제여부 결정
    const togetherListIdArray = existList.reduce(
      (acc: number[], element: UseForReduceInDeleteDto) =>
        acc.includes(element.togetherListId) ? acc : [...acc, element.togetherListId],
      [],
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
     * 주석 앞의 '공통'은 들어온 모든 리스트가 해야 하는 동작을 의미
     * '공통'이 없다면 user_group의 개수가 0이기에 together까지 삭제하는 경우 행하는 동작
     **/

    // 공통 - together list의 pack에 현재 user가 packer로 등록되어 있을 경우packer_id를 null로 변경
    await client.query(
      `
        UPDATE "pack" p
        SET packer_id= null
        FROM together_packing_list tpl
        JOIN category c ON tpl.id=c.list_id
        WHERE tpl.id IN (${togetherListIdArray}) AND p.category_id=c.id AND p.packer_id=$1
      `,
      [userId],
    );

    // 공통 - folder_packing_list table에서 지울 alonelist가 속한 튜플 삭제
    await client.query(
      `
        DELETE
        FROM "folder_packing_list" fpl
        WHERE fpl.list_id IN (${aloneListIdArray})
      `,
    );

    // 공통 - together_alone_packing_list table에서 지울 alonelist가 속한 튜플 삭제
    await client.query(
      `
        DELETE
        FROM "together_alone_packing_list" tapl
        WHERE tapl.my_packing_list_id IN (${aloneListIdArray})
      `,
    );

    // 공통 - user_group table에서 지울 together list의 group과 userId가 연관된 튜플 삭제
    await client.query(
      `
        DELETE
        FROM "user_group" ug
        USING "together_packing_list" tpl
        WHERE tpl.id IN (${togetherListIdArray}) AND ug.group_id=tpl.group_id AND ug.user_id=$1
      `,
      [userId],
    );

    // 공통 - 함께 리스트 group의  user_group 수가 0인 together_packing_list와 해당 패킹리스트의 group id 선별
    // user_group의 수가 0이라는 것은 해당 함께 패킹리스트에 속하는 멤버 없다는 의미-> 함께 리스트 삭제
    const { rows: deleteItemArray } = await client.query(
      `
        SELECT tpl.id, tpl.group_id as "groupId"
        FROM "together_packing_list" tpl
        LEFT JOIN "user_group" ug ON tpl.group_id=ug.group_id
        WHERE tpl.id IN (${togetherListIdArray})
        GROUP BY tpl.id
        HAVING count(ug.id)=0
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

    // 공통 - is_deleted 처리할 패킹리스트 종합하기(모든 alone_packing_list + user_group 수가 0이라 삭제할 together_packing_list)
    const deleteListArray = aloneListIdArray.concat(deleteTogetherListIdArray);

    // 공통 - 위에서 종합한 packing_list is_deleted 처리
    await client.query(
      `
        UPDATE "packing_list"
        SET is_deleted=true
        WHERE id IN (${deleteListArray})
      `,
    );

    const { rows: togetherPackingListInfoArray } = await client.query(
      `
        SELECT tapl.id::text, pl.title, TO_CHAR(pl.departure_date,'YYYY-MM-DD') AS "departureDate",
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

const getInviteTogetherList = async (
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

export default {
  createTogetherList,
  getTogetherList,
  updatePacker,
  addMember,
  deleteTogetherList,
  getInviteTogetherList,
};
