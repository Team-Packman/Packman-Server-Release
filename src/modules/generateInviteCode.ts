import { nanoid } from 'nanoid';

const generateInviteCode = async (client: any, listType: string): Promise<string> => {
  try {
    let existInviteCode;
    let inviteCode: string;

    do {
      inviteCode = nanoid(5);
      const { rows: duplicateInviteCode } = await client.query(
        `
          SELECT EXISTS (SELECT *
                         FROM "${listType}" pl
                         WHERE pl.invite_code=$1)
       `,
        [inviteCode],
      );
      existInviteCode = duplicateInviteCode[0].exists;
    } while (existInviteCode);

    return inviteCode;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export { generateInviteCode };
