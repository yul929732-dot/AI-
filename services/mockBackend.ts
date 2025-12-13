
import { User, Video, Role, ScheduleItem, MistakeRecord, LearningStats, VideoProgress } from '../types';
import { MOCK_VIDEOS } from '../constants';

const USERS_KEY = 'hitedu_users';
const SESSION_KEY = 'hitedu_session';
const VIDEOS_KEY = 'hitedu_videos';
const MISTAKES_KEY = 'hitedu_mistakes';
const SCHEDULE_KEY = 'hitedu_schedule';
const PROGRESS_KEY = 'hitedu_video_progress';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to init mock videos if empty
const initVideos = () => {
  if (!localStorage.getItem(VIDEOS_KEY)) {
    // Add uploadDate/uploaderId to mock videos
    const enrichedMocks = MOCK_VIDEOS.map(v => ({
      ...v,
      uploaderId: 'teacher_mock',
      uploadDate: Date.now()
    }));
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(enrichedMocks));
  }
};

// Helper to init users if empty
const initUsers = () => {
  const usersRaw = localStorage.getItem(USERS_KEY);
  if (!usersRaw) {
    const defaultUsers = [
      {
        id: 'student_123456',
        username: '123456',
        password: '123456',
        email: 'student@hitedu.com',
        role: 'student',
        avatar: 'https://ui-avatars.com/api/?name=123456&background=0ea5e9&color=fff'
      },
      {
        id: 'teacher_123456',
        username: '123456',
        password: '123456',
        email: 'teacher@hitedu.com',
        role: 'teacher',
        avatar: 'https://ui-avatars.com/api/?name=Teacher&background=7c3aed&color=fff'
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
};

export const mockBackend = {
  // --- AUTH ---
  async login(username: string, password: string, role: Role): Promise<User> {
    initUsers();
    await delay(800);
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    const user = users.find(u => u.username === username && u.password === password && u.role === role);
    
    if (!user) {
       const exists = users.find(u => u.username === username && u.password === password);
       if (exists && exists.role !== role) {
          throw new Error(`该账号不能以${role === 'teacher' ? '教师' : '学生'}身份登录`);
       }
       throw new Error("用户名或密码错误");
    }

    const sessionUser: User = { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role,
      avatar: user.avatar 
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async register(username: string, password: string, email: string, role: Role): Promise<User> {
    initUsers();
    await delay(1000);
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.find(u => u.username === username && u.role === role)) {
      throw new Error("该角色下的用户名已存在");
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      password,
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=${role === 'teacher' ? '7c3aed' : '0ea5e9'}&color=fff`
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const sessionUser: User = { 
      id: newUser.id, 
      username: newUser.username, 
      email: newUser.email, 
      role: newUser.role,
      avatar: newUser.avatar
    };
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

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<User> {
    await delay(500);
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].avatar = avatarUrl;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      const sessionRaw = localStorage.getItem(SESSION_KEY);
      if (sessionRaw) {
        const sessionUser = JSON.parse(sessionRaw);
        if (sessionUser.id === userId) {
           sessionUser.avatar = avatarUrl;
           localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
           return sessionUser;
        }
      }
      return users[index];
    }
    throw new Error("User not found");
  },

  // --- VIDEO DATA & PROGRESS ---
  async getVideos(): Promise<Video[]> {
    initVideos();
    await delay(500);
    const raw = localStorage.getItem(VIDEOS_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  async addVideo(video: Omit<Video, 'id' | 'uploadDate'>): Promise<Video> {
    await delay(800);
    const videos = await mockBackend.getVideos();
    const newVideo: Video = {
      ...video,
      id: Math.random().toString(36).substr(2, 9),
      uploadDate: Date.now()
    };
    videos.unshift(newVideo);
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
    return newVideo;
  },

  async saveVideoProgress(userId: string, videoId: string, timestamp: number): Promise<void> {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const allProgress: Record<string, VideoProgress> = raw ? JSON.parse(raw) : {};
    const key = `${userId}_${videoId}`;
    
    allProgress[key] = {
      videoId,
      timestamp,
      completed: false, // Could add logic for >90%
      lastUpdated: Date.now()
    };
    
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  },

  async getVideoProgress(userId: string, videoId: string): Promise<number> {
    // await delay(100); // Fast load for UX
    const raw = localStorage.getItem(PROGRESS_KEY);
    const allProgress: Record<string, VideoProgress> = raw ? JSON.parse(raw) : {};
    const key = `${userId}_${videoId}`;
    return allProgress[key]?.timestamp || 0;
  },

  // --- MISTAKES (Student) ---
  async saveMistake(userId: string, mistake: Omit<MistakeRecord, 'id' | 'timestamp'>): Promise<void> {
    const raw = localStorage.getItem(MISTAKES_KEY);
    const allMistakes: Record<string, MistakeRecord[]> = raw ? JSON.parse(raw) : {};
    
    if (!allMistakes[userId]) allMistakes[userId] = [];
    
    allMistakes[userId].unshift({
      ...mistake,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    });
    
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(allMistakes));
  },

  async getMistakes(userId: string): Promise<MistakeRecord[]> {
    await delay(300);
    const raw = localStorage.getItem(MISTAKES_KEY);
    const allMistakes: Record<string, MistakeRecord[]> = raw ? JSON.parse(raw) : {};
    return allMistakes[userId] || [];
  },

  // --- SCHEDULE ---
  async saveSchedule(userId: string, items: ScheduleItem[]): Promise<void> {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    const allSchedules: Record<string, ScheduleItem[]> = raw ? JSON.parse(raw) : {};
    allSchedules[userId] = items;
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(allSchedules));
  },

  async getSchedule(userId: string): Promise<ScheduleItem[]> {
    await delay(300);
    const raw = localStorage.getItem(SCHEDULE_KEY);
    const allSchedules: Record<string, ScheduleItem[]> = raw ? JSON.parse(raw) : {};
    return allSchedules[userId] || [];
  },

  // --- ANALYTICS (Mock) ---
  async getUserStats(userId: string): Promise<LearningStats> {
    await delay(600);
    return {
      totalStudyHours: Math.floor(Math.random() * 50) + 10,
      completedCourses: Math.floor(Math.random() * 8),
      quizAccuracy: Math.floor(Math.random() * 30) + 60,
      weakPoints: ['量子物理', '高阶函数', '现代艺术流派'].sort(() => 0.5 - Math.random()).slice(0, 2),
      learningTrend: Array.from({length: 7}, () => Math.floor(Math.random() * 120))
    };
  }
};
