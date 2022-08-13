// eslint-disable-next-line @typescript-eslint/no-var-requires
const convertSnakeToCamel = require('../modules/convertSnakeToCamel');

const createUser = async (
  client: any,
  email: string,
  nickname: string,
  name: string,
  profile_image: number,
) => {
  const { rows } = await client.query(
    `
    INSERT INTO "user" (email, nickname, profile_image, name, is_deleted)
    VALUES ($1, $2, $3, $4, true)
    RETURNING *
    `,
    [email, nickname, profile_image, name],
  );
  return email;
};

const deleteUser = async (client: any, userEmail: string) => {
  await client.query(
    `
          DELETE 
          FROM "user"
          WHERE email=$1
    `,
    [userEmail],
  );
};

export default {
  createUser,
  deleteUser,
};
