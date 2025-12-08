import { Video } from './types';

// Mock Videos
export const MOCK_VIDEOS: Video[] = [
  {
    id: 'v1',
    title: '计算机科学导论',
    description: '全面概述计算机科学基础、算法和数据结构。适合初学者的入门课程。',
    thumbnail: 'https://picsum.photos/id/1/800/450',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '10:00',
    category: '计算机科学',
    uploaderId: 'teacher_mock',
    uploadDate: 1714521600000,
  },
  {
    id: 'v2',
    title: '进阶机器学习',
    description: '深入探讨神经网络、反向传播和现代人工智能架构。',
    thumbnail: 'https://picsum.photos/id/20/800/450',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '15:30',
    category: '人工智能',
    uploaderId: 'teacher_mock',
    uploadDate: 1714608000000,
  },
  {
    id: 'v3',
    title: '现代艺术史',
    description: '探索从19世纪末至今的艺术运动演变。',
    thumbnail: 'https://picsum.photos/id/26/800/450',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '08:45',
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
    category: '物理学',
    uploaderId: 'teacher_mock',
    uploadDate: 1714780800000,
  },
];

// Placeholder URLs for COZE Agents
export const COZE_URLS = {
  ASSISTANT: 'https://www.coze.com/store/bot', // Replace with actual Coze URL
  QUIZ: 'https://www.coze.com/store/bot',      // Replace with actual Coze URL
  REPORT: 'https://www.coze.com/store/bot',    // Replace with actual Coze URL
  TEXT_TO_PPT: 'https://www.coze.com/store/bot' // Replace with actual Coze URL
};