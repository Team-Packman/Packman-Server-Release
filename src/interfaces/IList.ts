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

export interface ListDateUpdateDto {
  id: string;
  departureDate: string;
  isAloned?: boolean;
}
