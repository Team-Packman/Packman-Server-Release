import axios from 'axios';
import { AuthResponseDto, AuthTokenResponseDto } from '../interfaces/IAuth';
import jwtHandler from '../modules/jwtHandler';
import UserService from './UserService';
import jwt from 'jsonwebtoken';

const getKakaoUser = async (client: any, kakaoToken: string): Promise<AuthResponseDto | null> => {
  const response = await axios({
    method: 'get',
    url: 'https://kapi.kakao.com/v2/user/me',
    headers: {
      Authorization: `Bearer ${kakaoToken}`,
    },
  });
  if (!response) return null;

  const userEmail = response.data.kakao_account.email;
  const userName = response.data.kakao_account.profile.nickname;

  const { rows: userInfo } = await client.query(
    `
      SELECT *
      FROM "user"
      WHERE email=$1
    `,
    [userEmail],
  );

  let data: AuthResponseDto = {
    isAlreadyUser: false,
    name: userName,
    email: userEmail,
  };

  if (userInfo.length) {
    if (userInfo[0].is_deleted) {
      await UserService.dropUser(client, userEmail);
    } else {
      const accessToken = jwtHandler.getAccessToken(userInfo[0].id);
      const refreshToken = jwtHandler.getRefreshToken();

      await client.query(
        `
          UPDATE "user"
          SET refresh_token = $1
          WHERE id = $2
        `,
        [refreshToken, userInfo[0].id],
      );

      data = {
        isAlreadyUser: true,
        id: userInfo[0].id.toString(),
        name: userInfo[0].name,
        nickname: userInfo[0].nickname,
        email: userInfo[0].email,
        profileImage: userInfo[0].profile_image,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    }
  }
  return data;
};

const getNewToken = async (
  client: any,
  accessToken: string,
  refreshToken: string,
): Promise<AuthTokenResponseDto | string | undefined> => {
  try {
    const decodedAc = jwtHandler.verifyToken(accessToken);
    const decodedRf = jwtHandler.verifyToken(refreshToken);
    const decoded = jwt.decode(accessToken);

    if (decodedAc === 'invalid_token' || decodedRf === 'invalid_token') return 'invalid_token';

    const userId = (decoded as any).user.id;

    const { rows: existUser } = await client.query(
      `
        SELECT *
        FROM "user" u
        WHERE u.id = $1 and is_deleted = false
      `,
      [userId],
    );

    if (existUser.length === 0) return 'no_user';

    const { rows: refresh } = await client.query(
      `
        SELECT u.refresh_token
        FROM "user" u
        WHERE u.id = $1
    `,
      [userId],
    );

    if (refresh[0].refresh_token !== refreshToken) return 'no_user_refresh';

    if (decodedAc === 'expired_token') {
      //accessToken이 만료되고 refreshToken도 만료된 경우
      if (decodedRf === 'expired_token') {
        return 'all_expired_token';
      } else {
        // accessToken이 만료되고 refreshToken은 만료되지 않은 경우
        const newAcToken = jwtHandler.getAccessToken(userId);

        const data: AuthTokenResponseDto = {
          accessToken: newAcToken,
          refreshToken,
        };
        return data;
      }
    }

    // accessToken이 만료되지 않은 경우
    return 'valid_token';
  } catch (error) {
    console.log(error);
  }
};

export default {
  getKakaoUser,
  getNewToken,
};
