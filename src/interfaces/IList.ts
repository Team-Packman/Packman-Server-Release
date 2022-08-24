export interface RecentCreatedListResponseDto {
  id: string;
  title: string;
  remainDay: string;
  packTotalNum: string;
  packRemainNum: string;
  url: string;
}

export interface ListInviteResponseDto {
  id: string;
  title: string;
}

export interface ListCreateDto {
  departureDate: string;
  folderId: string;
  title: string;
  templateId: string;
}

export interface TitleUpdateDto {
  id: string;
  title: string;
  isAloned?: boolean;
}

export interface DateUpdateDto {
  id: string;
  departureDate: string;
  isAloned?: boolean;
}

export interface MyTemplateUpdateDto {
  id: string;
  isSaved: boolean;
  isAloned?: boolean;
}
