export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  gender: string;
  password: string;
  confirmPassword: string;
  bio?: string;
  username?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
} 