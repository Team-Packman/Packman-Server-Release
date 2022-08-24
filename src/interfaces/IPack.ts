export interface PackCreateDto {
  name: string;
  categoryId: string;
  listId: string;
}

export interface PackUpdateDto {
  id: string;
  name: string;
  isChecked: boolean;
  listId: string;
  categoryId: string;
}

export interface PackDeleteDto {
  listId: string;
  categoryId: string;
  packId: string;
}
