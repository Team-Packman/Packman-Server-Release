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

export interface TogetherCategoryResponseDto {
  id: string;
  name: string;
  pack: [
    {
      id: string;
      name: string;
      isChecked: boolean;
      packer: {
        id: string;
        nickname: string;
      };
    },
  ];
}

export interface AloneCategoryResponseDto {
  id: string;
  name: string;
  pack: [
    {
      id: string;
      name: string;
      isChecked: boolean;
      packer: null;
    },
  ];
}
