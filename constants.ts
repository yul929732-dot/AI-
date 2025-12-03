import { Video } from './types';

// Mock Videos
export const MOCK_VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Introduction to Computer Science',
    description: 'A comprehensive overview of computer science fundamentals, algorithms, and data structures.',
    thumbnail: 'https://picsum.photos/id/1/800/450',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '10:00',
    category: 'Computer Science',
  },
  {
    id: 'v2',
    title: 'Advanced Machine Learning',
    description: 'Deep dive into neural networks, backpropagation, and modern AI architectures.',
    thumbnail: 'https://picsum.photos/id/20/800/450',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '15:30',
    category: 'Artificial Intelligence',
  },
  {
    id: 'v3',
    title: 'History of Modern Art',
    description: 'Exploring the evolution of art movements from the late 19th century to the present day.',
    thumbnail: 'https://picsum.photos/id/26/800/450',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '08:45',
    category: 'Arts & Humanities',
  },
  {
    id: 'v4',
    title: 'Quantum Physics Basics',
    description: 'Understanding the strange world of quantum mechanics and particle physics.',
    thumbnail: 'https://picsum.photos/id/119/800/450',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    duration: '12:20',
    category: 'Physics',
  },
];

// Placeholder URLs for COZE Agents
export const COZE_URLS = {
  ASSISTANT: 'https://www.coze.com/store/bot', // Replace with actual Coze URL
  QUIZ: 'https://www.coze.com/store/bot',      // Replace with actual Coze URL
  REPORT: 'https://www.coze.com/store/bot',    // Replace with actual Coze URL
  TEXT_TO_PPT: 'https://www.coze.com/store/bot' // Replace with actual Coze URL
};
