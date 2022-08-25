import { TemplateListResponseDto } from '../interfaces/ITemplate';

async function templateListResponse(
  client: any,
  userId: string,
  isAloned: boolean,
): Promise<TemplateListResponseDto> {
  try {
    const { rows: basicTemplateList } = await client.query(
      `
      SELECT t.id::text, t.title
      FROM template t
      WHERE user_id IS NULL AND is_aloned=$1 AND is_deleted=false
      ORDER BY t.id
      `,
      [isAloned],
    );

    const { rows: myTemplateList } = await client.query(
      `
      SELECT t.id::text, t.title
      FROM template t
      WHERE user_id=$1 AND is_aloned=$2 AND is_deleted=false
      ORDER BY t.id
      `,
      [userId, isAloned],
    );

    const templateList: TemplateListResponseDto = {
      basicTemplate: basicTemplateList,
      myTemplate: myTemplateList,
    };

    return templateList;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { templateListResponse };
