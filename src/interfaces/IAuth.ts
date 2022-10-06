export interface AuthResponseDto {
  isAlreadyUser: boolean;
  id?: string;
  email: string;
  name: string;
  gender?: string;
  ageRange?: string;
  nickname?: string;
  profileImage?: string;
  accessToken?: string;
  refreshToken?: string;
  path?: string;
}
export interface AuthTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}
