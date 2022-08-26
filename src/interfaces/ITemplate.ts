export interface TemplateListResponseDto {
  basicTemplate: [
    {
      id: string;
      title: string;
    },
  ];
  myTemplate: [
    {
      id: string;
      title: string;
    },
  ];
}

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