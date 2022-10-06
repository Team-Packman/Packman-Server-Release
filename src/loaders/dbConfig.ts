import dotenv from 'dotenv';
dotenv.config();

export interface config {
  user: string | undefined;
  host: string | undefined;
  database: string | undefined;
  password: string | undefined;
}

let config: config;

if (process.env.NODE_ENV === 'production') {
  config = {
    user: process.env.PROD_DB_USER,
    host: process.env.PROD_DB_HOST,
    database: process.env.PROD_DB_DB,
    password: process.env.PROD_DB_PASSWORD,
  };
} else if (process.env.NODE_ENV === 'development') {
  config = {
    user: process.env.DEV_DB_USER,
    host: process.env.DEV_DB_HOST,
    database: process.env.DEV_DB_DB,
    password: process.env.DEV_DB_PASSWORD,
  };
} else {
  config = {
    user: process.env.LOCAL_DB_USER,
    host: process.env.LOCAL_DB_HOST,
    database: process.env.LOCAL_DB_DB,
    password: process.env.LOCAL_DB_PASSWORD,
  };
}

export default config;
