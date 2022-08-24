export interface AloneListInFolderResponseDto {
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
  alonePackingList: [
    {
      id: string;
      title: string;
      departureDate: string;
      packTotalNum: string;
      packRemainNum: string;
    },
  ];
}
