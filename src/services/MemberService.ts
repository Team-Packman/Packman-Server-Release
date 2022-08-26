import { MemberResponseDto } from '../interfaces/IMember';
import dayjs from 'dayjs';

const getMember = async (client: any, listId: string): Promise<MemberResponseDto | string> => {
  try {
    const { rows: list } = await client.query(
      `
      SELECT pl.title, TO_CHAR(pl.departure_date,'YYYY-MM-DD') AS "departureDate", tpl.group_id AS "groupId"
      FROM "packing_list" pl
      JOIN together_packing_list tpl on pl.id = tpl.id
      WHERE tpl.id = $1 and pl.is_deleted = false
      `,
      [listId],
    );

    if (list.length === 0) return 'no_list';

    const groupId = list[0].groupId;
    const remainDay = dayjs(list[0].departureDate).diff(dayjs().format('YYYY-MM-DD'), 'day');

    const { rows: member } = await client.query(
      `
      SELECT u.id, u.nickname, u.profile_image AS "profileImage"
      FROM "user_group" ug
      JOIN "user" u on ug.user_id = u.id
      WHERE ug.group_id = $1 and u.is_deleted = false
      ORDER BY ug.id
      `,
      [groupId],
    );

    if (member.length === 0) return 'no_member_user';

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
