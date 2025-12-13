
import { User, Video, Role, ScheduleItem, MistakeRecord, LearningStats, QuizResult, SavedReport } from '../types';
import { mockBackend } from './mockBackend';

const API_BASE = 'http://localhost:3001/api';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
};

/**
 * Helper to try API first, fallback to mock if network fails.
 * Note: Does not fallback on 4xx/5xx HTTP errors (business logic errors), only on network exceptions.
 */
async function withFallback<T>(
  apiCall: () => Promise<Response>, 
  mockCall: () => Promise<T>
): Promise<T> {
  try {
    const res = await apiCall();
    return handleResponse(res);
  } catch (e: any) {
    // Check for network errors (TypeError in fetch, or specific flags)
    // If the error message indicates a connection failure, use mock.
    if (e.name === 'TypeError' || e.message === 'Failed to fetch' || e.message.includes('NetworkError')) {
      console.warn("⚠️ Backend connection failed. Falling back to Mock Backend.");
      return mockCall();
    }
    // If it's a business logic error (e.g. 'User already exists' from handleResponse), rethrow it.
    throw e;
  }
}

export const api = {
  // --- AUTH ---
  async login(username: string, password: string, role: Role): Promise<User> {
    const user = await withFallback(
      () => fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      }),
      () => mockBackend.login(username, password, role)
    );
    
    localStorage.setItem('hitedu_session', JSON.stringify(user));
    return user;
  },

  async register(username: string, password: string, email: string, role: Role): Promise<User> {
    const user = await withFallback(
      () => fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, role })
      }),
      () => mockBackend.register(username, password, email, role)
    );
    
    localStorage.setItem('hitedu_session', JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    // Logout is local mostly, but if we had a server session, we'd call it here.
    // For now, just clear local storage.
    localStorage.removeItem('hitedu_session');
    // We could try notifying server, but it's not critical for this hybrid approach.
  },

  async getSession(): Promise<User | null> {
    const sessionRaw = localStorage.getItem('hitedu_session');
    return sessionRaw ? JSON.parse(sessionRaw) : null;
  },

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<User> {
    const user = await withFallback(
      () => fetch(`${API_BASE}/users/${userId}/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarUrl })
      }),
      () => mockBackend.updateUserAvatar(userId, avatarUrl)
    );

    localStorage.setItem('hitedu_session', JSON.stringify(user));
    return user;
  },

  // --- VIDEOS ---
  async getVideos(): Promise<Video[]> {
    return withFallback(
      () => fetch(`${API_BASE}/videos`),
      () => mockBackend.getVideos()
    );
  },

  async addVideo(video: Omit<Video, 'id' | 'uploadDate'>): Promise<Video> {
    return withFallback(
      () => fetch(`${API_BASE}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(video)
      }),
      () => mockBackend.addVideo(video)
    );
  },

  // --- PROGRESS ---
  async saveVideoProgress(userId: string, videoId: string, timestamp: number): Promise<void> {
    return withFallback(
      () => fetch(`${API_BASE}/users/${userId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, timestamp })
      }),
      () => mockBackend.saveVideoProgress(userId, videoId, timestamp)
    );
  },

  async getVideoProgress(userId: string, videoId: string): Promise<number> {
    try {
        const res = await fetch(`${API_BASE}/users/${userId}/progress/${videoId}`);
        const data = await handleResponse(res);
        return data.timestamp;
    } catch (e: any) {
        if (e.name === 'TypeError' || e.message === 'Failed to fetch') {
             return mockBackend.getVideoProgress(userId, videoId);
        }
        throw e;
    }
  },

  // --- MISTAKES ---
  async saveMistake(userId: string, mistake: Omit<MistakeRecord, 'id' | 'timestamp'>): Promise<void> {
    return withFallback(
      () => fetch(`${API_BASE}/users/${userId}/mistakes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mistake)
      }),
      () => mockBackend.saveMistake(userId, mistake)
    );
  },

  async getMistakes(userId: string): Promise<MistakeRecord[]> {
    return withFallback(
      () => fetch(`${API_BASE}/users/${userId}/mistakes`),
      () => mockBackend.getMistakes(userId)
    );
  },

  // --- QUIZ RESULTS (NEW) ---
  async saveQuizResult(userId: string, result: Omit<QuizResult, 'id' | 'timestamp'>): Promise<void> {
      return withFallback(
          () => fetch(`${API_BASE}/users/${userId}/quiz-results`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(result)
          }),
          () => mockBackend.saveQuizResult(userId, result)
      );
  },

  // --- REPORTS (NEW) ---
  async saveReport(userId: string, report: Omit<SavedReport, 'id' | 'timestamp'>): Promise<void> {
      return withFallback(
          () => fetch(`${API_BASE}/users/${userId}/reports`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(report)
          }),
          () => mockBackend.saveReport(userId, report)
      );
  },
  
  async getReports(userId: string): Promise<SavedReport[]> {
      return withFallback(
          () => fetch(`${API_BASE}/users/${userId}/reports`),
          () => mockBackend.getReports(userId)
      );
  },

  // --- SCHEDULE ---
  async saveSchedule(userId: string, items: ScheduleItem[]): Promise<void> {
    return withFallback(
      () => fetch(`${API_BASE}/users/${userId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      }),
      () => mockBackend.saveSchedule(userId, items)
    );
  },

  async getSchedule(userId: string): Promise<ScheduleItem[]> {
    return withFallback(
      () => fetch(`${API_BASE}/users/${userId}/schedule`),
      () => mockBackend.getSchedule(userId)
    );
  },

  // --- STATS ---
  async getUserStats(userId: string): Promise<LearningStats> {
    return withFallback(
      () => fetch(`${API_BASE}/users/${userId}/stats`),
      () => mockBackend.getUserStats(userId)
    );
  }
};
