export interface PackDeleteDto {
  listId: string;
  categoryId: string;
  packId: string;
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
