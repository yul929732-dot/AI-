import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { VoiceNote } from './components/VoiceNote';
import { mockBackend } from './services/mockBackend';
import { User, Video, ViewState } from './types';
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
  ExternalLink
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
  const [email, setEmail] = useState('');
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
        setView(ViewState.DASHBOARD);
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
      const loggedInUser = await mockBackend.login(username, password);
      setUser(loggedInUser);
      setView(ViewState.DASHBOARD);
      fetchVideos();
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    try {
      const newUser = await mockBackend.register(username, password, email);
      setUser(newUser);
      setView(ViewState.DASHBOARD);
      fetchVideos();
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
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
  };

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
    setNotes([]); // Reset notes for new video
    setView(ViewState.VIDEO_PLAYER);
  };

  const handleBackToDashboard = () => {
    setCurrentVideo(null);
    setView(ViewState.DASHBOARD);
  };

  const handleCozeRedirect = (url: string) => {
    window.open(url, '_blank');
  };

  // --- VIEWS ---

  const renderAuth = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-100 rounded-xl mb-4">
            <PlayCircle className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {view === ViewState.LOGIN ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 mt-2">Access your AI-powered learning hub</p>
        </div>

        <form onSubmit={view === ViewState.LOGIN ? handleLogin : handleRegister} className="space-y-6">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
          
          {view === ViewState.REGISTER && (
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          )}

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {authError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {authError}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
            {view === ViewState.LOGIN ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {view === ViewState.LOGIN ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setAuthError('');
                setView(view === ViewState.LOGIN ? ViewState.REGISTER : ViewState.LOGIN);
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {view === ViewState.LOGIN ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-12">
      {/* Hero / Coze Tools Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">AI Learning Tools</h2>
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
            Powered by Coze & Gemini
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'AI Assistant', icon: BrainCircuit, color: 'bg-purple-100 text-purple-600', url: COZE_URLS.ASSISTANT, desc: '24/7 Intelligent Tutor' },
            { title: 'AI Quiz Master', icon: FileCheck, color: 'bg-green-100 text-green-600', url: COZE_URLS.QUIZ, desc: 'Generate custom tests' },
            { title: 'AI Grader', icon: FileText, color: 'bg-blue-100 text-blue-600', url: COZE_URLS.REPORT, desc: 'Instant feedback & reports' },
            { title: 'AI Textbook', icon: BookOpen, color: 'bg-orange-100 text-orange-600', url: COZE_URLS.TEXT_TO_PPT, desc: 'Text to PPT Converter' },
          ].map((tool, idx) => (
            <div 
              key={idx}
              onClick={() => handleCozeRedirect(tool.url)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-between">
                {tool.title}
                <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-gray-500">{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Video List Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div 
              key={video.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
            >
              <div className="relative aspect-video bg-gray-200 cursor-pointer" onClick={() => handleVideoSelect(video)}>
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Play className="w-5 h-5 text-indigo-600 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded-md text-xs text-white font-medium flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {video.duration}
                </div>
              </div>
              
              <div className="p-5">
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">
                  {video.category}
                </div>
                <h3 
                  className="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-indigo-600 transition-colors line-clamp-1"
                  onClick={() => handleVideoSelect(video)}
                >
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {video.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between group-hover:border-indigo-200 group-hover:bg-indigo-50"
                  onClick={() => handleVideoSelect(video)}
                >
                  Watch Now
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Back Button */}
          <button 
            onClick={handleBackToDashboard}
            className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
            Back to Dashboard
          </button>

          {/* Video Player */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative group">
            <video 
              controls 
              className="w-full h-full"
              poster={currentVideo.thumbnail}
            >
              <source src={currentVideo.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentVideo.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span className="bg-gray-100 px-3 py-1 rounded-full">{currentVideo.category}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {currentVideo.duration}</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {currentVideo.description}
            </p>
          </div>
        </div>

        {/* Sidebar: AI Notes */}
        <div className="lg:col-span-1 space-y-6">
          <VoiceNote 
            onSaveNote={(text) => setNotes(prev => [text, ...prev])} 
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[calc(100vh-400px)] flex flex-col">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" />
              Your Notes
            </h3>
            
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
              {notes.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                  <p>No notes yet.</p>
                  <p className="text-xs mt-1">Use the AI recorder above to transcribe your thoughts.</p>
                </div>
              ) : (
                notes.map((note, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p>{note}</p>
                    <div className="mt-2 text-xs text-gray-400 text-right">
                      {new Date().toLocaleTimeString()}
                    </div>
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
      onNavigateHome={handleBackToDashboard}
    >
      {(view === ViewState.LOGIN || view === ViewState.REGISTER) && renderAuth()}
      {view === ViewState.DASHBOARD && renderDashboard()}
      {view === ViewState.VIDEO_PLAYER && renderVideoPlayer()}
    </Layout>
  );
}

export default App;
