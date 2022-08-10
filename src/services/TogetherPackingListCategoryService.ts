import { CategoryCreateDto } from '../interfaces/ICategory';
import { TogetherPackingListCategoryResponseDto } from '../interfaces/ITogetherPackingListCategory';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const convertSnakeToCamel = require('../modules/convertSnakeToCamel');

const createCategory = async (
  client: any,
  categoryCreateDto: CategoryCreateDto,
): Promise<TogetherPackingListCategoryResponseDto | string> => {
  try {
    if (categoryCreateDto.name.length > 12) {
      return 'exceedLen';
    }
    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "packing_list" as t
        WHERE t.id = $1
        `,
      [categoryCreateDto.listId],
    );
    if (existList.length === 0) {
      return 'noList';
    }

    const { rows: existCategory } = await client.query(
      `
          SELECT * 
          FROM "category" as c 
          WHERE c.list_id = $1 AND c.name = $2
          `,
      [categoryCreateDto.listId, categoryCreateDto.name],
    );
    if (existCategory.length > 0) {
      return 'duplicateCategory';
    }

    const { rows } = await client.query(
      `
        INSERT INTO "category" (list_id, name)
        VALUES ($1, $2)
        `,
      [categoryCreateDto.listId, categoryCreateDto.name],
    );

    const categoryResponseDto: TogetherPackingListCategoryResponseDto = {
      id: categoryCreateDto.listId,
    };

    const { rows: categorys } = await client.query(
      `
    SELECT c.id, c.name,  COALESCE(JSON_AGG(json_build_object(
        'id', p.id,
        'name', p.name, 
        'isChecked', p.is_checked, 
        'packer', (SELECT item FROM (SELECT u.id, u.nickname FROM "user" as u WHERE u.id = p.packer_id) item)
        ))FILTER (WHERE p.id IS NOT NULL), '[]') AS pack
    FROM "category" as c 
    LEFT JOIN "pack" as p ON c.id = p.category_id
    WHERE c.list_id = $1
    GROUP BY c.id
    `,
      [categoryCreateDto.listId],
    );
    categoryResponseDto.category = categorys;

    return categoryResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  createCategory,
};
