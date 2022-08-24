import { TemplateListResponseDto } from '../interfaces/ITemplate';
import { templateListResponse } from '../modules/templateListResponse';

const getTogetherTemplateList = async (
  client: any,
  userId: string,
): Promise<TemplateListResponseDto | string> => {
  try {
    const togetherTemplateList: TemplateListResponseDto = await templateListResponse(
      client,
      userId,
      false,
    );

    return togetherTemplateList;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  getTogetherTemplateList,
};
