import logger from '../config/logger';
import { AuthResponseDto } from '../interfaces/IAuth';
import { UserCreateDto, UserLogDto, UserResponseDto, UserUpdateDto } from '../interfaces/IUser';
import jwtHandler from '../modules/jwtHandler';
import FolderService from './FolderService';

const createUser = async (
  client: any,
  userCreateDto: UserCreateDto,
): Promise<AuthResponseDto | string> => {
  try {
    if (userCreateDto.nickname.length > 4) return 'exceed_len';

    const refreshToken = jwtHandler.getRefreshToken();
    userCreateDto.refreshToken = refreshToken;

    await client.query('BEGIN');

    const { rows: user } = await client.query(
      `
        INSERT INTO "user" (email, name, gender, age_range, nickname, profile_image, refresh_token, path)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, gender, age_range, nickname, email, profile_image, refresh_token, path
     `,
      [
        userCreateDto.email,
        userCreateDto.name,
        userCreateDto.gender,
        userCreateDto.ageRange,
        userCreateDto.nickname,
        userCreateDto.profileImage,
        userCreateDto.refreshToken,
        userCreateDto.path,
      ],
    );

    const accessToken = jwtHandler.getAccessToken(user[0].id);

    const data: AuthResponseDto = {
      isAlreadyUser: true,
      id: user[0].id.toString(),
      email: user[0].email,
      name: user[0].name,
      gender: user[0].gender,
      ageRange: user[0].age_range,
      nickname: user[0].nickname,
      profileImage: user[0].profile_image,
      accessToken: accessToken,
      refreshToken: user[0].refresh_token,
      path: user[0].path,
    };
    await client.query('COMMIT');

    const log: UserLogDto = {
      email: user[0].email,
      name: user[0].name,
      gender: user[0].gender,
      ageRange: user[0].age_range,
      nickname: user[0].nickname,
      profileImage: user[0].profile_image,
      path: user[0].path,
    };

    logger.logger.info(
      `POST, /user/profile, 닉네임/프로필 등록, 200, userId: ${data.id}, data: ` +
        JSON.stringify(log),
    );

    return data;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

const getUser = async (client: any, userId: string): Promise<UserResponseDto | string> => {
  const { rows: existUser } = await client.query(
    `
      SELECT u.id::TEXT, u.email, u.nickname, u.profile_image AS "profileImage"
      FROM "user" u
      WHERE u.id = $1 and u.is_deleted = false
    `,
    [userId],
  );

  return existUser[0];
};

const dropUser = async (client: any, userEmail: string) => {
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
  const { rows: user } = await client.query(
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
  userId: string,
): Promise<UserResponseDto | string> => {
  try {
    if (userUpdateDto.nickname.length > 4) return 'exceed_len';
    const { rows: existUser } = await client.query(
      `
        SELECT *
        FROM "user"
        WHERE id = $1 AND is_deleted = false
      `,
      [userId],
    );

    if (existUser.length === 0) return 'no_user';

    await client.query('BEGIN');

    const { rows: user } = await client.query(
      `
        UPDATE "user" 
        SET nickname = $1, profile_image = $2
        WHERE id = $3
        RETURNING *
      `,
      [userUpdateDto.nickname, userUpdateDto.profileImage, userId],
    );

    const data: UserResponseDto = {
      id: userId,
      email: user[0].email,
      nickname: user[0].nickname,
      profileImage: user[0].profile_image,
    };

    await client.query('COMMIT');

    return data;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};
const deleteUser = async (client: any, userId: string) => {
  try {
    await client.query('BEGIN');

    await client.query(
      `
        UPDATE "user" 
        SET is_deleted = true
        WHERE id = $1
      `,
      [userId],
    );

    const { rows: existFolder } = await client.query(
      `
        SELECT f.id
        FROM "folder" f
        WHERE f.user_id = $1
      `,
      [userId],
    );

    const folder = existFolder.map((list: { id: string }) => list.id);

    for (let i = 0; i < folder.length; i++) {
      await FolderService.deleteFolder(client, userId, folder[i]);
    }

    const data = {
      id: userId.toString(),
    };

    await client.query('COMMIT');

    return data;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

export default {
  createUser,
  getUser,
  dropUser,
  checkUser,
  updateUser,
  deleteUser,
};
