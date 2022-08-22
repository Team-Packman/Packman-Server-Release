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
  listNum: number;
  alonePackingList: [
    {
      id: string;
      title: string;
      departureDate: string;
      packTotalNum: number;
      packRemainNum: number;
    },
  ];
}
