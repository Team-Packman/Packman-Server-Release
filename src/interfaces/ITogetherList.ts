import { AloneListCategoryResponseDto } from './IAloneList';
import { TogetherCategoryResponseDto } from './ICategory';
import { ListInfoResponseDto } from './IList';

export interface TogetherListResponseDto {
  id: string;
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
  isSaved: boolean;
  myListId: number;
  togetherListId: number;
}
