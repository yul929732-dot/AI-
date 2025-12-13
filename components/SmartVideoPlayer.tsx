
import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoQuiz } from '../types';
import { Button } from './Button';
import { VoiceNote } from './VoiceNote';
import { api } from '../services/api';
import { geminiService } from '../services/geminiService';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, 
  Settings, MessageSquare, List, Sparkles, FileText, 
  ArrowRight, ArrowLeft, XCircle, CheckCircle2, ChevronRight, Languages,
  MoreVertical
} from 'lucide-react';

interface SmartVideoPlayerProps {
  video: Video;
  userId: string;
  onBack: () => void;
}

// Mock Subtitles Data for Simulation
const MOCK_SUBTITLES = {
  zh: [
    { start: 0, end: 5, text: "大家好，欢迎来到这门课程。" },
    { start: 5, end: 10, text: "今天我们将深入探讨这个主题的核心概念。" },
    { start: 10, end: 15, text: "请注意屏幕上的关键知识点。" },
    { start: 15, end: 20, text: "这个理论在实际应用中非常重要。" },
    { start: 20, end: 25, text: "接下来我们看一个具体的案例分析。" },
    { start: 25, end: 30, text: "大家可以看到，数据的变化趋势非常明显。" },
    { start: 30, end: 1000, text: "（AI 正在实时转录语音内容...）" }
  ],
  en: [
    { start: 0, end: 5, text: "Hello everyone, welcome to this course." },
    { start: 5, end: 10, text: "Today we will dive deep into the core concepts." },
    { start: 10, end: 15, text: "Please pay attention to the key points on the screen." },
    { start: 15, end: 20, text: "This theory is crucial in practical applications." },
    { start: 20, end: 25, text: "Next, let's look at a specific case study." },
    { start: 25, end: 30, text: "As you can see, the data trend is very clear." },
    { start: 30, end: 1000, text: "(AI is transcribing audio content in real-time...)" }
  ]
};

