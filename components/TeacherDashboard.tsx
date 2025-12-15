
import React, { useState, useEffect } from 'react';
import { User, Video } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { api } from '../services/api';
import { Schedule } from './Schedule';
import { UploadCloud, Video as VideoIcon, Users, BarChart, Home, PlusCircle, BookOpen, Sparkles, AlertTriangle, PenTool, Download } from 'lucide-react';

interface TeacherDashboardProps {
  user: User;
  onVideoUploaded: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onVideoUploaded }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'courses' | 'analytics'>('overview');
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  
  // Upload Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadMyVideos();
  }, [user]);

  const loadMyVideos = async () => {
    const all = await api.getVideos();
    setMyVideos(all.filter(v => v.uploaderId === user.id || v.uploaderId === 'teacher_mock'));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await api.addVideo({
        title,
        description: desc,
        category: category || 'General',
        thumbnail: `https://picsum.photos/seed/${Date.now()}/800/450`, // Mock thumbnail
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', // Mock video URL
        duration: '10:00',
        durationSec: 600,
        uploaderId: user.id
      });
      alert("发布成功！");
      setTitle('');
      setDesc('');
      setCategory('');
      onVideoUploaded(); // Refresh global list
      loadMyVideos(); // Refresh local list
      setActiveTab('courses'); // Redirect to courses after upload
    } catch (e) {
      alert("发布失败");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadReport = () => {
      // Generate a mock CSV report
      const headers = "学生姓名,学号,课程进度,测验平均分,活跃度\n";
      const rows = [
          "张三,1001,85%,92,高",
          "李四,1002,60%,78,中",
          "王五,1003,95%,98,高",
          "赵六,1004,30%,65,低"
      ].join("\n");
      const content = headers + rows;
      
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `班级学情报表_${new Date().toLocaleDateString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleDeleteVideo = async (videoId: string) => {
      if (confirm("确定要下架该课程吗？操作不可恢复。")) {
          try {
              await api.deleteVideo(videoId);
              loadMyVideos();
              onVideoUploaded();
          } catch(e) {
              alert("删除失败，请重试。");
          }
      }
  };

  const handleEditVideo = async (video: Video) => {
      const newTitle = prompt("修改课程标题", video.title);
      if (newTitle && newTitle !== video.title) {
          try {
              await api.updateVideo(video.id, { title: newTitle });
              loadMyVideos();
              onVideoUploaded();
          } catch(e) {
              alert("更新失败");
          }
      }
  };

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 glass-panel p-6 rounded-[32px] shadow-lg">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-300">
               <Home className="w-6 h-6" />
             </div>
             <h2 className="text-3xl font-bold text-slate-800 tracking-tight">教师工作台</h2>
           </div>
           <p className="text-slate-500 font-medium ml-1">欢迎回来，{user.username} 老师。今天也是充满希望的一天。</p>
        </div>
        <div className="flex p-1.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-inner">
           {[
             { id: 'overview', label: '教学概览', icon: Home },
             { id: 'upload', label: '发布课程', icon: UploadCloud },
             { id: 'analytics', label: '班级学情', icon: BarChart },
             { id: 'courses', label: '课程管理', icon: VideoIcon },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                 activeTab === tab.id 
                   ? 'bg-white text-indigo-600 shadow-md transform scale-105 ring-1 ring-black/5' 
                   : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
               }`}
             >
               <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-indigo-500' : ''}`} />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* OVERVIEW TAB (HOME) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left Column: Stats & Actions */}
           <div className="space-y-6 lg:col-span-1">
              {/* Quick Actions Card */}
              <div className="glass-card p-6 rounded-[32px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/60">
                 <h3 className="font-bold text-slate-800 mb-5 flex items-center text-lg">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-600" /> 快捷操作
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                       onClick={() => setActiveTab('upload')}
                       className="p-5 bg-white/60 rounded-2xl hover:bg-white transition-all text-center group border border-white/60 shadow-sm hover:shadow-md hover:scale-[1.02] duration-300"
                    >
                       <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <PlusCircle className="w-6 h-6" />
                       </div>
                       <span className="text-sm font-bold text-slate-700">发布新课</span>
                    </button>
                    <button 
                       onClick={() => setActiveTab('analytics')}
                       className="p-5 bg-white/60 rounded-2xl hover:bg-white transition-all text-center group border border-white/60 shadow-sm hover:shadow-md hover:scale-[1.02] duration-300"
                    >
                       <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <BarChart className="w-6 h-6" />
                       </div>
                       <span className="text-sm font-bold text-slate-700">查看报表</span>
                    </button>
                 </div>
              </div>

              {/* Mini Stats */}
              <div className="glass-panel p-6 rounded-[32px] space-y-4 shadow-md">
                 <h3 className="font-bold text-slate-800 mb-2 text-lg">数据速览</h3>
                 <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/50 transition-colors hover:bg-white/80">
                    <span className="text-sm font-medium text-slate-500">我的课程</span>
                    <span className="text-xl font-bold text-indigo-600">{myVideos.length}</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/50 transition-colors hover:bg-white/80">
                    <span className="text-sm font-medium text-slate-500">学生总数</span>
                    <span className="text-xl font-bold text-purple-600">128</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/50 transition-colors hover:bg-white/80">
                    <span className="text-sm font-medium text-slate-500">本周作业</span>
                    <span className="text-xl font-bold text-emerald-600">45</span>
                 </div>
              </div>
           </div>

           {/* Right Column: Schedule */}
           <div className="lg:col-span-2">
              <Schedule userId={user.id} isEditable={true} />
           </div>
        </div>
      )}

      {/* UPLOAD TAB */}
      {activeTab === 'upload' && (
        <div className="max-w-4xl mx-auto">
            <div className="glass-panel p-10 rounded-[32px] shadow-lg">
              <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center">
                 <div className="p-3 bg-indigo-100 rounded-2xl mr-4 text-indigo-600">
                    <UploadCloud className="w-7 h-7" />
                 </div>
                 上传新课程
              </h3>
              <form onSubmit={handleUpload} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="课程标题" value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：高等数学第一章" required />
                    <Input label="学科分类" value={category} onChange={e => setCategory(e.target.value)} placeholder="例如：数学、物理" required />
                </div>
                <div>
                   <label className="block text-sm font-semibold mb-2 text-slate-700 ml-1">课程简介</label>
                   <textarea 
                     value={desc} 
                     onChange={e => setDesc(e.target.value)}
                     className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none placeholder-slate-400 text-slate-700 shadow-sm"
                     placeholder="请输入课程的主要内容、教学目标等..."
                   />
                </div>
                {/* File input mock */}
                <div className="border-3 border-dashed border-indigo-200 rounded-3xl p-12 text-center bg-indigo-50/20 hover:bg-indigo-50/50 transition-all cursor-pointer group hover:border-indigo-400">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                     <VideoIcon className="w-10 h-10 text-indigo-500 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-slate-700 font-bold text-lg">点击此处选择视频文件</p>
                  <p className="text-sm text-slate-400 mt-2">支持 MP4, WebM (最大 500MB)</p>
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={isUploading} size="lg" className="w-full md:w-auto px-12 py-4 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 text-lg">
                        确认发布
                    </Button>
                </div>
              </form>
            </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-panel p-8 rounded-[32px] shadow-lg">
              <h3 className="font-bold text-xl mb-8 flex items-center text-slate-800">
                 <Users className="w-6 h-6 mr-3 text-indigo-600"/> 班级活跃度趋势
              </h3>
              <div className="flex items-end justify-between h-64 px-2 space-x-4">
                 {[40, 65, 30, 85, 50, 70, 60].map((h, i) => (
                   <div key={i} className="w-full bg-indigo-50/50 rounded-t-2xl relative group overflow-hidden">
                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-2xl transition-all duration-700 ease-out group-hover:opacity-90 shadow-[0_0_15px_rgba(79,70,229,0.3)]" style={{height: `${h}%`}}></div>
                      {/* Tooltip hint */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        {h}%
                      </div>
                   </div>
                 ))}
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400 mt-6 px-2 uppercase tracking-wide">
                 <span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>周日</span>
              </div>
           </div>
           
           <div className="glass-panel p-8 rounded-[32px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-xl shadow-emerald-200/50 relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <h3 className="font-bold text-xl mb-3 flex items-center text-white relative z-10">
                 <Sparkles className="w-6 h-6 mr-3 text-emerald-100"/> AI 学情总结报告
              </h3>
              <p className="text-sm text-emerald-50 mb-8 bg-white/10 inline-block px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm relative z-10">基于本周数据自动生成</p>
              
              <div className="space-y-4 text-sm relative z-10">
                 <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/15 transition-colors">
                    <div className="font-bold text-emerald-50 mb-1 flex items-center gap-2">
                       <BookOpen className="w-4 h-4"/> 知识点掌握
                    </div>
                    <p className="leading-relaxed opacity-90">大部分学生在“微积分”章节停留时间较长，建议增加辅导。</p>
                 </div>
                 <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/15 transition-colors">
                    <div className="font-bold text-emerald-50 mb-1 flex items-center gap-2">
                       <BarChart className="w-4 h-4"/> 测验表现
                    </div>
                    <p className="leading-relaxed opacity-90">本周测验平均分 78.5，较上周提升 5%。</p>
                 </div>
                 <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/15 transition-colors">
                    <div className="font-bold text-emerald-50 mb-1 flex items-center gap-2">
                       <AlertTriangle className="w-4 h-4"/> 预警提醒
                    </div>
                    <p className="leading-relaxed opacity-90">3 位学生连续未完成作业，需关注。</p>
                 </div>
              </div>
              <Button 
                onClick={handleDownloadReport} 
                variant="secondary" 
                size="sm" 
                className="mt-8 w-full text-emerald-700 font-bold bg-white hover:bg-emerald-50 border-none shadow-lg relative z-10"
              >
                  <Download className="w-4 h-4 mr-2" />
                  下载详细报告
              </Button>
           </div>
        </div>
      )}

      {/* COURSES TAB (MANAGEMENT) */}
      {activeTab === 'courses' && (
        <div className="glass-panel p-8 rounded-[32px] shadow-lg">
           <h3 className="font-bold text-xl mb-8 text-slate-800 flex items-center">
             <VideoIcon className="w-6 h-6 mr-3 text-indigo-600"/> 
             课程管理 
             <span className="ml-3 text-sm font-normal text-slate-500 bg-white/50 px-3 py-1 rounded-full border border-white/50">{myVideos.length} 个视频</span>
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {myVideos.map(v => (
               <div key={v.id} className="glass-card flex gap-5 p-5 rounded-2xl group hover:bg-white/80 transition-all duration-300">
                  <div className="w-40 h-28 rounded-xl overflow-hidden shadow-md flex-shrink-0 relative">
                     <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                     <div>
                        <h4 className="font-bold text-slate-800 line-clamp-1 text-lg mb-1">{v.title}</h4>
                        <div className="flex flex-wrap gap-2 text-xs">
                           <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-bold border border-indigo-100">{v.category}</span>
                           <span className="px-2.5 py-1 bg-white/60 text-slate-500 rounded-lg border border-slate-100">{new Date(v.uploadDate).toLocaleDateString()}</span>
                        </div>
                     </div>
                     <div className="flex gap-3 justify-end mt-4">
                       <Button onClick={() => handleEditVideo(v)} size="sm" variant="secondary" className="px-4 text-xs font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                          <PenTool className="w-3 h-3 mr-1.5" /> 编辑
                       </Button>
                       <Button 
                         onClick={() => handleDeleteVideo(v.id)}
                         size="sm" 
                         variant="danger" 
                         className="px-4 text-xs font-bold shadow-sm bg-red-600 hover:bg-red-700 text-white border-none"
                       >
                          下架
                       </Button>
                     </div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};
