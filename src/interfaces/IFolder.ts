export interface TogetherListInFolderResponseDto {
  currentFolder: {
    id: string;
    name: string;
  };
  folder: [
    {
      id: string;
      name: string;
    },
  ];
  listNum: number;
  togetherPackingList: [
    {
      id: string;
      title: string;
      departureDate: string;
      packTotalNum: number;
      packRemainNum: number;
    },
  ];
}
