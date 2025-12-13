
import React, { useState } from 'react';
import { Bot, Calendar, MessageCircle, Search, Video, User, Star, Clock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { AIAssistant } from './AIAssistant'; // Reuse internal logic but might need refactor if strictly separated

interface OnlineTutoringProps {
    onBack: () => void;
}

export const OnlineTutoring: React.FC<OnlineTutoringProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'ai' | 'live' | 'faq'>('ai');
    
    // Mock Data for Live Tutoring
    const teachers = [
        { id: 't1', name: '王老师', subject: '高等数学', rating: 4.9, avatar: 'https://ui-avatars.com/api/?name=Wang&background=7c3aed&color=fff' },
        { id: 't2', name: '李教授', subject: '量子物理', rating: 4.8, avatar: 'https://ui-avatars.com/api/?name=Li&background=0ea5e9&color=fff' },
        { id: 't3', name: 'Sarah', subject: '英语口语', rating: 4.9, avatar: 'https://ui-avatars.com/api/?name=Sarah&background=ec4899&color=fff' }
    ];

    // Mock Data for FAQ
    const faqs = [
        { id: 'f1', q: '如何计算矩阵的特征值？', a: '特征值是满足方程 Av = λv 的标量 λ。计算时通常求解特征方程 det(A - λI) = 0。', tags: ['数学', '矩阵'] },
        { id: 'f2', q: '光电效应的物理意义是什么？', a: '光电效应证明了光具有粒子性，即光子。当光照射在金属表面时，若频率足够高，会打出电子。', tags: ['物理', '量子'] },
        { id: 'f3', q: 'Python 中列表和元组的区别？', a: '列表(List)是可变的，用[]表示；元组(Tuple)是不可变的，用()表示。元组通常用于存储异构数据或作为字典的键。', tags: ['编程', 'Python'] }
    ];

    const renderLiveTutoring = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div className="glass-panel p-6 rounded-[32px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                 <h2 className="text-2xl font-bold mb-2">名师在线辅导</h2>
                 <p className="opacity-90">预约 1 对 1 专属辅导，或加入正在进行的直播答疑。</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {teachers.map(t => (
                     <div key={t.id} className="glass-card p-6 rounded-2xl flex flex-col items-center text-center hover:bg-white/80 transition-all">
                         <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-indigo-300 to-purple-300 mb-4">
                             <img src={t.avatar} className="w-full h-full rounded-full border-2 border-white" />
                         </div>
                         <h3 className="font-bold text-slate-800 text-lg">{t.name}</h3>
                         <p className="text-slate-500 text-sm mb-2">{t.subject}</p>
                         <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold mb-6">
                             <Star className="w-4 h-4 fill-current" /> {t.rating}
                         </div>
                         <div className="w-full space-y-2 mt-auto">
                             <Button className="w-full" size="sm">
                                 <Calendar className="w-4 h-4 mr-2" /> 预约时间
                             </Button>
                             <Button variant="outline" className="w-full" size="sm" onClick={() => alert("正在连接直播教室...")}>
                                 <Video className="w-4 h-4 mr-2" /> 进入直播间
                             </Button>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    );

    const renderFAQ = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                   className="w-full pl-12 pr-4 py-4 rounded-2xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   placeholder="搜索常见问题关键字..."
                />
            </div>

            <div className="space-y-4">
                {faqs.map(f => (
                    <div key={f.id} className="glass-panel p-6 rounded-2xl hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-start gap-4">
                             <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mt-1">
                                 <MessageCircle className="w-5 h-5" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-indigo-600 transition-colors">{f.q}</h3>
                                 <p className="text-slate-600 leading-relaxed mb-3">{f.a}</p>
                                 <div className="flex gap-2">
                                     {f.tags.map(t => (
                                         <span key={t} className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md">#{t}</span>
                                     ))}
                                 </div>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col max-w-6xl mx-auto fade-in-up">
            {/* Custom Tab Navigation */}
            <div className="glass-panel p-2 rounded-2xl mb-6 flex justify-between items-center">
                 <div className="flex space-x-1">
                     {[
                         { id: 'ai', label: 'AI 智能助教', icon: Bot },
                         { id: 'live', label: '名师辅导', icon: Video },
                         { id: 'faq', label: 'FAQ 知识库', icon: Search },
                     ].map(tab => (
                         <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                                activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-slate-500 hover:bg-white/50'
                            }`}
                         >
                             <tab.icon className="w-4 h-4 mr-2" />
                             {tab.label}
                         </button>
                     ))}
                 </div>
                 <Button variant="glass" onClick={onBack} size="sm" className="pl-3 pr-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> 返回首页
                 </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-[500px]">
                {activeTab === 'ai' && <AIAssistant />} 
                {activeTab === 'live' && renderLiveTutoring()}
                {activeTab === 'faq' && renderFAQ()}
            </div>
        </div>
    );
};
