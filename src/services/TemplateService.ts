import { TemplateListResponseDto, DetailedTemplateResponseDto } from '../interfaces/ITemplate';
import { templateListResponse } from '../modules/templateListResponse';

const getAloneTemplateList = async (
  client: any,
  userId: number,
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

const getTogetherTemplateList = async (
  client: any,
  userId: number,
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

const getTemplate = async (
  client: any,
  templateId: string,
): Promise<DetailedTemplateResponseDto | string> => {
  try {
    const { rows: template } = await client.query(
      `
        SELECT t.title
        FROM "template" t
        WHERE t.id = $1 AND t.is_deleted = false
      `,
      [templateId],
    );
    if (template.length === 0) {
      return 'no_template';
    }
    const templateTitle = template[0].title;

    const { rows: category } = await client.query(
      `
        SELECT c.id::text, c.name,	COALESCE(json_agg(json_build_object(
            'id', p.id::text,
            'name', p.name
        ) ORDER BY p.id
        ) FILTER(WHERE p.id IS NOT NULL),'[]') AS "pack"
        FROM "template_category" c
        LEFT JOIN "template_pack" p ON c.id = p.category_id
        WHERE c.template_id=$1
        GROUP BY c.id
        ORDER BY c.id
      `,
      [templateId],
    );

    const templateResponse: DetailedTemplateResponseDto = {
      id: templateId,
      title: templateTitle,
      category: category,
    };
    return templateResponse;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  getAloneTemplateList,
  getTogetherTemplateList,
  getTemplate,
};
