
import React, { useState } from 'react';
import { Presentation, Video as VideoIcon, ArrowRight, Play, Loader2, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { geminiService } from '../services/geminiService';
import { Slide } from '../types';

interface AICoursewareProps {
  onBack: () => void;
}

export const AICourseware: React.FC<AICoursewareProps> = ({ onBack }) => {
  const [step, setStep] = useState<'INPUT' | 'PPT_PREVIEW' | 'VIDEO_PREVIEW'>('INPUT');
  const [topic, setTopic] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleGeneratePPT = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const result = await geminiService.generateCoursewareSlides(topic);
      setSlides(result);
      setStep('PPT_PREVIEW');
    } catch (e) {
      alert("生成失败");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
      setLoading(true);
      // Mocking video generation time
      setTimeout(() => {
          setLoading(false);
          setStep('VIDEO_PREVIEW');
      }, 3000);
  };

  const renderInput = () => (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 fade-in-up">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Presentation className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">AI 教材制作工坊</h2>
        <p className="text-gray-500 text-center mb-8">输入教案或知识点，一键生成 PPT 并转化为教学视频。</p>
        
        <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="请输入教案内容、文章或主题..."
            className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
        />
        
        <Button 
            onClick={handleGeneratePPT} 
            disabled={loading || !topic.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg shadow-purple-200"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ArrowRight className="w-5 h-5 mr-2" />}
            {loading ? '正在生成大纲与设计...' : '生成 PPT 大纲'}
        </Button>
    </div>
  );

  const renderPPTPreview = () => (
    <div className="max-w-5xl mx-auto mt-6 fade-in-up">
        {/* Header with Internal Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 px-2 gap-4">
             <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-bold text-gray-900">PPT 预览</h2>
                 <span className="text-sm font-medium text-gray-500 bg-white/60 px-3 py-1 rounded-full border border-gray-200 backdrop-blur-sm">
                     {activeSlide + 1} / {slides.length}
                 </span>
             </div>
             
             <div className="flex items-center gap-3">
                 <Button variant="ghost" size="sm" onClick={() => setStep('INPUT')} className="text-slate-500 hover:text-slate-800 bg-white/40 hover:bg-white/60">
                     <ArrowLeft className="w-4 h-4 mr-1" /> 重选内容
                 </Button>
                 <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
                 <Button onClick={handleGenerateVideo} className="bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-200/50 border-none text-white">
                     <VideoIcon className="w-4 h-4 mr-2" /> 生成教学视频
                 </Button>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
             {/* Slide View */}
             <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 flex flex-col justify-center items-center shadow-2xl relative overflow-hidden group border border-slate-800">
                  {/* Slide Content */}
                  <div className="w-full h-full bg-white rounded-2xl p-12 flex flex-col relative shadow-inner">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
                      <h1 className="text-3xl font-bold text-slate-800 mb-8 border-b-4 border-purple-500 pb-4 w-fit max-w-[90%] leading-tight">
                          {slides[activeSlide]?.title}
                      </h1>
                      <ul className="space-y-5 flex-grow pr-4">
                          {slides[activeSlide]?.content.map((pt, i) => (
                              <li key={i} className="flex items-start text-xl text-slate-700 font-medium leading-relaxed">
                                  <span className="w-2.5 h-2.5 bg-purple-500 rounded-full mr-4 mt-2.5 flex-shrink-0"></span>
                                  {pt}
                              </li>
                          ))}
                      </ul>
                      <div className="mt-8 h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                          <ImageIcon className="w-12 h-12 opacity-50" />
                      </div>
                  </div>
                  
                  {/* Nav Controls */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                        className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md transition-all hover:scale-110"
                      >
                          <ArrowLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))}
                        className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md transition-all hover:scale-110"
                      >
                          <ArrowRight className="w-5 h-5" />
                      </button>
                  </div>
             </div>

             {/* Sidebar List */}
             <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg border border-white/60 overflow-y-auto custom-scrollbar flex flex-col">
                 <h3 className="font-bold text-gray-500 text-xs uppercase mb-4 px-2">幻灯片大纲</h3>
                 <div className="space-y-3 flex-1">
                     {slides.map((s, i) => (
                         <div 
                           key={i} 
                           onClick={() => setActiveSlide(i)}
                           className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeSlide === i ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-transparent bg-white/50 hover:bg-white hover:border-purple-100'}`}
                         >
                             <div className={`text-xs font-bold mb-1 ${activeSlide === i ? 'text-purple-600' : 'text-gray-400'}`}>PAGE {i + 1}</div>
                             <div className={`font-bold text-sm line-clamp-2 ${activeSlide === i ? 'text-purple-900' : 'text-gray-700'}`}>{s.title}</div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    </div>
  );

  const renderVideoPreview = () => (
      <div className="max-w-4xl mx-auto mt-10 text-center fade-in-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">视频生成完成！</h2>
          <div className="aspect-video bg-black rounded-3xl shadow-2xl overflow-hidden relative group border-4 border-gray-800">
              {/* Mock Video Player */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md mb-4 mx-auto group-hover:scale-110 transition-transform cursor-pointer border border-white/20 shadow-xl">
                          <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                      <p className="text-white/60 font-medium tracking-widest uppercase text-xs">Preview Mode</p>
                  </div>
              </div>
              
              {/* Fake Timeline */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800">
                  <div className="w-1/3 h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              </div>
          </div>
          
          <div className="mt-8 flex gap-4 justify-center">
              <Button variant="ghost" onClick={() => setStep('PPT_PREVIEW')}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> 返回编辑
              </Button>
              <Button className="px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 text-white">下载 MP4 视频</Button>
          </div>
      </div>
  );

  return (
    <div>
        <div className="absolute top-6 left-6 z-10">
            <Button variant="glass" onClick={onBack} className="pl-3 pr-4">
                <ArrowLeft className="w-5 h-5 mr-1" /> 返回首页
            </Button>
        </div>
        {step === 'INPUT' && renderInput()}
        {step === 'PPT_PREVIEW' && renderPPTPreview()}
        {step === 'VIDEO_PREVIEW' && renderVideoPreview()}
        {loading && (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center flex-col">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-slate-800">AI 正在创造中...</h3>
                <p className="text-slate-500 mt-2">正在整合知识点并生成视觉素材</p>
            </div>
        )}
    </div>
  );
};
