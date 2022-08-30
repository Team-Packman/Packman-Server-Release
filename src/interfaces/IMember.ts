export interface MemberResponseDto {
  title: string;
  departureDate: string;
  remainDay: string;
  member: [
    {
      id: string;
      nickname: string;
      profileImage: string;
    },
  ];
}

export interface MemberDeleteResponseDto {
  member: [
    {
      id: string;
      nickname: string;
      profileImage: string;
    },
  ];
}
