export interface UserCreateDto {
  email: string;
  name: string;
  nickname: string;
  profileImage: string;
  refreshToken: string;
}
export interface UserResponseDto {
  id: string;
  nickname: string;
  email: string;
  profileImage: string;
  accessToken?: string;
  refreshToken?: string;
}
