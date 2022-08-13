export interface UserCreateDto {
  email: string;
  name: string;
  profileImageId: string;
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
