
import { Video } from './types';

// Mock Videos with enhanced structure
export const MOCK_VIDEOS: Video[] = [
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
      { id: 'c2', title: '核心冲突展开', startTime: 60, duration: 300 }, // 1:00 - 6:00
      { id: 'c3', title: '高潮与结局', startTime: 360, duration: 236 } // 6:00 - 9:56
    ],
    quizzes: [
      {
        id: 'q1',
        timestamp: 10, // Show at 10s for demo
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
    chapters: [
      { id: 'c1', title: '神经网络基础', startTime: 0, duration: 300 },
      { id: 'c2', title: '反向传播算法', startTime: 300, duration: 400 },
      { id: 'c3', title: 'Transformer 架构', startTime: 700, duration: 230 }
    ],
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
  },
];

// Placeholder URLs for COZE Agents
export const COZE_URLS = {
  ASSISTANT: 'https://www.coze.com/store/bot', 
  QUIZ: 'https://www.coze.com/store/bot',      
  REPORT: 'https://www.coze.com/store/bot',    
  TEXT_TO_PPT: 'https://www.coze.com/store/bot' 
};