export const SmartVideoPlayer: React.FC<SmartVideoPlayerProps> = ({ video, userId, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.durationSec || 0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Feature State
  const [showChapters, setShowChapters] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [subtitleLang, setSubtitleLang] = useState<'zh' | 'en'>('zh');
  const [currentSubtitleText, setCurrentSubtitleText] = useState('');
  
  const [activeQuiz, setActiveQuiz] = useState<VideoQuiz | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  
  // UI State for Menus
  const [activeMenu, setActiveMenu] = useState<'speed' | 'lang' | null>(null);
  
  // Notes State
  const [notes, setNotes] = useState<string[]>([]);
  const [isAutoOrganizing, setIsAutoOrganizing] = useState(false);

  // Load progress
  useEffect(() => {
      const loadProgress = async () => {
          const time = await api.getVideoProgress(userId, video.id);
          if (videoRef.current) {
              videoRef.current.currentTime = time;
              setCurrentTime(time);
          }
      };
      loadProgress();
  }, [video.id, userId]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !(event.target as Element).closest('.player-menu-trigger')) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenu]);

  // Handle Time Update (Progress, Quizzes, Subtitles)
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    
    // Save Progress Throttled
    if (Math.floor(time) % 5 === 0) {
        api.saveVideoProgress(userId, video.id, time);
    }

    // Update Subtitles
    if (showSubtitle) {
        const subs = MOCK_SUBTITLES[subtitleLang];
        const current = subs.find(s => time >= s.start && time < s.end);
        setCurrentSubtitleText(current ? current.text : "");
    }

    // Check for Quizzes
    if (video.quizzes) {
       const quiz = video.quizzes.find(q => Math.abs(q.timestamp - time) < 0.5 && !quizAnswered);
       if (quiz && !activeQuiz) {
           videoRef.current.pause();
           setIsPlaying(false);
           setActiveQuiz(quiz);
       }
    }
  };

  const togglePlay = async () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
          try {
             await videoRef.current.play();
             setIsPlaying(true);
          } catch (e) {
             console.error("Play failed", e);
             setIsPlaying(false);
          }
      } else {
          videoRef.current.pause();
          setIsPlaying(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSpeedChange = (speed: number) => {
      setPlaybackRate(speed);
      if (videoRef.current) videoRef.current.playbackRate = speed;
      setActiveMenu(null);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = Number(e.target.value);
      if (videoRef.current) {
          videoRef.current.currentTime = time;
          setCurrentTime(time);
      }
  };

  const handleChapterClick = async (startTime: number) => {
      if (videoRef.current) {
          videoRef.current.currentTime = startTime;
          setCurrentTime(startTime);
          try {
             await videoRef.current.play();
             setIsPlaying(true);
          } catch (e) {
             console.error("Chapter play failed", e);
             setIsPlaying(false);
          }
      }
  };

  const handleQuizSubmit = (selectedIndex: number) => {
      if (!activeQuiz) return;
      if (selectedIndex === activeQuiz.correctAnswer) {
          alert("回答正确！🎉");
          setQuizAnswered(true);
          setTimeout(async () => {
              setActiveQuiz(null);
              setQuizAnswered(false); 
              if (videoRef.current) {
                  try {
                      await videoRef.current.play();
                      setIsPlaying(true);
                  } catch(e) {
                      console.error("Resume failed", e);
                  }
              }
          }, 1500);
      } else {
          alert("答案错误，请再试一次。提示：" + activeQuiz.explanation);
      }
  };

  const handleAutoOrganizeNotes = async () => {
      if (notes.length === 0) return;
      setIsAutoOrganizing(true);
      const raw = notes.join('\n');
      const organized = await geminiService.organizeNotes(raw);
      setNotes([organized]); 
      setIsAutoOrganizing(false);
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in-up h-full pb-10">
        {/* Main Player Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <Button variant="glass" size="sm" onClick={onBack} className="pl-3 pr-4">
                    <ArrowLeft className="w-5 h-5 mr-1" /> 返回课程列表
                </Button>
                <h1 className="text-xl font-bold text-slate-800 line-clamp-1">{video.title}</h1>
            </div>

            {/* Video Container */}
            <div 
                ref={playerContainerRef}
                className="relative group bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video ring-4 ring-white ring-opacity-50"
            >
                <video 
                    ref={videoRef}
                    src={video.url}
                    poster={video.thumbnail}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    onClick={togglePlay}
                />

                {/* Subtitles Overlay */}
                {showSubtitle && currentSubtitleText && (
                    <div className="absolute bottom-20 left-4 right-4 text-center pointer-events-none z-10">
                         <span className="inline-block px-4 py-2 bg-black/70 text-white text-lg rounded-xl backdrop-blur-md shadow-lg leading-relaxed max-w-[80%]">
                             {currentSubtitleText}
                         </span>
                    </div>
                )}

                {/* Quiz Overlay */}
                {activeQuiz && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center p-6">
                        <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300">
                             <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold">
                                 <Sparkles className="w-5 h-5" /> 随堂小测
                             </div>
                             <h3 className="text-xl font-bold text-gray-900 mb-6">{activeQuiz.question}</h3>
                             <div className="space-y-3">
                                 {activeQuiz.options.map((opt, idx) => (
                                     <button 
                                        key={idx}
                                        onClick={() => handleQuizSubmit(idx)}
                                        className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-medium text-gray-700"
                                     >
                                         {opt}
                                     </button>
                                 ))}
                             </div>
                        </div>
                    </div>
                )}

                {/* Custom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex flex-col gap-2 z-20">
                    {/* Progress Bar */}
                    <div className="relative group/progress h-2 w-full cursor-pointer mb-2">
                         <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                         <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                         <input 
                            type="range" 
                            min={0} 
                            max={duration || 100} 
                            value={currentTime} 
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                         />
                    </div>
                    
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="hover:text-indigo-400 transition-colors p-1 rounded-lg hover:bg-white/10">
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                            </button>
                            <span className="text-sm font-medium font-mono tracking-wider">{formatTime(currentTime)} / {formatTime(duration)}</span>
                            
                            <div className="flex items-center gap-2 group/vol">
                                <button onClick={() => setIsMuted(!isMuted)} className="p-1 rounded-lg hover:bg-white/10">
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                                <input 
                                   type="range" min={0} max={1} step={0.1} 
                                   value={volume} 
                                   onChange={(e) => { setVolume(Number(e.target.value)); if(videoRef.current) videoRef.current.volume = Number(e.target.value); }}
                                   className="w-20 h-1 accent-white opacity-0 group-hover/vol:opacity-100 transition-opacity cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                             {/* Subtitle Toggle & Menu */}
                             <div className="relative player-menu-trigger">
                                 <button 
                                    onClick={() => setActiveMenu(activeMenu === 'lang' ? null : 'lang')}
                                    className={`p-2 rounded-lg transition-colors ${showSubtitle ? 'text-indigo-400 bg-white/10' : 'hover:bg-white/10 text-white'}`}
                                    title="字幕设置"
                                 >
                                     <Languages className="w-5 h-5" />
                                 </button>
                                 
                                 {activeMenu === 'lang' && (
                                     <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 rounded-xl p-2 min-w-[140px] shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                                         <div className="text-xs text-gray-400 font-bold px-2 py-1 mb-1 border-b border-white/10">字幕语言</div>
                                         <button 
                                            onClick={() => { setShowSubtitle(true); setSubtitleLang('zh'); setActiveMenu(null); }} 
                                            className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/20 transition-colors ${subtitleLang === 'zh' && showSubtitle ? 'text-indigo-400 bg-white/10' : 'text-gray-200'}`}
                                         >
                                            {subtitleLang === 'zh' && showSubtitle && <CheckCircle2 className="w-3 h-3 mr-2" />}
                                            中文 (AI 实时)
                                         </button>
                                         <button 
                                            onClick={() => { setShowSubtitle(true); setSubtitleLang('en'); setActiveMenu(null); }} 
                                            className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/20 transition-colors ${subtitleLang === 'en' && showSubtitle ? 'text-indigo-400 bg-white/10' : 'text-gray-200'}`}
                                         >
                                            {subtitleLang === 'en' && showSubtitle && <CheckCircle2 className="w-3 h-3 mr-2" />}
                                            English
                                         </button>
                                         <button 
                                            onClick={() => { setShowSubtitle(false); setActiveMenu(null); }} 
                                            className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/20 text-red-400`}
                                         >
                                            关闭字幕
                                         </button>
                                     </div>
                                 )}
                             </div>

                             {/* Speed Control */}
                             <div className="relative player-menu-trigger">
                                 <button 
                                    onClick={() => setActiveMenu(activeMenu === 'speed' ? null : 'speed')}
                                    className="p-2 rounded-lg hover:bg-white/10 text-sm font-bold min-w-[3rem]"
                                 >
                                     {playbackRate}x
                                 </button>
                                 {activeMenu === 'speed' && (
                                     <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 rounded-xl p-1 min-w-[80px] shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                                         {[2.0, 1.5, 1.25, 1.0, 0.75, 0.5].map(rate => (
                                             <button 
                                                key={rate} 
                                                onClick={() => handleSpeedChange(rate)}
                                                className={`block w-full text-center px-2 py-2 text-sm rounded-lg hover:bg-white/20 transition-colors ${playbackRate === rate ? 'text-indigo-400 font-bold bg-white/10' : 'text-gray-300'}`}
                                             >
                                                 {rate}x
                                             </button>
                                         ))}
                                     </div>
                                 )}
                             </div>

                             <button 
                                onClick={() => setShowChapters(!showChapters)} 
                                className={`p-2 rounded-lg transition-colors ${showChapters ? 'text-indigo-400 bg-white/10' : 'hover:bg-white/10 text-white'}`}
                                title="显示章节"
                             >
                                 <List className="w-5 h-5" />
                             </button>

                             <button onClick={toggleFullscreen} className="p-2 rounded-lg hover:bg-white/10 text-white">
                                 <Maximize className="w-5 h-5" />
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Info Card */}
            <div className="glass-panel p-6 rounded-3xl">
                <div className="flex gap-2 mb-3">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100">{video.category}</span>
                    <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg border border-slate-100">{new Date(video.uploadDate).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{video.description}</p>
            </div>
        </div>

        {/* Sidebar: Chapters & Notes */}
        <div className="flex flex-col gap-6 h-full lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto pr-1 custom-scrollbar">
            {/* Chapters */}
            {showChapters && video.chapters && (
                <div className="glass-panel p-5 rounded-3xl animate-in slide-in-from-right-2">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                        <List className="w-4 h-4 mr-2 text-indigo-500" /> 课程章节
                    </h3>
                    <div className="space-y-2 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                        
                        {video.chapters.map((chapter, idx) => {
                            const isActive = currentTime >= chapter.startTime && currentTime < (chapter.startTime + chapter.duration);
                            return (
                                <div 
                                    key={chapter.id}
                                    onClick={() => handleChapterClick(chapter.startTime)}
                                    className={`relative pl-8 py-3 rounded-xl cursor-pointer transition-all border border-transparent ${
                                        isActive 
                                        ? 'bg-indigo-50 border-indigo-100 shadow-sm' 
                                        : 'hover:bg-white/60 hover:border-gray-100'
                                    }`}
                                >
                                    <div className={`absolute left-[5px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-10 transition-colors ${isActive ? 'bg-indigo-500 border-indigo-200 scale-110' : 'bg-white border-gray-300'}`}></div>
                                    <h4 className={`text-sm font-bold leading-tight ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>{chapter.title}</h4>
                                    <span className="text-xs text-slate-400 mt-1 block font-mono">{formatTime(chapter.startTime)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* AI Smart Notes */}
            <div className="flex-1 flex flex-col glass-panel p-5 rounded-3xl min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-purple-500" /> 智能笔记
                    </h3>
                    {notes.length > 0 && (
                        <Button size="sm" onClick={handleAutoOrganizeNotes} disabled={isAutoOrganizing} className="text-xs px-2 py-1 h-auto">
                            <Sparkles className="w-3 h-3 mr-1" /> {isAutoOrganizing ? '整理中...' : 'AI 整理'}
                        </Button>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto bg-white/40 rounded-xl p-3 mb-4 border border-white/60 text-sm text-slate-700 space-y-2 custom-scrollbar">
                    {notes.length === 0 ? (
                        <div className="text-center text-slate-400 py-10 flex flex-col items-center">
                            <FileText className="w-8 h-8 mb-2 opacity-20" />
                            <span>暂无笔记，点击下方录音或手动输入</span>
                        </div>
                    ) : (
                        notes.map((note, idx) => (
                             <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 whitespace-pre-wrap leading-relaxed">
                                 {note}
                             </div>
                        ))
                    )}
                </div>

                <VoiceNote onSaveNote={(text) => setNotes(prev => [...prev, text])} />
                
                {/* Manual Text Input Fallback (simple) */}
                <div className="mt-3 flex gap-2">
                    <input 
                       className="flex-1 px-4 py-2.5 rounded-xl bg-white/60 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-slate-400"
                       placeholder="手动输入笔记..."
                       onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                               const target = e.target as HTMLInputElement;
                               if (target.value.trim()) {
                                   setNotes(prev => [...prev, target.value]);
                                   target.value = '';
                               }
                           }
                       }}
                    />
                </div>
            </div>
        </div>
    </div>
  );
};
