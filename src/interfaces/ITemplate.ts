export interface DetailedTemplateResponseDto {
    id: string;
    title: string;
    category: [
      {
        id: string;
        name: string;
        pack: [
          {
            id: string;
            name: string;
          },
        ];
      },
    ];
  }