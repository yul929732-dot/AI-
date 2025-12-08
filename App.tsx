
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { VoiceNote } from './components/VoiceNote';
import { AIAssistant } from './components/AIAssistant';
import { AIQuiz } from './components/AIQuiz';
import { StudentProfile } from './components/StudentProfile'; // Import
import { TeacherDashboard } from './components/TeacherDashboard'; // Import
import { mockBackend } from './services/mockBackend';
import { User, Video, ViewState, Role, QuizQuestion } from './types';
import { COZE_URLS } from './constants';
import { 
  PlayCircle, 
  BookOpen, 
  BrainCircuit, 
  FileCheck, 
  FileText, 
  Play, 
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  UserCircle,
  GraduationCap,
  School
} from 'lucide-react';

function App() {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.LOGIN);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('student'); // Auth role selection
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Notes State
  const [notes, setNotes] = useState<string[]>([]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const session = await mockBackend.getSession();
      if (session) {
        setUser(session);
        setView(session.role === 'teacher' ? ViewState.TEACHER_DASHBOARD : ViewState.DASHBOARD);
        fetchVideos();
      }
    };
    init();
  }, []);

  const fetchVideos = async () => {
    const data = await mockBackend.getVideos();
    setVideos(data);
  };

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    try {
      const loggedInUser = await mockBackend.login(username, password, role);
      setUser(loggedInUser);
      setView(loggedInUser.role === 'teacher' ? ViewState.TEACHER_DASHBOARD : ViewState.DASHBOARD);
      fetchVideos();
    } catch (err: any) {
      setAuthError(err.message || '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (password !== confirmPassword) {
      setAuthError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await mockBackend.register(username, password, email, role);
      setUser(newUser);
      setView(newUser.role === 'teacher' ? ViewState.TEACHER_DASHBOARD : ViewState.DASHBOARD);
      fetchVideos();
    } catch (err: any) {
      setAuthError(err.message || '注册失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await mockBackend.logout();
    setUser(null);
    setCurrentVideo(null);
    setView(ViewState.LOGIN);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
    setNotes([]); 
    setView(ViewState.VIDEO_PLAYER);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setCurrentVideo(null);
    if (user?.role === 'teacher') {
       setView(ViewState.TEACHER_DASHBOARD);
    } else {
       setView(ViewState.DASHBOARD);
    }
  };

  const handleToolClick = (toolType: 'ASSISTANT' | 'QUIZ' | 'REPORT' | 'PPT') => {
    switch (toolType) {
      case 'ASSISTANT':
        setView(ViewState.AI_ASSISTANT);
        break;
      case 'QUIZ':
        setView(ViewState.AI_QUIZ);
        break;
      case 'REPORT':
        window.open(COZE_URLS.REPORT, '_blank');
        break;
      case 'PPT':
        window.open(COZE_URLS.TEXT_TO_PPT, '_blank');
        break;
    }
  };

  const handleMistake = async (question: QuizQuestion, wrongAnswer: string | number, topic: string) => {
     if (user) {
        await mockBackend.saveMistake(user.id, {
           question,
           wrongAnswer,
           topic
        });
     }
  };

  // --- VIEWS ---

  const renderAuth = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] fade-in-up">
      {/* Login Card Wrapper with Animated Gradient Border */}
      <div className="relative group w-full max-w-[440px]">
        {/* Animated Gradient Border Layer */}
        {/* Positioned behind the card, slightly larger (inset -3px) to create border effect */}
        {/* Opacity 0 by default, 100 on hover. Blur creates glowing effect */}
        <div 
          className="absolute -inset-[3px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-[34px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm animate-gradient-xy" 
        />
        
        {/* Main Card Content */}
        <div className="relative w-full glass-panel p-10 rounded-[32px] overflow-hidden bg-white/60 hover:bg-white/80 transition-colors duration-500">
          
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex p-4 bg-white/50 backdrop-blur-md rounded-2xl mb-4 shadow-sm border border-white/50 group-hover:scale-110 transition-transform duration-500">
              <PlayCircle className="w-10 h-10 text-indigo-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              {view === ViewState.LOGIN ? '欢迎回到 HITEDU' : '开启学习之旅'}
            </h2>
            <p className="text-slate-500 text-sm mt-2">下一代 AI 智能教育平台</p>
          </div>

          <form onSubmit={view === ViewState.LOGIN ? handleLogin : handleRegister} className="space-y-5 relative z-10">
            
            {/* Role Selection - Top Priority */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
               <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">选择身份</label>
               <div className="grid grid-cols-2 gap-3 p-1.5 glass-card rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 ${role === 'student' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-white/30'}`}
                  >
                    <GraduationCap className={`w-6 h-6 mb-1 ${role === 'student' ? 'text-indigo-500' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">我是学生</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 ${role === 'teacher' ? 'bg-white shadow-md text-purple-600' : 'text-slate-400 hover:text-slate-600 hover:bg-white/30'}`}
                  >
                    <School className={`w-6 h-6 mb-1 ${role === 'teacher' ? 'text-purple-500' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">我是教师</span>
                  </button>
               </div>
            </div>

            <div className="space-y-4">
              <div className="group/input">
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 ml-1">用户名</label>
                <input
                  className="w-full px-4 py-3 rounded-xl glass-input focus:outline-none transition-all duration-300 placeholder-slate-400 text-slate-800"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  required
                />
              </div>
              
              {view === ViewState.REGISTER && (
                <div className="group/input">
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 ml-1">电子邮箱</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl glass-input focus:outline-none transition-all duration-300 placeholder-slate-400 text-slate-800"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>
              )}

              <div className="group/input">
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 ml-1">密码</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl glass-input focus:outline-none transition-all duration-300 placeholder-slate-400 text-slate-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {view === ViewState.REGISTER && (
                <div className="group/input">
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 ml-1">确认密码</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-xl glass-input focus:outline-none transition-all duration-300 placeholder-slate-400 text-slate-800"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}
            </div>

            {authError && (
              <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                {authError}
              </div>
            )}

            <Button type="submit" className="w-full py-3.5 text-base shadow-lg shadow-indigo-500/30 rounded-xl" isLoading={isLoading} size="lg">
              {view === ViewState.LOGIN ? '登录账户' : '立即注册'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200/50 text-center relative z-10">
            <p className="text-sm text-slate-500">
              {view === ViewState.LOGIN ? "还没有账户？ " : "已有账户？ "}
              <button
                onClick={() => {
                  setAuthError('');
                  setConfirmPassword('');
                  setView(view === ViewState.LOGIN ? ViewState.REGISTER : ViewState.LOGIN);
                }}
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
              >
                {view === ViewState.LOGIN ? '免费注册' : '直接登录'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-12 fade-in-up">
      {/* Student Profile Shortcut / Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-6 glass-panel rounded-[32px] p-8 bg-gradient-to-r from-indigo-600/90 to-purple-700/90 text-white shadow-xl shadow-indigo-200 border-none">
         <div>
            <h1 className="text-3xl font-bold mb-2">你好，{user?.username} 👋</h1>
            <p className="text-indigo-100">准备好开始今天的学习了吗？查看您的学习进度。</p>
         </div>
         <Button 
           variant="secondary" 
           onClick={() => setView(ViewState.STUDENT_PROFILE)}
           className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md shadow-none"
         >
           <UserCircle className="w-5 h-5 mr-2" />
           个人中心 & 学习画像
         </Button>
      </section>

      {/* AI Tools */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-indigo-600" /> AI 学习工具
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: 'AI 助教', 
              icon: BrainCircuit, 
              color: 'bg-purple-100 text-purple-600', 
              hoverColor: 'group-hover:bg-purple-600 group-hover:text-white', 
              action: () => handleToolClick('ASSISTANT'), 
              desc: '24/7 智能辅导，随时解答疑惑',
              internal: true 
            },
            { 
              title: 'AI 出题', 
              icon: FileCheck, 
              color: 'bg-emerald-100 text-emerald-600', 
              hoverColor: 'group-hover:bg-emerald-600 group-hover:text-white', 
              action: () => handleToolClick('QUIZ'), 
              desc: '根据知识点生成定制化测试',
              internal: true 
            },
            { 
              title: 'AI 批改', 
              icon: FileText, 
              color: 'bg-blue-100 text-blue-600', 
              hoverColor: 'group-hover:bg-blue-600 group-hover:text-white', 
              action: () => handleToolClick('REPORT'), 
              desc: '即时作业反馈与深度分析报告',
              internal: false
            },
            { 
              title: 'AI 课本', 
              icon: BookOpen, 
              color: 'bg-orange-100 text-orange-600', 
              hoverColor: 'group-hover:bg-orange-600 group-hover:text-white', 
              action: () => handleToolClick('PPT'), 
              desc: '一键将课本内容转换为 PPT',
              internal: false
            },
          ].map((tool, idx) => (
            <div 
              key={idx}
              onClick={tool.action}
              className="glass-card p-6 rounded-2xl cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center mb-4 transition-colors duration-300 ${tool.hoverColor}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 flex items-center justify-between">
                {tool.title}
                {tool.internal ? (
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-all" />
                ) : (
                  <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-slate-900 opacity-0 group-hover:opacity-100" />
                )}
              </h3>
              <p className="text-xs text-slate-500">{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Video List Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            推荐课程
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div 
              key={video.id}
              className="glass-card rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 group flex flex-col h-full bg-white/40"
            >
              <div className="relative aspect-video overflow-hidden cursor-pointer" onClick={() => handleVideoSelect(video)}>
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-lg">
                    <Play className="w-7 h-7 text-white ml-1 fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium flex items-center border border-white/10">
                  <Clock className="w-3 h-3 mr-1" />
                  {video.duration}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-indigo-600 bg-indigo-50 text-[10px] font-bold uppercase tracking-wider">
                    {video.category}
                  </span>
                </div>
                <h3 
                  className="font-bold text-slate-800 mb-2 cursor-pointer hover:text-indigo-600 transition-colors line-clamp-1"
                  onClick={() => handleVideoSelect(video)}
                >
                  {video.title}
                </h3>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="mt-auto w-full justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300 bg-white/60"
                  onClick={() => handleVideoSelect(video)}
                >
                  立即观看
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderVideoPlayer = () => {
    if (!currentVideo) return null;
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in-up">
        <div className="lg:col-span-2 space-y-6">
          <button 
            onClick={handleNavigateHome}
            className="group flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm"
          >
            <div className="p-1 rounded-full bg-white border border-gray-200 mr-2 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
              <ArrowRight className="w-4 h-4 rotate-180" />
            </div>
            返回
          </button>

          <div className="bg-black rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/20 aspect-video relative group ring-4 ring-white ring-opacity-50">
            <video 
              controls 
              className="w-full h-full"
              poster={currentVideo.thumbnail}
            >
              <source src={currentVideo.url} type="video/mp4" />
              您的浏览器不支持 video 标签。
            </video>
          </div>

          <div className="glass-panel rounded-3xl p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{currentVideo.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-slate-500 mb-6 pb-6 border-b border-gray-200/50">
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium border border-indigo-100">{currentVideo.category}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {currentVideo.duration}</span>
            </div>
            <div className="prose prose-indigo text-slate-600 leading-relaxed max-w-none">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">课程简介</h3>
              <p>{currentVideo.description}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <VoiceNote 
            onSaveNote={(text) => setNotes(prev => [text, ...prev])} 
          />

          <div className="glass-panel rounded-3xl p-6 h-[calc(100vh-350px)] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400" />
            <h3 className="font-bold text-slate-900 mb-6 flex items-center text-lg">
              <div className="p-2 bg-indigo-50 rounded-lg mr-3 text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              您的笔记
              <span className="ml-auto text-xs font-normal text-slate-400 bg-white/50 px-2 py-1 rounded-md">{notes.length} 条记录</span>
            </h3>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {notes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200/50 rounded-2xl bg-white/30">
                   <span className="text-sm text-slate-500">暂无笔记</span>
                </div>
              ) : (
                notes.map((note, idx) => (
                  <div key={idx} className="group bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all">
                    <p className="text-slate-700 text-sm leading-relaxed">{note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout}
      onNavigateHome={handleNavigateHome}
    >
      {(view === ViewState.LOGIN || view === ViewState.REGISTER) && renderAuth()}
      {view === ViewState.DASHBOARD && renderDashboard()}
      {view === ViewState.TEACHER_DASHBOARD && user && (
         <TeacherDashboard user={user} onVideoUploaded={fetchVideos} />
      )}
      {view === ViewState.STUDENT_PROFILE && user && <StudentProfile user={user} />}
      {view === ViewState.VIDEO_PLAYER && renderVideoPlayer()}
      {view === ViewState.AI_ASSISTANT && <AIAssistant onBack={handleNavigateHome} />}
      {view === ViewState.AI_QUIZ && <AIQuiz onBack={handleNavigateHome} onMistake={handleMistake} />}
    </Layout>
  );
}

export default App;
