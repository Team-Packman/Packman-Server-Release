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

  user: process.env.PROD_DB_USER,
  host: process.env.PROD_DB_HOST,
  database: process.env.PROD_DB_DB,
  password: process.env.PROD_DB_PASSWORD,

  /**
   * jwt Secret
   */

  jwtSecret: process.env.JWT_SECRET as string,

  /**
   * jwt Algorithm
   */
  jwtAlgo: process.env.JWT_ALGO as string,
};
