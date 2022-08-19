import axios from 'axios';
import { AuthResponseDto } from '../interfaces/IUser';
import getToken from '../modules/jwtHandler';
import UserService from './UserService';

const getKakaoUser = async (client: any, kakaoToken: string): Promise<AuthResponseDto | null> => {
  try {
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
        await UserService.deleteUser(client, userEmail);
      } else {
        const accessToken = getToken(userInfo[0].id);
        data = {
          isAlreadyUser: true,
          id: userInfo[0].id.toString(),
          name: userInfo[0].name,
          nickname: userInfo[0].nickname,
          email: userInfo[0].email,
          profileImage: userInfo[0].profile_image,
          accessToken: accessToken,
        };
      }
    }
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export default {
  getKakaoUser,
};
