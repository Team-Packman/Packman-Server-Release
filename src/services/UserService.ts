import { UserCreateDto, UserResponseDto, UserUpdateDto } from '../interfaces/IUser';
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

    const accessToken = jwtHandler.getAccessToken(user[0].id);

    const data: UserResponseDto = {
      id: user[0].id.toString(),
      nickname: user[0].nickname,
      email: user[0].email,
      profileImage: user[0].profile_image,
      accessToken: accessToken,
      refreshToken: user[0].refresh_token,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getUser = async (client: any, userId: string): Promise<UserResponseDto | string> => {
  try {
    const { rows: existUser } = await client.query(
      `
        SELECT u.id::TEXT, u.nickname, u.email, u.profile_image AS "profileImage"
        FROM "user" u
        WHERE u.id = $1 and u.is_deleted = false
      `,
      [userId],
    );

    return existUser[0];
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

  return user[0];
};

const updateUser = async (
  client: any,
  userUpdateDto: UserUpdateDto,
  userId: string
): Promise<UserResponseDto | string> => {
  try {
    if (userUpdateDto.nickname.length > 4) return 'exceed_len';
    const { rows: existUser } = await client.query(
      `
        SELECT *
        FROM "user"
        WHERE id = $1 AND is_deleted = false
      `,
      [userId]
    );
    if( existUser.length === 0) return 'no_user';
    const { rows: user } = await client.query(
      `
        UPDATE "user" 
        SET nickname = $1, profile_image = $2
        WHERE id = $3
        RETURNING *
      `,
      [ userUpdateDto.nickname, userUpdateDto.profileImage, userId ],
    );


    const data: UserResponseDto = {
      id: userId,
      nickname: user[0].nickname,
      email: user[0].email,
      profileImage: user[0].profile_image,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export default {
  createUser,
  getUser,
  deleteUser,
  checkUser,
  updateUser,
};
