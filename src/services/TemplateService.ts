import { TemplateListResponseDto, DetailedTemplateResponseDto } from '../interfaces/ITemplate';
import { templateListResponse } from '../modules/templateListResponse';
import logger from '../config/logger';

const getAloneTemplateList = async (
  client: any,
  userId: number,
): Promise<TemplateListResponseDto | string> => {
  const aloneTemplateList = await templateListResponse(client, userId, true);

  logger.logger.info(`GET, /template/alone, 혼자 패킹 템플릿 리스트 조회, 200, userId: ${userId}`);

  return aloneTemplateList;
};

const getTogetherTemplateList = async (
  client: any,
  userId: number,
): Promise<TemplateListResponseDto | string> => {
  const togetherTemplateList = await templateListResponse(client, userId, false);
  logger.logger.info(
    `GET, /template/together, 함께 패킹 템플릿 리스트 조회, 200, userId: ${userId}`,
  );
  return togetherTemplateList;
};

const getTemplate = async (
  client: any,
  userId: number,
  templateId: string,
): Promise<DetailedTemplateResponseDto | string> => {
  const { rows: template } = await client.query(
    `
      SELECT t.title
      FROM "template" t
      WHERE t.id = $1 AND t.is_deleted = false AND (
        CASE WHEN t.user_id IS NOT NULL THEN t.user_id=$2
        ELSE true
        END)
    `,
    [templateId, userId],
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
};

export default {
  getAloneTemplateList,
  getTogetherTemplateList,
  getTemplate,
};
