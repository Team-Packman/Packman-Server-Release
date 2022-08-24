import { AloneListCategoryResponseDto } from './IAloneList';
import { TogetherCategoryResponseDto } from './ICategory';

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
export interface PackerUpdateDto {
  listId: string;
  packId: string;
  packerId: string;
}

export interface TogetherListCategoryResponseDto {
  id: string;
  category: TogetherCategoryResponseDto[];
}
