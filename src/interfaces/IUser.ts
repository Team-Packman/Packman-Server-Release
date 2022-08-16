export interface UserCreateDto {
  email: string;
  name: string;
  nickname: string;
  profileImage: string;
}
export interface AuthResponseDto {
  isAlreadyUser: boolean;
  id?: string;
  name: string;
  nickname?: string;
  email: string;
  profileImage?: string;
  accessToken?: string;
}
export interface UserResponseDto {
  id: string;
  nickname: string;
  email: string;
  profileImage: string;
  accessToken?: string;
}
