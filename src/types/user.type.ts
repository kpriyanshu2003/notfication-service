export interface CreateUserDto {
  email?: string;
  phone?: string;
  fcmToken?: string;
}

export interface UserIdentifier {
  email?: string;
  phone?: string;
}
