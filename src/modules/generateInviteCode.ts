import { nanoid } from 'nanoid';

const generateInviteCode = async (client: any): Promise<string> => {
  try {
    let existInviteCode;
    let inviteCode: string;

    do {
      inviteCode = nanoid(5);
      const { rows: duplicateInviteCode } = await client.query(
        `
          SELECT EXISTS (SELECT *
                         FROM "together_packing_list" tl, "alone_packing_list" al
                         WHERE tl.invite_code = $1 OR al.invite_code = $1)
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
