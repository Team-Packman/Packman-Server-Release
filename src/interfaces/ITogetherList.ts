import { AloneListCategoryResponseDto } from './IAloneList';
import { TogetherCategoryResponseDto } from './ICategory';
import { ListInfoResponseDto } from './IList';

export interface TogetherListResponseDto {
  id: string;
  folderId?: string;
  title: string;
  departureDate: string;
  togetherPackingList: {
    id: string;
    groupId: string;
    category: TogetherCategoryResponseDto[];
    inviteCode: string;
    isSaved: boolean;
  };
  myPackingList: AloneListCategoryResponseDto;
  group?: {
    id: string;
    member: [
      {
        id: string;
        nickname: string;
        profileImage: string;
      },
    ];
  };
  isMember?: boolean;
}
export interface TogetherListLogDto {
  id: string;
  templateId: string;
  title: string;
  departureDate: string;
  groupId: string;
  category: TogetherCategoryResponseDto[];
}
export interface SharedTogetherListResponseDto {
  id: string;
  title: string;
  departureDate: string;
  category: TogetherCategoryResponseDto[];
}

export interface PackerUpdateDto {
  listId: string;
  packId: string;
  packerId: string;
}

export interface TogetherListCategoryResponseDto {
  id: string;
  category: TogetherCategoryResponseDto[];
}

export interface TogetherAloneResponseDto {
  listId: string;
}
export interface TogetherListInfoResponseDto {
  togetherPackingList: ListInfoResponseDto[];
}

export interface UseForMapInDeleteDto {
  id: number;
  groupId?: number;
}

export interface UseForReduceInDeleteDto {
  myListId: number;
  togetherListId: number;
}

export interface InviteTogetherListResponseDto {
  title: string;
}

export interface TogetherListCheckResponseDto {
  title: string;
  departureDate: string;
  isSaved: boolean;
  myListId: string;
  togetherListId: string;
  folderId: string;
}
