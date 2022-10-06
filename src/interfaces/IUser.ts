export interface UserCreateDto {
  email: string;
  name: string;
  gender: string;
  ageRange: string;
  nickname: string;
  profileImage: string;
  refreshToken: string;
  path: string;
}
export interface UserResponseDto {
  id: string;
  nickname: string;
  email: string;
  profileImage: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface UserUpdateDto {
  nickname: string;
  profileImage: string;
}

export interface UserLogDto {
  email: string;
  name: string;
  gender: string;
  ageRange: string;
  nickname: string;
  profileImage: string;
  path: string;
}
