
import React, { useEffect, useState, useRef } from 'react';
import { User, MistakeRecord, LearningStats } from '../types';
import { api } from '../services/api';
import { geminiService } from '../services/geminiService';
import { Schedule } from './Schedule';
import { BarChart3, AlertCircle, Clock, BookOpen, BrainCircuit, XCircle, Sparkles, Camera, Loader2, Upload, Download } from 'lucide-react';

interface StudentProfileProps {
  user: User;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ user }) => {
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('正在生成学习画像...');
  
  // Avatar Editing State
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarPrompt, setAvatarPrompt] = useState('');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const m = await api.getMistakes(user.id);
      setMistakes(m);
      const s = await api.getUserStats(user.id);
      setStats(s);
      generateAIAnalysis(s, m);
    };
    loadData();
    setCurrentUser(user);
  }, [user]);

  const generateAIAnalysis = async (s: LearningStats, m: MistakeRecord[]) => {
    try {
       setAiAnalysis("AI 正在分析您的学习数据...");
       const analysis = await geminiService.generateLearningProfile(s, m);
       setAiAnalysis(analysis);
    } catch (e) {
      setAiAnalysis("无法生成画像，请检查网络设置或 API Key。");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await updateAvatar(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAvatar = async () => {
    if (!avatarPrompt.trim()) return;
    setIsGeneratingAvatar(true);
    try {
      const base64Image = await geminiService.generateAvatar(avatarPrompt);
      await updateAvatar(base64Image);
      setAvatarPrompt('');
    } catch (e) {
      alert("生成失败，请检查 API Key 或重试");
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const updateAvatar = async (newUrl: string) => {
    try {
      const updatedUser = await api.updateUserAvatar(user.id, newUrl);
      setCurrentUser(updatedUser);
      setIsEditingAvatar(false);
    } catch (e) {
      console.error(e);
      alert("更新头像失败");
    }
  };

  const handleExportMistakes = () => {
      if (mistakes.length === 0) return;

      let content = "HITEDU 智能错题本导出\n\n";
      mistakes.forEach((m, idx) => {
          content += `【第${idx + 1}题】[${m.topic}] ${new Date(m.timestamp).toLocaleDateString()}\n`;
          content += `题目：${m.question.question}\n`;
          content += `错选：${m.wrongAnswer}\n`;
          if (m.question.type === 'multiple_choice') {
              const correctLabel = String.fromCharCode(65 + (m.question.correctAnswer || 0));
              content += `正解：${correctLabel}\n`;
          }
          content += `解析：${m.question.explanation}\n`;
          content += "----------------------------------------\n\n";
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `错题本_${user.username}_${new Date().toLocaleDateString()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 glass-panel p-8 flex flex-col items-center text-center rounded-[32px]">
          
          {/* Avatar Section */}
          <div className="relative group cursor-pointer" onClick={() => setIsEditingAvatar(!isEditingAvatar)}>
             <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-indigo-400 to-purple-400 mb-4 shadow-lg shadow-indigo-200">
                <img src={currentUser.avatar} alt="avatar" className="w-full h-full rounded-full border-4 border-white object-cover" />
             </div>
             <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mb-4">
                <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm">
                   <Camera className="w-6 h-6 text-white" />
                </div>
             </div>
          </div>

          {/* Avatar Edit Modal/Area */}
          {isEditingAvatar && (
            <div className="w-full mb-4 bg-white/60 p-4 rounded-2xl border border-white/60 shadow-lg animate-in fade-in slide-in-from-top-2 backdrop-blur-md">
               <h4 className="text-xs font-bold text-slate-700 mb-3">更换头像</h4>
               
               <div className="flex flex-col gap-3">
                 {/* Upload */}
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 text-slate-700 transition-colors shadow-sm"
                 >
                   <Upload className="w-3 h-3" /> 本地上传
                 </button>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*"
                   onChange={handleFileUpload}
                 />

                 {/* Separator */}
                 <div className="text-[10px] text-slate-400 font-medium">或 AI 生成 (Nano Banana)</div>

                 {/* Generate */}
                 <div className="flex gap-2">
                    <input 
                      value={avatarPrompt}
                      onChange={e => setAvatarPrompt(e.target.value)}
                      placeholder="如：戴眼镜的卡通猫"
                      className="flex-1 text-xs p-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80"
                    />
                    <button 
                      onClick={handleGenerateAvatar}
                      disabled={isGeneratingAvatar}
                      className="bg-indigo-600 text-white p-2 rounded-xl disabled:opacity-50 shadow-md hover:bg-indigo-700 transition-colors"
                    >
                      {isGeneratingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    </button>
                 </div>
               </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-slate-800">{currentUser.username}</h2>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mt-2">学生身份</span>
          
          <div className="mt-8 w-full space-y-4 text-left">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-500 font-medium">学习时长</span>
                <span className="font-bold text-slate-800">{stats?.totalStudyHours || 0}h</span>
              </div>
              <div className="w-full bg-slate-200/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Portrait & Stats */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* AI Portrait */}
           <div className="glass-panel p-8 rounded-[32px] bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden shadow-xl shadow-indigo-200 border-none">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             <BrainCircuit className="absolute top-6 right-6 w-12 h-12 text-white/20" />
             <h3 className="text-xl font-bold mb-4 flex items-center"><Sparkles className="w-6 h-6 mr-3 text-yellow-300" />AI 学习画像</h3>
             <p className="text-sm leading-relaxed text-indigo-50 whitespace-pre-wrap font-medium">{aiAnalysis}</p>
           </div>

           {/* Quick Stats Grid */}
           <div className="grid grid-cols-2 gap-4">
             <div className="glass-card p-6 rounded-3xl flex flex-col justify-center">
               <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3 text-emerald-600">
                  <BookOpen className="w-6 h-6" />
               </div>
               <div className="text-3xl font-bold text-slate-800">{stats?.completedCourses || 0}</div>
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">已修课程</div>
             </div>
             <div className="glass-card p-6 rounded-3xl flex flex-col justify-center">
               <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-3 text-blue-600">
                  <BarChart3 className="w-6 h-6" />
               </div>
               <div className="text-3xl font-bold text-slate-800">{stats?.quizAccuracy || 0}%</div>
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">平均正确率</div>
             </div>
             <div className="glass-card p-6 rounded-3xl col-span-2">
               <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-500">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-slate-800">薄弱知识点</div>
               </div>
               <div className="flex gap-2 flex-wrap">
                 {stats?.weakPoints.map(wp => (
                   <span key={wp} className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-lg border border-orange-100">{wp}</span>
                 )) || <span className="text-slate-400 text-xs">暂无数据</span>}
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Schedule */}
      <Schedule userId={currentUser.id} isEditable={true} />

      {/* Mistake Notebook */}
      <div className="glass-panel p-8 rounded-[32px]">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl text-red-500">
                <XCircle className="w-5 h-5" />
            </div>
            智能错题本
            </h3>
            {mistakes.length > 0 && (
                <button 
                  onClick={handleExportMistakes}
                  className="flex items-center text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Download className="w-4 h-4 mr-2" /> 导出错题
                </button>
            )}
        </div>
        
        {mistakes.length === 0 ? (
           <div className="text-center py-12 text-slate-400 bg-white/40 rounded-3xl border-2 border-dashed border-slate-200">
             恭喜！您暂时没有错题记录。
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {mistakes.map(m => (
              <div key={m.id} className="p-5 border border-white/60 rounded-2xl bg-white/60 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                   <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">{m.topic}</span>
                   <span className="text-xs text-slate-400 font-medium">{new Date(m.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="font-bold text-slate-800 mb-3 text-lg">{m.question.question}</p>
                <div className="text-sm bg-red-50/50 p-3 rounded-xl border border-red-100/50 mb-3">
                  <p className="mb-1 text-red-600 font-medium">您的答案：{m.wrongAnswer}</p>
                  <p className="text-emerald-600 font-bold">正确答案：{m.question.type === 'multiple_choice' 
                      ? String.fromCharCode(65 + (m.question.correctAnswer || 0))
                      : '请参考解析'}</p>
                </div>
                <div className="pt-3 border-t border-gray-100 text-sm text-slate-600 leading-relaxed">
                   <span className="font-bold text-indigo-600 mr-2">AI 解析:</span>{m.question.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
