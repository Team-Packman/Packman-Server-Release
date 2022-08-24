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
  listNum: string;
  togetherPackingList: [
    {
      id: string;
      title: string;
      departureDate: string;
      packTotalNum: string;
      packRemainNum: string;
    },
  ];
}
