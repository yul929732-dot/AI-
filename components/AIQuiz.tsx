
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowLeft, CheckCircle2, XCircle, BrainCircuit, ChevronRight, HelpCircle, FileText, Upload, Clock, Settings2, PlayCircle } from 'lucide-react';
import { Button } from './Button';
import { geminiService } from '../services/geminiService';
import { QuizData, QuizQuestion, QuizConfig } from '../types';

interface AIQuizProps {
  onBack: () => void;
  onMistake?: (question: QuizQuestion, wrongAnswer: string | number, topic: string) => void;
}

type QuizState = 'CONFIG' | 'LOADING' | 'TAKING' | 'RESULT';

export const AIQuiz: React.FC<AIQuizProps> = ({ onBack, onMistake }) => {
  const [state, setState] = useState<QuizState>('CONFIG');
  
  // Configuration
  const [config, setConfig] = useState<QuizConfig>({
    topic: '',
    questionType: 'multiple_choice',
    questionCount: 5,
    timeLimit: 10 // minutes
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  
  // Quiz Taking State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [subjectiveAnswer, setSubjectiveAnswer] = useState('');
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef<number | null>(null);

  // --- Effects ---
  useEffect(() => {
    if (state === 'TAKING' && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
             if (timerRef.current) clearInterval(timerRef.current);
             handleSubmitQuizEarly(); // Force submit logic
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  const handleSubmitQuizEarly = () => {
     alert("时间到！测验结束。");
     setState('RESULT');
  };

  // --- Handlers ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setConfig(prev => ({ ...prev, fileContent: content, topic: `文件：${file.name}` }));
      };
      reader.readAsText(file); 
    }
  };

  const handleGenerate = async () => {
    if (!config.topic.trim() && !config.fileContent) {
        alert("请输入主题或上传文件");
        return;
    }
    setState('LOADING');
    try {
      const data = await geminiService.generateQuiz(config);
      setQuizData(data);
      setCurrentQuestionIndex(0);
      setScore(0);
      setTimeLeft(config.timeLimit * 60);
      setState('TAKING');
    } catch (error) {
      alert("生成失败，请重试");
      setState('CONFIG');
    }
  };

  const handleNext = () => {
    if (!quizData) return;
    
    setSelectedOption(null);
    setSubjectiveAnswer('');
    setIsAnswerRevealed(false);

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setState('RESULT');
    }
  };

  const checkAnswer = () => {
    if (!quizData) return;
    setIsAnswerRevealed(true);
    const currentQ = quizData.questions[currentQuestionIndex];
    
    let isCorrect = false;
    let wrongAns: string | number = '';

    if (currentQ.type === 'multiple_choice') {
      isCorrect = selectedOption === currentQ.correctAnswer;
      wrongAns = selectedOption !== null ? currentQ.options![selectedOption] : '未选择';
    } else {
       isCorrect = true; 
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      if (currentQ.type === 'multiple_choice' && onMistake) {
         onMistake(currentQ, wrongAns, config.topic);
      }
    }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Renderers ---

  const renderConfig = () => (
    <div className="max-w-4xl mx-auto fade-in-up">
      <div className="flex items-center justify-between mb-6">
         <Button variant="glass" size="sm" onClick={onBack} className="pl-3 pr-4">
            <ArrowLeft className="w-5 h-5 mr-1" /> 返回首页
         </Button>
      </div>

      <div className="glass-panel rounded-[32px] p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/40">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-gray-900">AI 智能出题配置</h2>
               <p className="text-sm text-gray-500 font-medium">配置参数，让 Gemini 为您生成专属试卷</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left: Input Source */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-emerald-600"/> 出题来源
                    </label>
                    <div className="relative">
                        <textarea
                            value={config.topic}
                            onChange={(e) => setConfig(prev => ({...prev, topic: e.target.value, fileContent: undefined}))}
                            placeholder="在此输入知识点、课程主题，或粘贴复习资料文本..."
                            className="w-full h-48 p-5 bg-white/60 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none transition-all shadow-inner text-sm leading-relaxed"
                        />
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-xs text-gray-400 font-bold uppercase">或</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>
                    <div className="mt-4 flex gap-3">
                        <input 
                           type="file" 
                           ref={fileInputRef} 
                           className="hidden" 
                           accept=".txt,.md,.json,.csv" 
                           onChange={handleFileUpload}
                        />
                        <button 
                           onClick={() => fileInputRef.current?.click()}
                           className="flex-1 flex items-center justify-center py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-all shadow-sm group"
                        >
                           <Upload className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> 
                           上传文档 (TXT/MD)
                        </button>
                    </div>
                    {config.fileContent && (
                         <div className="mt-2 text-center animate-in fade-in slide-in-from-bottom-2">
                             <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 shadow-sm">
                                <CheckCircle2 className="w-3 h-3 mr-1.5"/> 文件已加载
                             </span>
                         </div>
                    )}
                </div>
            </div>

            {/* Right: Settings */}
            <div className="space-y-6 bg-white/40 p-6 rounded-3xl border border-white/50 backdrop-blur-sm">
                <h3 className="flex items-center font-bold text-gray-800 mb-2">
                    <Settings2 className="w-4 h-4 mr-2 text-gray-500" /> 考试参数设置
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">题目类型</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                {id: 'all', label: '混合'},
                                {id: 'multiple_choice', label: '单选'},
                                {id: 'subjective', label: '简答'}
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setConfig(prev => ({...prev, questionType: opt.id as any}))}
                                    className={`py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm ${config.questionType === opt.id ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">题目数量</label>
                        <div className="relative">
                            <select 
                                value={config.questionCount}
                                onChange={(e) => setConfig(prev => ({...prev, questionCount: Number(e.target.value)}))}
                                className="w-full p-3 pl-4 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                            >
                                <option value={3}>3 题 (快速测验)</option>
                                <option value={5}>5 题 (标准练习)</option>
                                <option value={10}>10 题 (深度巩固)</option>
                                <option value={20}>20 题 (模拟考试)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">限时 (分钟)</label>
                        <div className="relative">
                            <select 
                                value={config.timeLimit}
                                onChange={(e) => setConfig(prev => ({...prev, timeLimit: Number(e.target.value)}))}
                                className="w-full p-3 pl-4 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                            >
                                <option value={5}>5 分钟</option>
                                <option value={10}>10 分钟</option>
                                <option value={30}>30 分钟</option>
                                <option value={60}>60 分钟</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                        </div>
                    </div>
                </div>
                
                <div className="pt-4 mt-auto">
                    <Button 
                        onClick={handleGenerate} 
                        className="w-full py-4 text-base rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        立即生成试卷
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] fade-in-up">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 border-8 border-gray-200/30 rounded-full"></div>
        <div className="absolute inset-0 border-8 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <BrainCircuit className="text-emerald-500 w-12 h-12 animate-pulse" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">AI 正在构建考题...</h3>
      <p className="text-gray-500 text-center max-w-md leading-relaxed">
          正在分析知识图谱，为您生成个性化题目。<br/>这可能需要几秒钟时间，请稍候。
      </p>
    </div>
  );

  const renderQuestionCard = () => {
    if (!quizData) return null;
    const q = quizData.questions[currentQuestionIndex];
    const isLast = currentQuestionIndex === quizData.questions.length - 1;

    return (
      <div className="max-w-4xl mx-auto mt-4 fade-in-up pb-20">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6 px-2">
           <Button variant="glass" size="sm" onClick={onBack} className="pl-3 pr-4">
             <ArrowLeft className="w-4 h-4 mr-1" /> 退出测试
           </Button>
           
           <div className="flex items-center gap-4">
               <div className={`px-4 py-2 rounded-xl shadow-sm text-sm font-bold border flex items-center backdrop-blur-md transition-colors ${timeLeft < 60 ? 'bg-red-50/90 text-red-600 border-red-200 animate-pulse' : 'bg-white/80 text-slate-700 border-white/60'}`}>
                   <Clock className="w-4 h-4 mr-2" />
                   {formatTime(timeLeft)}
               </div>
               <span className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-emerald-700 border border-white/60">
                 {currentQuestionIndex + 1} <span className="text-gray-400 mx-1">/</span> {quizData.questions.length}
               </span>
           </div>
        </div>

        {/* Main Card */}
        <div className="glass-panel rounded-[32px] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row">
          
          {/* Question Side */}
          <div className="p-8 md:p-10 flex-1 bg-white/40 backdrop-blur-xl">
             <div className="inline-block px-3 py-1 bg-emerald-100/80 text-emerald-800 text-xs font-bold rounded-lg uppercase tracking-wide mb-6">
                  {q.type === 'multiple_choice' ? '单选题' : '简答题'}
             </div>
             <h3 className="text-2xl font-bold text-gray-800 leading-relaxed mb-8">{q.question}</h3>
             
             {/* Subjective Input */}
             {q.type !== 'multiple_choice' && (
                <textarea
                  value={subjectiveAnswer}
                  onChange={(e) => setSubjectiveAnswer(e.target.value)}
                  placeholder="请输入您的答案..."
                  disabled={isAnswerRevealed}
                  className="w-full h-64 p-5 bg-white/60 border border-white/60 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none resize-none text-base shadow-inner text-gray-700"
                />
             )}
          </div>

          {/* Options/Action Side */}
          <div className="p-8 md:p-10 md:w-[45%] bg-white/60 backdrop-blur-xl border-l border-white/50 flex flex-col">
            {q.type === 'multiple_choice' ? (
              <div className="space-y-3 flex-1">
                {q.options?.map((opt, idx) => {
                  let btnClass = "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-start group relative overflow-hidden ";
                  
                  if (isAnswerRevealed) {
                    if (idx === q.correctAnswer) btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md";
                    else if (idx === selectedOption && idx !== q.correctAnswer) btnClass += "border-red-500 bg-red-50 text-red-900";
                    else btnClass += "border-gray-200 bg-white/50 opacity-50";
                  } else {
                    if (selectedOption === idx) btnClass += "border-emerald-500 bg-white shadow-md ring-2 ring-emerald-100";
                    else btnClass += "border-gray-200 bg-white/50 hover:bg-white hover:border-emerald-300 hover:shadow-sm";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !isAnswerRevealed && setSelectedOption(idx)}
                      disabled={isAnswerRevealed}
                      className={btnClass}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 font-bold text-xs flex-shrink-0 transition-colors mt-0.5 ${
                          selectedOption === idx || (isAnswerRevealed && idx === q.correctAnswer) ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="font-medium text-sm leading-snug">{opt}</span>
                      
                      {isAnswerRevealed && idx === q.correctAnswer && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />}
                      {isAnswerRevealed && idx === selectedOption && idx !== q.correctAnswer && <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />}
                    </button>
                  );
                })}
              </div>
            ) : <div className="flex-1"></div>}

            {/* Footer Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200/50">
               {!isAnswerRevealed ? (
                 <Button 
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-4 text-lg shadow-lg shadow-emerald-200 rounded-2xl" 
                    onClick={checkAnswer}
                    disabled={q.type === 'multiple_choice' ? selectedOption === null : !subjectiveAnswer.trim()}
                 >
                   提交答案
                 </Button>
               ) : (
                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 mb-4">
                     <h4 className="flex items-center text-indigo-900 font-bold mb-1 text-sm">
                       <HelpCircle className="w-4 h-4 mr-2" />
                       名师解析
                     </h4>
                     <p className="text-indigo-800 text-xs leading-relaxed">{q.explanation}</p>
                   </div>
                   <Button 
                      className="w-full py-4 text-lg rounded-2xl shadow-lg" 
                      onClick={handleNext}
                   >
                     {isLast ? '查看成绩单' : '下一题'} <ChevronRight className="w-5 h-5 ml-1" />
                   </Button>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => (
    <div className="max-w-md mx-auto mt-16 text-center fade-in-up">
      <div className="glass-panel rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
        {/* Confetti Background Effect (simplified via CSS/Shapes) */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle,theme(colors.emerald.400)_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-200 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
          <PlayCircle className="w-12 h-12 text-emerald-700" />
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 mb-2 relative z-10">测验完成！</h2>
        
        <div className="py-8 my-6 bg-white/50 rounded-3xl border border-white/60 backdrop-blur-sm relative z-10">
            <p className="text-gray-500 mb-2 text-xs uppercase font-bold tracking-widest">客观题得分</p>
            <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 filter drop-shadow-sm">{score}</span>
                <span className="text-gray-400 font-bold text-xl">/ {quizData?.questions.filter(q => q.type === 'multiple_choice').length}</span>
            </div>
        </div>
        
        <p className="text-xs text-gray-500 mb-8 px-6 leading-relaxed relative z-10">
           主观题已通过 AI 解析展示，请参考解析进行自我评估。<br/>错题已自动加入您的智能错题本。
        </p>
        
        <div className="space-y-3 relative z-10">
          <Button onClick={() => setState('CONFIG')} className="w-full bg-emerald-600 hover:bg-emerald-700 py-4 rounded-2xl shadow-xl shadow-emerald-200/50 text-base">
             再来一套
          </Button>
          <Button variant="ghost" onClick={onBack} className="w-full py-4 rounded-2xl text-gray-500 hover:text-gray-800 hover:bg-white/50">
             返回首页
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full">
      {state === 'CONFIG' && renderConfig()}
      {state === 'LOADING' && renderLoading()}
      {state === 'TAKING' && renderQuestionCard()}
      {state === 'RESULT' && renderResult()}
    </div>
  );
};
