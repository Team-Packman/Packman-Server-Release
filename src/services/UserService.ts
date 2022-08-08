// eslint-disable-next-line @typescript-eslint/no-var-requires
const convertSnakeToCamel = require('../modules/convertSnakeToCamel');

const createUser = async (client: any, email: string, nickname: string, profile_image: number) => {
  const { rows } = await client.query(
    `
    INSERT INTO "user" (email, nickname, profile_image)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [email, nickname, profile_image],
  );
  return email;
};

export default {
  createUser,
};
