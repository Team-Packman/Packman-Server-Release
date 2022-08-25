import { UserCreateDto, UserResponseDto } from '../interfaces/IUser';
import jwtHandler from '../modules/jwtHandler';

const createUser = async (
  client: any,
  userCreateDto: UserCreateDto,
): Promise<UserResponseDto | string> => {
  try {
    if (userCreateDto.nickname.length > 4) return 'exceed_len';

    const refreshToken = jwtHandler.getRefreshToken();
    userCreateDto.refreshToken = refreshToken;

    const { rows } = await client.query(
      `
        INSERT INTO "user" (email, name, nickname, profile_image, refresh_token)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, nickname, email, profile_image, refresh_token
      `,
      [
        userCreateDto.email,
        userCreateDto.name,
        userCreateDto.nickname,
        userCreateDto.profileImage,
        userCreateDto.refreshToken,
      ],
    );

    const accessToken = jwtHandler.getAccessToken(rows[0].id);

    const data: UserResponseDto = {
      id: rows[0].id.toString(),
      nickname: rows[0].nickname,
      email: rows[0].email,
      profileImage: rows[0].profile_image,
      accessToken: accessToken,
      refreshToken: rows[0].refresh_token,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
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

const checkUser = async (client: any, userId: string) => {
  const { rows } = await client.query(
    `
      SELECT *
      FROM "user" u
      WHERE u.id = $1 and is_deleted = false
    `,
    [userId],
  );

  return rows[0];
};

export default {
  createUser,
  deleteUser,
  checkUser,
};
