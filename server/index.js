
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// 默认的初始数据库结构
const defaultDb = {
  users: [
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
  ],
  videos: [
    {
        id: 'v1',
        title: '计算机科学导论',
        description: '全面概述计算机科学基础、算法和数据结构。适合初学者的入门课程。',
        thumbnail: 'https://picsum.photos/id/1/800/450',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: '10:00',
        durationSec: 600,
        category: '计算机科学',
        uploaderId: 'teacher_mock',
        uploadDate: 1714521600000,
        chapters: [
          { id: 'c1', title: '片头与背景介绍', startTime: 0, duration: 60 },
          { id: 'c2', title: '核心冲突展开', startTime: 60, duration: 300 },
          { id: 'c3', title: '高潮与结局', startTime: 360, duration: 236 }
        ],
        quizzes: [
          {
            id: 'q1',
            timestamp: 10,
            question: '计算机的核心部件是什么？',
            options: ['CPU', '显示器', '键盘', '鼠标'],
            correctAnswer: 0,
            explanation: 'CPU（中央处理器）是计算机的大脑，负责执行指令。'
          }
        ]
      },
      {
        id: 'v2',
        title: '进阶机器学习',
        description: '深入探讨神经网络、反向传播和现代人工智能架构。',
        thumbnail: 'https://picsum.photos/id/20/800/450',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: '15:30',
        durationSec: 930,
        category: '人工智能',
        uploaderId: 'teacher_mock',
        uploadDate: 1714608000000,
        chapters: [],
        quizzes: []
      },
      {
        id: 'v3',
        title: '现代艺术史',
        description: '探索从19世纪末至今的艺术运动演变。',
        thumbnail: 'https://picsum.photos/id/26/800/450',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '08:45',
        durationSec: 525,
        category: '人文艺术',
        uploaderId: 'teacher_mock',
        uploadDate: 1714694400000,
        chapters: [], quizzes: []
      },
      {
        id: 'v4',
        title: '量子物理基础',
        description: '了解量子力学和粒子物理的奇妙世界。',
        thumbnail: 'https://picsum.photos/id/119/800/450',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        duration: '12:20',
        durationSec: 740,
        category: '物理学',
        uploaderId: 'teacher_mock',
        uploadDate: 1714780800000,
        chapters: [], quizzes: []
      }
  ],
  progress: {},
  mistakes: {},
  schedules: {}
};

// 初始化数据库：如果文件不存在，则创建并写入默认数据
let db = defaultDb;
if (fs.existsSync(DB_FILE)) {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    db = JSON.parse(data);
    console.log("Loaded existing database from db.json");
  } catch (e) {
    console.error("Error reading DB file, creating new one.");
    saveDB();
  }
} else {
  console.log("No database found, creating new db.json");
  // 写入文件，确保文件存在
  try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch(e) {
      console.error("Failed to create db.json", e);
  }
}

function saveDB() {
  try {
     fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch(e) {
     console.error("Failed to save database", e);
  }
}

// --- Routes ---

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;
  const user = db.users.find(u => u.username === username && u.password === password && u.role === role);
  
  if (user) {
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } else {
    res.status(401).json({ error: '用户名、密码或角色错误' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, email, role } = req.body;
  if (db.users.find(u => u.username === username && u.role === role)) {
    return res.status(400).json({ error: '用户已存在' });
  }

  const newUser = {
    id: Math.random().toString(36).substr(2, 9),
    username,
    password,
    email,
    role,
    avatar: `https://ui-avatars.com/api/?name=${username}&background=${role === 'teacher' ? '7c3aed' : '0ea5e9'}&color=fff`
  };

  db.users.push(newUser);
  saveDB();

  const { password: _, ...safeUser } = newUser;
  res.json(safeUser);
});

// Users
app.post('/api/users/:id/avatar', (req, res) => {
  const { avatar } = req.body;
  const userIdx = db.users.findIndex(u => u.id === req.params.id);
  if (userIdx > -1) {
    db.users[userIdx].avatar = avatar;
    saveDB();
    const { password: _, ...safeUser } = db.users[userIdx];
    res.json(safeUser);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.get('/api/users/:id/stats', (req, res) => {
    // Mock analytics calculation
    const stats = {
        totalStudyHours: Math.floor(Math.random() * 50) + 10,
        completedCourses: Math.floor(Math.random() * 8),
        quizAccuracy: Math.floor(Math.random() * 30) + 60,
        weakPoints: ['量子物理', '高阶函数', '现代艺术流派'].sort(() => 0.5 - Math.random()).slice(0, 2),
        learningTrend: Array.from({length: 7}, () => Math.floor(Math.random() * 120))
    };
    res.json(stats);
});

// Videos
app.get('/api/videos', (req, res) => {
  res.json(db.videos);
});

app.post('/api/videos', (req, res) => {
  const newVideo = {
    ...req.body,
    id: Math.random().toString(36).substr(2, 9),
    uploadDate: Date.now()
  };
  db.videos.unshift(newVideo);
  saveDB();
  res.json(newVideo);
});

// Progress
app.get('/api/users/:uid/progress/:vid', (req, res) => {
  const key = `${req.params.uid}_${req.params.vid}`;
  const progress = db.progress[key];
  res.json({ timestamp: progress ? progress.timestamp : 0 });
});

app.post('/api/users/:uid/progress', (req, res) => {
  const { videoId, timestamp } = req.body;
  const key = `${req.params.uid}_${videoId}`;
  db.progress[key] = {
    videoId,
    timestamp,
    completed: false,
    lastUpdated: Date.now()
  };
  saveDB();
  res.json({ success: true });
});

// Mistakes
app.get('/api/users/:id/mistakes', (req, res) => {
  res.json(db.mistakes[req.params.id] || []);
});

app.post('/api/users/:id/mistakes', (req, res) => {
  const userId = req.params.id;
  if (!db.mistakes[userId]) db.mistakes[userId] = [];
  
  const newMistake = {
    ...req.body,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now()
  };
  
  db.mistakes[userId].unshift(newMistake);
  saveDB();
  res.json(newMistake);
});

// Schedule
app.get('/api/users/:id/schedule', (req, res) => {
  res.json(db.schedules[req.params.id] || []);
});

app.post('/api/users/:id/schedule', (req, res) => {
  const userId = req.params.id;
  db.schedules[userId] = req.body;
  saveDB();
  res.json({ success: true });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
