export interface ICategory {
  name: string;
  listId: number;
}

export interface CategoryCreateDto {
  name: string;
  listId: number;
}

export interface CategoryUpdateDto {
  id: number;
  name: string;
  listId: number;
}

export interface CategoryDeleteDto {
  listId: number;
  categoryId: number;
}
