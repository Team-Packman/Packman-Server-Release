import { TemplateListResponseDto } from '../interfaces/ITemplate';
import { templateListResponse } from '../modules/templateListResponse';

const getAloneTemplateList = async (
  client: any,
  userId: string,
): Promise<TemplateListResponseDto | string> => {
  try {
    const aloneTemplateList: TemplateListResponseDto = await templateListResponse(
      client,
      userId,
      true,
    );

    return aloneTemplateList;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  getAloneTemplateList,
};
