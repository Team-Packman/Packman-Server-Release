export interface PackCreateDto {
  name: string;
  categoryId: string;
  listId: string;
}

export interface PackResponseDto {
  id: string;
  category: [
    {
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
    },
  ];
}
