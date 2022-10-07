import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  /**
   * environment
   */
  env: process.env.NODE_ENV as string,

  /**
   * Your favorite port
   */
  port: parseInt(process.env.PORT as string, 10) as number,

  /**
   * baseUrl
   */
  baseUrl: process.env.BASE_URL as string,

  /**
   * baseUrl_dev
   */
  baseUrlDev: process.env.BASE_URL_DEV as string,

  /**
   * jwt Secret
   */

  jwtSecret: process.env.JWT_SECRET as string,

  /**
   * jwt issuer
   */
  jwtIssuer: process.env.JWT_ISSUER as string,

  /**
   * jwt accessToken expire time
   */
  jwtAcExpires: process.env.JWT_AC_EXPIRES as string,

  /**
   * jwt refreshToken expire time
   */
  jwtRfExpires: process.env.JWT_RF_EXPIRES as string,
};
