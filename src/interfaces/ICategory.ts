
export interface CategoryCreateDto {
  name: string;
  listId: string;
}

export interface CategoryUpdateDto {
  id: string;
  name: string;
  listId: string;
}

export interface CategoryDeleteDto {
  listId: string;
  categoryId: string;
}
