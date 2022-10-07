import express, { Request, Response, NextFunction } from 'express';
const app = express();
import routes from './routes';
import dotenv from 'dotenv';
import cors from 'cors';
import config from './config';
import morgan from 'morgan';
import { LoggerStream } from './config/logger';

dotenv.config();

app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:3000',
      'https://www.packman.kr',
      'https://www.packgirl.ml',
      'https://api.packman.kr',
      'https://api.packgirl.ml',
      `${config.baseUrl}`,
      `${config.baseUrlDev}`,
      'https://packman-bery1.vercel.app',
    ],
    optionsSuccessStatus: 200,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  morgan('combined', {
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
