import { DetailedTemplateResponseDto } from "../interfaces/ITemplate";

const getTemplate = async (
    client: any,
    templateId: string,
    type: string,
  ): Promise<DetailedTemplateResponseDto | string> => {
    try {
        let templateTitle;
        if (type === 'basic') {
            const { rows: template } = await client.query(
                `
                    SELECT t.title
                    FROM "template" t
                    WHERE t.id = $1 AND t.is_deleted = false
                `,
                [templateId]
            );
            if(template.length === 0) {
                return 'no_template';
            }
            templateTitle = template[0].title;
        } else if (type === 'alone') {
            const { rows: template } = await client.query(
                `
                    SELECT t.title
                    FROM "template" t
                    JOIN "packing_list" pl ON t.packing_list_id = pl.id
                    JOIN "alone_packing_list" al ON pl.id  = al.id
                    WHERE t.id = $1 AND pl.is_deleted = false AND al.is_aloned = true
                `,
                [templateId]
            );
            if(template.length === 0) {
                return 'no_template';
            }
            templateTitle = template[0].title;
        } else if (type === 'together') {
            const { rows: template } = await client.query(
                `
                    SELECT t.title
                    FROM "template" t
                    JOIN "packing_list" pl ON t.packing_list_id = pl.id
                    JOIN "together_packing_list" tl ON pl.id  = tl.id
                    WHERE t.id = $1 AND pl.is_deleted = false
                `,
                [templateId]
            );
            if(template.length === 0) {
                return 'no_template';
            }
            templateTitle = template[0].title;
        } else {
            return 'no_type';
        }


        const { rows: category } = await client.query(
            `
                SELECT c.id::text, c.name,	COALESCE(json_agg(json_build_object(
                    'id', p.id::text,
                    'name', p.name
                ) ORDER BY p.id
                ) FILTER(WHERE p.id IS NOT NULL),'[]') AS "pack"
                FROM "template_category" c
                LEFT JOIN "template_pack" p ON c.id = p.category_id
                WHERE c.template_id = $1
                GROUP BY c.id
                ORDER BY c.id
            `,
            [templateId],
        );
            
        const templateResponse: DetailedTemplateResponseDto = {
            id: templateId,
            title: templateTitle,
            category: category
        }
        return templateResponse;

    }  catch (error) {
      console.log(error);
      throw error;
    }
  };
  
  export default {
    getTemplate,
  };