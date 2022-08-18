import { CategoryCreateDto, CategoryUpdateDto } from '../interfaces/ICategory';
import { TogetherPackingListCategoryResponseDto } from '../interfaces/ITogetherPackingListCategory';


const createCategory = async (
  client: any,
  categoryCreateDto: CategoryCreateDto,
): Promise<TogetherPackingListCategoryResponseDto | string> => {
  try {
    if (categoryCreateDto.name.length > 12) {
      return 'exceed_len';
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
      return 'no_list';
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
      return 'duplicate_category';
    }

    const { rows } = await client.query(
      `
        INSERT INTO "category" (list_id, name)
        VALUES ($1, $2)
        `,
      [categoryCreateDto.listId, categoryCreateDto.name],
    );

  

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

    const categoryResponseDto: TogetherPackingListCategoryResponseDto = {
      id: categoryCreateDto.listId,
      category: categorys
    };

    return categoryResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateCategory = async(
  client: any,
  categoryUpdateDto: CategoryUpdateDto,
): Promise<TogetherPackingListCategoryResponseDto | string> => {
  try {
    if (categoryUpdateDto.name.length > 12) {
      return 'exceed_len';
    }
    const { rows: existList } = await client.query(
      `
        SELECT *
        FROM "packing_list" as t
        WHERE t.id = $1
        `,
      [categoryUpdateDto.listId],
    );
    if (existList.length === 0) {
      return 'no_list';
    }
    const { rows: existCategory } = await client.query(
      `
        SELECT *
        FROM "category" as c
        WHERE c.id = $1
        `,
      [categoryUpdateDto.id],
    );

    if (existCategory.length === 0) {
      return 'no_category';
    }
    if (existCategory[0].list_id !== categoryUpdateDto.listId) {
      return 'no_list_category'
    }

    const { rows: duplicatedCategory } = await client.query(
      `
          SELECT * 
          FROM "category" as c 
          WHERE c.list_id = $1 AND c.name = $2
          `,
      [categoryUpdateDto.listId, categoryUpdateDto.name],
    );

    if (duplicatedCategory.length > 1) {
      return 'duplicated_category';
    } else if (duplicatedCategory.length === 1) {
      if (duplicatedCategory[0].id !== categoryUpdateDto.id) {
        return 'duplicated_category'
      }
    }

    const { rows } = await client.query(
      `
      UPDATE "category" as c
      SET name = $2
      WHERE c.id = $1
      `,
      [categoryUpdateDto.id, categoryUpdateDto.name],
    );


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
      [categoryUpdateDto.listId],
    );

    const categoryResponseDto: TogetherPackingListCategoryResponseDto = {
      id: categoryUpdateDto.listId,
      category: categorys
    };

    return categoryResponseDto;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  createCategory,
  updateCategory
};
