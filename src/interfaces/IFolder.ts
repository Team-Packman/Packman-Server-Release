import { ListInfoResponseDto } from './IList';

export interface FolderCreateDto {
  name: string;
  isAloned: boolean;
}
export interface FolderUpdateDto {
  id: string;
  name: string;
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
      listNum: string;
    },
  ];
  togetherFolder: [
    {
      id: string;
      name: string;
      listNum: string;
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
  togetherPackingList: ListInfoResponseDto[];
}

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
  alonePackingList: ListInfoResponseDto[];
}
