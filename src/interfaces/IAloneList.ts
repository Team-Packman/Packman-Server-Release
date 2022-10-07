import { AloneCategoryResponseDto } from './ICategory';
import { ListInfoResponseDto } from './IList';

export interface AloneListCategoryResponseDto {
  id: string;
  category: AloneCategoryResponseDto[];
}

export interface AloneListResponseDto {
  id: string;
  folderId?: string;
  title: string;
  departureDate: string;
  category: AloneCategoryResponseDto[];
  inviteCode: string;
  isSaved: boolean;
}

export interface AloneListLogDto {
  id: string;
  templateId: string;
  title: string;
  departureDate: string;
  category: AloneCategoryResponseDto[];
}

export interface SharedAloneListResponseDto {
  id: string;
  title: string;
  departureDate: string;
  category: AloneCategoryResponseDto[];
}

export interface AloneListInfoResponseDto {
  alonePackingList: ListInfoResponseDto[];
}

export interface InviteAloneListResponseDto {
  id: string;
  isOwner: boolean;
}

export interface AloneListCheckResponseDto {
  title: string;
  departureDate: string;
  isSaved: boolean;
  inviteCode: string;
}
