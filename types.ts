export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  duration: string;
  category: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export enum ViewState {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  VIDEO_PLAYER = 'VIDEO_PLAYER',
}

export interface Note {
  id: string;
  text: string;
  timestamp: number;
}
