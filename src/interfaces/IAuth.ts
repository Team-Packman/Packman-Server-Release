export interface AuthResponseDto {
  isAlreadyUser: boolean;
  id?: string;
  name: string;
  nickname?: string;
  email: string;
  profileImage?: string;
  accessToken?: string;
  refreshToken?: string;
  path?: string;
}
export interface AuthTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}
