import { AloneCategoryResponseDto } from './ICategory';
import { ListInfoResponseDto } from './IList';

export interface AloneListCategoryResponseDto {
  id: string;
  category: AloneCategoryResponseDto[];
}

export interface AloneListResponseDto {
  id: string;
  title: string;
  departureDate: string;
  category: AloneCategoryResponseDto[];
  inviteCode: string;
  isSaved: boolean;
}

export interface AloneListInfoResponseDto {
  alonePackingList: ListInfoResponseDto[];
}
