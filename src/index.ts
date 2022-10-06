import express, { Request, Response, NextFunction } from 'express';
const app = express();
import routes from './routes';
import dotenv from 'dotenv';
import cors from 'cors';
import config from './config';
import morgan from 'morgan';
import { LoggerStream } from './config/logger';

dotenv.config();

const morganFormat = process.env.NODE_ENV !== 'production' ? 'dev' : 'combined';

app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:3000',
      'https://www.packman.kr',
      'https://api.packman.kr',
      config.baseUrl,
      config.baseUrlDev,
      'https://packman-beryl.vercel.app',
      'https://www.packgirl.ml',
      'https://api.packgirl.ml',
      'https://packgirl.vercel.app',
    ],
    optionsSuccessStatus: 200,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  morgan(morganFormat, {
    skip: (req, res) => {
      return res.statusCode < 400;
    },
    stream: new LoggerStream(),
  }),
);

app.use(routes); //라우터

interface ErrorType {
  message: string;
  status: number;
}

app.use(function (err: ErrorType, req: Request, res: Response, next: NextFunction) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'production' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app
  .listen(process.env.PORT, () => {
    console.log(`
    ################################################
          🛡️  Server listening on port 🛡️
    ################################################
  `);
  })
  .on('error', (err) => {
    console.error(err);
    process.exit(1);
  });

module.exports = app;
