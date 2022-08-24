import { TemplateListResponseDto } from '../interfaces/ITemplate';

const getAloneTemplateList = async (
  client: any,
  userId: string,
): Promise<TemplateListResponseDto | string> => {
  try {
    const { rows: basicTemplateList } = await client.query(
      `
    	SELECT t.id::text, t.title
      FROM template t
			WHERE user_id IS NULL AND is_deleted=false
			ORDER BY t.id
			`,
    );

    const { rows: myTemplateList } = await client.query(
      `
			SELECT t.id::text, t.title
			FROM template t
			WHERE user_id=$1 AND is_aloned=true AND is_deleted=false
			`,
      [userId],
    );

    const data: TemplateListResponseDto = {
      basicTemplate: basicTemplateList,
      myTemplate: myTemplateList,
    };

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  getAloneTemplateList,
};
