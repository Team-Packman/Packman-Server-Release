import logger from '../config/logger';

const getHelp = async (client: any, userId: number) => {
  logger.logger.info(`GET, /help, 엿보기 조회, 200, userId: ${userId}`);
};

export default {
  getHelp,
};
