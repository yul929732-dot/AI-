import { User, Video } from '../types';
import { MOCK_VIDEOS } from '../constants';

const USERS_KEY = 'edustream_users';
const SESSION_KEY = 'edustream_session';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockBackend = {
  // --- AUTH ---
  async login(username: string, password: string): Promise<User> {
    await delay(800);
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    // Simple check (in production, use hashed passwords)
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error("Invalid username or password");
    }

    const sessionUser: User = { id: user.id, username: user.username, email: user.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async register(username: string, password: string, email: string): Promise<User> {
    await delay(1000);
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.find(u => u.username === username)) {
      throw new Error("Username already exists");
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      password, // In a real app, never store plain text passwords
      email
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const sessionUser: User = { id: newUser.id, username: newUser.username, email: newUser.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem(SESSION_KEY);
  },

  async getSession(): Promise<User | null> {
    await delay(200);
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    return sessionRaw ? JSON.parse(sessionRaw) : null;
  },

  // --- DATA ---
  async getVideos(): Promise<Video[]> {
    await delay(500); // Simulate API latency
    return MOCK_VIDEOS;
  },
  
  async getVideoById(id: string): Promise<Video | undefined> {
    await delay(300);
    return MOCK_VIDEOS.find(v => v.id === id);
  }
};
