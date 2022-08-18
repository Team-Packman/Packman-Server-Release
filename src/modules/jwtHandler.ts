import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config';
import { JwtPayloadInfo } from '../interfaces/common/JwtPayloadInfo';

const ac_options: SignOptions = {
  expiresIn: config.jwtAcExpires,
  issuer: config.jwtIssuer,
};

const rf_options: SignOptions = {
  expiresIn: config.jwtRfExpires,
  issuer: config.jwtIssuer,
};

const getAccessToken = (userId: number): string => {
  const payload: JwtPayloadInfo = {
    user: {
      id: userId,
    },
  };

  const accessToken: string = jwt.sign(payload, config.jwtSecret, ac_options);
  return accessToken;
};

const getRefreshToken = (): string => {
  const refreshToken: string = jwt.sign({}, config.jwtSecret, rf_options);

  return refreshToken;
};

const verifyToken = (token: string) => {
  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch (err: any) {
    console.log(err);
    if (err.message === 'jwt expired') {
      return 'expired_token';
    } else {
      return 'invalid_token';
    }
  }
  return decoded;
};

export default {
  getAccessToken,
  getRefreshToken,
  verifyToken,
};
