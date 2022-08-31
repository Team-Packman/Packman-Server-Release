import { MemberResponseDto } from '../interfaces/IMember';
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

export default {
  getMember,
};
