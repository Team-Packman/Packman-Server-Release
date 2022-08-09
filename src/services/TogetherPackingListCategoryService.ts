import { CategoryCreateDto } from '../interfaces/ICategory';
import { TogetherPackingListCategoryResponseDto } from '../interfaces/ITogetherPackingListCategory';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const convertSnakeToCamel = require('../modules/convertSnakeToCamel');

const createCategory = async (client: any, categoryCreateDto: CategoryCreateDto) => {
  try {
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
    SELECT c.id, c.name, JSON_AGG(json_build_object(
        'id', p.id,
        'name', p.name, 
        'isChecked', p.is_checked, 
        'packer', (SELECT item FROM (SELECT u.id, u.nickname FROM "user" as u WHERE u.id = p.packer_id) item)
        )) AS pack
    FROM "category" as c 
    JOIN "pack" as p ON c.id = p.category_id
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
