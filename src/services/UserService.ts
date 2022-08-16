// eslint-disable-next-line @typescript-eslint/no-var-requires
import { UserCreateDto, UserResponseDto } from '../interfaces/IUser';
import getToken from '../modules/jwtHandler';

const createUser = async (
  client: any,
  userCreateDto: UserCreateDto,
): Promise<UserResponseDto | null | string> => {
  if (userCreateDto.nickname.length > 4) return 'exceed_limit';

  const { rows } = await client.query(
    `
    INSERT INTO "user" (email, name, nickname, profile_image)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nickname, email, profile_image
    `,
    [userCreateDto.email, userCreateDto.name, userCreateDto.nickname, userCreateDto.profileImage],
  );

  const accessToken = getToken(rows[0].id);

  const data: UserResponseDto = {
    id: rows[0].id.toString(),
    nickname: rows[0].nickname,
    email: rows[0].email,
    profileImage: rows[0].profile_image,
    accessToken: accessToken,
  };

  return data;
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
