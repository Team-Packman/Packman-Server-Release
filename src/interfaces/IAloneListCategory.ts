export interface AloneListCategoryResponseDto {
  id?: string;
  category: [
    {
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
    },
  ];
}
