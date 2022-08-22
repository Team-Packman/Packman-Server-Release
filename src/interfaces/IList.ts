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
