export interface TogetherPackingListCategoryResponseDto {
    id: number;
    category: [
      {
        id: number;
        name: string;
        pack: [
          {
            id: number;
            name: string;
            isChecked: boolean;
            packer: {
              id: number;
              nickname: string;
            };
          },
        ];
      },
    ];
  }