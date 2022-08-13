import jwt from 'jsonwebtoken';
import config from '../config';
import { JwtPayloadInfo } from '../interfaces/common/JwtPayloadInfo';

const getToken = (userId: string): string => {
  const payload: JwtPayloadInfo = {
    user: {
      id: userId,
    },
  };

  const accessToken: string = jwt.sign(payload, '' + config.jwtSecret, { expiresIn: '10d' });

  return accessToken;
};

export default getToken;
