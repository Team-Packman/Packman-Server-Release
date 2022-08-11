export interface TogetherPackingListCategoryResponseDto {
    id: string;
    category: [
      {
        id: string;
        name: string;
        pack?: [
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