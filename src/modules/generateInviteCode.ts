import { nanoid } from 'nanoid';

const generateInviteCode = async (client: any, listType: string): Promise<string> => {
  try {
    let existInviteCodeCount;
    let inviteCode: string;

    do {
      inviteCode = nanoid(5);
      const { rows: existInviteCode } = await client.query(
        `
          SELECT count(invite_code)
        	FROM "${listType}" pl
        	WHERE pl.invite_code=$1
       `,
        [inviteCode],
      );
      existInviteCodeCount = existInviteCode[0].count;
    } while (!existInviteCodeCount);

    return inviteCode;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export { generateInviteCode };
