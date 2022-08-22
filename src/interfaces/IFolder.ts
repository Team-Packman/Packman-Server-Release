export interface FolderCreateDto {
    name: string;
    isAloned: boolean;
  }

export interface FolderInfoDto {
    id: string;
    name: string;
    listNum: number;
}
  
export interface AllFolderResponseDto {
    aloneFolder: {
      id: string;
      name: string;
      listNum: number;
    }[];
    togetherFolder: {
      id: string;
      name: string;
      listNum: number;
    }[];
  }
  