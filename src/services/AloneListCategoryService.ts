import { AloneListCategoryResponseDto } from "../interfaces/IAloneList";
import { CategoryDeleteDto } from "../interfaces/ICategory";
import { aloneCategoryResponse } from "../modules/aloneCategoryResponse";

const deleteCategory = async (
    client: any,
    categoryDeleteDto: CategoryDeleteDto,
  ): Promise<AloneListCategoryResponseDto | string> => {
    try {
      const { rows: existList } = await client.query(
        `
          SELECT *
          FROM "packing_list" as pl
          WHERE pl.id = $1 AND pl.is_deleted = false
          `,
        [categoryDeleteDto.listId],
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
        [categoryDeleteDto.categoryId],
      );
  
      if (existCategory.length === 0) {
        return 'no_category';
      }
      if (existCategory[0].list_id != categoryDeleteDto.listId) {
        return 'no_list_category';
      }
  
      const { rows } = await client.query(
        `
        DELETE FROM "category" as c
        WHERE c.id = $1  AND c.list_id = $2
        `,
        [categoryDeleteDto.categoryId, categoryDeleteDto.listId],
      );
  
      const category = await aloneCategoryResponse(client, categoryDeleteDto.listId);
  
      const aloneListCategoryResponseDto: AloneListCategoryResponseDto = {
        id: categoryDeleteDto.listId,
        category: category,
      };
  
      return aloneListCategoryResponseDto;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  
  export default {
    deleteCategory,
  };
  