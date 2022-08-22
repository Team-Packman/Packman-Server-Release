export interface FolderCreateDto {
    name: string;
    isAloned: boolean;
  }

export interface FolderInfoDto {
    id: string;
    name: string;
    listNum: string;
}
  
export interface AllFolderResponseDto {
    aloneFolder: FolderInfoDto[];
    togetherFolder: FolderInfoDto[];
  }
  