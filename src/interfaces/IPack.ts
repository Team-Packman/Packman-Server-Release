export interface PackUpdateDto {
  id: string;
  name: string;
  isChecked: boolean;
  listId: string;
  categoryId: string;
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
