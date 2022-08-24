import { AloneCategoryResponseDto } from './ICategory';

export interface AloneListCategoryResponseDto {
  id: string;
  category: AloneCategoryResponseDto[];
}

export interface AloneListResponseDto {
  id: string;
  title: string;
  departureDate: string;
  category: AloneCategoryResponseDto[];
  isSaved: boolean;
}
