import { MemberResponseDto, MemberDeleteResponseDto } from '../interfaces/IMember';
import dayjs from 'dayjs';

const getMember = async (
  client: any,
  userId: number,
  groupId: string,
): Promise<MemberResponseDto | string> => {
  try {
    const { rows: existGroup } = await client.query(
      `
      SELECT *
      FROM "group" g
      WHERE g.id = $1
    `,
      [groupId],
    );

    if (existGroup.length === 0) return 'no_group';

    const { rows: member } = await client.query(
      `
      SELECT u.id::TEXT, u.nickname, u.profile_image AS "profileImage"
      FROM "user_group" ug
      JOIN "user" u on ug.user_id = u.id
      WHERE ug.group_id = $1 and u.is_deleted = false
      ORDER BY ug.id
      `,
      [groupId],
    );

    if (member.length === 0) return 'empty_member';

    const memberArr = member.map((list: { id: string }) => list.id);
    if (!memberArr.includes(userId.toString())) return 'no_member_user';

    const { rows: list } = await client.query(
      `
      SELECT pl.title, TO_CHAR(pl.departure_date,'YYYY-MM-DD') AS "departureDate"
      FROM "group" g
      JOIN together_packing_list tpl on g.id = tpl.group_id
      JOIN packing_list pl on tpl.id = pl.id
      WHERE g.id = $1 AND pl.is_deleted = false
      `,
      [groupId],
    );

    if (list.length === 0) return 'no_list';

    const remainDay = dayjs(list[0].departureDate).diff(dayjs().format('YYYY-MM-DD'), 'day');

    const data: MemberResponseDto = {
      title: list[0].title,
      departureDate: list[0].departureDate,
      remainDay: remainDay.toString(),
      member: member,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteMember = async (
  client: any,
  userId: number,
  groupId: string,
  memberId: string,
): Promise<MemberDeleteResponseDto | string> => {
  try {
    const { rows: existUser } = await client.query(
      `
        SELECT *
        FROM "user" u
        WHERE u.id = $1 and u.is_deleted = false
      `,
      [memberId],
    );

    if (existUser.length === 0) return 'no_user';

    const { rows: existGroup } = await client.query(
      `
        SELECT *
        FROM "group" g
        WHERE g.id = $1
      `,
      [groupId],
    );

    if (existGroup.length === 0) return 'no_group';

    const { rows: existUserGroup } = await client.query(
      `
      SELECT ug.user_id as id
      FROM "user_group" ug
      JOIN "user" u on ug.user_id = u.id
      WHERE ug.group_id = $1 AND u.is_deleted = false
      ORDER BY  ug.id
      `,
      [groupId],
    );

    // member에 유저가 한 명도 없을 때
    if (existUserGroup.length === 0) return 'empty_member';

    // 삭제 권한이 없는 유저일 때
    if (existUserGroup[0].id !== userId) {
      return 'no_maker';
    } else {
      // 삭제 권한이 있는 유저가 본인을 삭제하려고 할 때
      if (memberId === userId.toString()) return 'no_delete_maker';

      const memberArr = existUserGroup.map((list: { id: number }) => list.id);
      if (!memberArr.includes(Number(memberId))) return 'no_member_user';

      await client.query(
        `
        DELETE FROM "user_group"
        WHERE group_id = $1 AND user_id = $2
        `,
        [groupId, memberId],
      );

      const { rows: member } = await client.query(
        `
        SELECT u.id::TEXT, u.nickname, u.profile_image AS "profileImage"
        FROM "user_group" ug
        JOIN "user" u on ug.user_id = u.id
        WHERE ug.group_id = $1 and u.is_deleted = false
        ORDER BY ug.id
        `,
        [groupId],
      );

      const data = {
        member: member,
      };

      return data;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  getMember,
  deleteMember,
};
