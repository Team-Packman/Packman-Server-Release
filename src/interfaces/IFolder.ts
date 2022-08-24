export interface FolderCreateDto {
  name: string;
  isAloned: boolean;
}

export interface FolderInfoDto {
  id: string;
  name: string;
  listNum: string;
  isAloned: boolean;
}

export interface AllFolderResponseDto {
  aloneFolder: [
    {
      id: string;
      name: string;
      listNum: number;
    },
  ];
  togetherFolder: [
    {
      id: string;
      name: string;
      listNum: number;
    },
  ];
}

export interface FolderResponseDto {
  id: string;
  name: string;
}

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
