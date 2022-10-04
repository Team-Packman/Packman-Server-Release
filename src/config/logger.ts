import { createLogger, transports, format } from 'winston';
import winstonDaily from 'winston-daily-rotate-file'; // 로그 파일 일자별로 ㄴ생성
import appRoot from 'app-root-path'; // app root 경로를 가져오는 lib
import process from 'process';

const logDir = `${appRoot}/logs`; // logs 디렉토리 하위에 로그파일 저장

const { combine, timestamp, printf, colorize, simple } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp}, ${level}:, ${message}`; // log 출력 포맷 정의
});

const opts = {
  info: new winstonDaily({
    level: 'info',
    datePattern: 'YYYY-MM-DD',
    dirname: logDir,
    filename: `%DATE%.log`,
    maxFiles: 30, // 30일치 로그 파일 저장
    zippedArchive: true,
  }),
  error: new winstonDaily({
    level: 'error',
    datePattern: 'YYYY-MM-DD',
    dirname: logDir,
    filename: `%DATE%.error.log`,
    maxFiles: 30,
    zippedArchive: true,
  }),
  exception: new winstonDaily({
    level: 'error',
    datePattern: 'YYYY-MM-DD',
    dirname: logDir,
    filename: `%DATE%.exception.log`,
    maxFiles: 30,
    zippedArchive: true,
  }),
  console: new transports.Console({
    format: combine(
      colorize(), // 색깔 넣어서 출력
      simple(), // `${info.level}: ${info.message} JSON.stringify({...rest})` 포맷으로 출력
    ),
  }),
};

/**
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat, // log 출력 포맷
  ),
  transports: [
    // info 레벨 로그를 저장할 파일 설정
    opts.info,
    // error 레벨 로그를 저장할 파일 설정
    opts.error,
  ],

  exceptionHandlers: [opts.exception],
});

// Production 환경이 아닌 경우(dev 등)
if (process.env.NODE_ENV !== 'production') {
  logger.add(opts.console);
}

const stream = {
  write: (message: any) => {
    logger.log(message);
  },
};

export default {
  logger,
  stream,
};
