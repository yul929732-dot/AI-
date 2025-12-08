
import React, { useState } from 'react';
import { Sparkles, ArrowLeft, CheckCircle2, XCircle, BrainCircuit, ChevronRight, HelpCircle, FileText } from 'lucide-react';
import { Button } from './Button';
import { geminiService } from '../services/geminiService';
import { QuizData, QuizQuestion } from '../types';

interface AIQuizProps {
  onBack: () => void;
  onMistake?: (question: QuizQuestion, wrongAnswer: string | number, topic: string) => void;
}

type QuizState = 'CONFIG' | 'LOADING' | 'TAKING' | 'RESULT';

export const AIQuiz: React.FC<AIQuizProps> = ({ onBack, onMistake }) => {
  const [state, setState] = useState<QuizState>('CONFIG');
  const [topic, setTopic] = useState('');
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  
  // Quiz Taking State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [subjectiveAnswer, setSubjectiveAnswer] = useState('');
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false); // For current question
  const [score, setScore] = useState(0);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setState('LOADING');
    try {
      const data = await geminiService.generateQuiz(topic);
      setQuizData(data);
      setCurrentQuestionIndex(0);
      setScore(0);
      setState('TAKING');
    } catch (error) {
      alert("生成失败，请重试");
      setState('CONFIG');
    }
  };

  const handleNext = () => {
    if (!quizData) return;
    
    // Reset state for next question
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
    
    // Check correctness
    let isCorrect = false;
    let wrongAns: string | number = '';

    if (currentQ.type === 'multiple_choice') {
      isCorrect = selectedOption === currentQ.correctAnswer;
      wrongAns = selectedOption !== null ? currentQ.options![selectedOption] : '未选择';
    } else {
       // For subjective, we assume it needs self-check, but here we just mark as reviewed. 
       // To automate mistake recording for subjective, we might assume if text is too short it's wrong, 
       // but strictly "mistake book" usually applies best to auto-graded or user-marked.
       // Here we won't auto-add subjective to mistake book unless we add a "Mark as Wrong" button.
       // Let's stick to MC logic for auto-adding.
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      // It's a mistake (only for MC for now)
      if (currentQ.type === 'multiple_choice' && onMistake) {
         onMistake(currentQ, wrongAns, topic);
      }
    }
  };

  // --- Render Functions ---

  const renderConfig = () => (
    <div className="max-w-2xl mx-auto mt-10 fade-in-up">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BrainCircuit className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 智能出题系统</h2>
        <p className="text-gray-500 mb-8">输入您想复习的知识点、文本段落或主题，AI 将为您生成专属测试题。</p>
        
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例如：请根据'二战历史'出题，或者直接粘贴一段课文内容..."
          className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
        />
        
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onBack} className="flex-1">
            返回
          </Button>
          <Button onClick={handleGenerate} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
            <Sparkles className="w-4 h-4 mr-2" />
            开始生成
          </Button>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] fade-in-up">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
        <BrainCircuit className="absolute inset-0 m-auto text-emerald-600 w-8 h-8 animate-pulse" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">正在分析知识点...</h3>
      <p className="text-gray-500">AI 老师正在为您精心编制考题</p>
    </div>
  );

  const renderQuestionCard = () => {
    if (!quizData) return null;
    const q = quizData.questions[currentQuestionIndex];
    const isLast = currentQuestionIndex === quizData.questions.length - 1;

    return (
      <div className="max-w-3xl mx-auto mt-6 fade-in-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6">
           <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-500">
             <ArrowLeft className="w-4 h-4 mr-1" /> 退出
           </Button>
           <span className="bg-white px-4 py-1.5 rounded-full shadow-sm text-sm font-bold text-emerald-700 border border-emerald-100">
             {currentQuestionIndex + 1} / {quizData.questions.length}
           </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Question Text */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
             <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md mb-3">
               {q.type === 'multiple_choice' ? '单选题' : '简答题'}
             </div>
             <h3 className="text-xl font-bold text-gray-900 leading-relaxed">{q.question}</h3>
          </div>

          {/* Options / Input */}
          <div className="p-8">
            {q.type === 'multiple_choice' ? (
              <div className="space-y-3">
                {q.options?.map((opt, idx) => {
                  let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex justify-between items-center group ";
                  
                  if (isAnswerRevealed) {
                    if (idx === q.correctAnswer) btnClass += "border-green-500 bg-green-50 text-green-900";
                    else if (idx === selectedOption && idx !== q.correctAnswer) btnClass += "border-red-500 bg-red-50 text-red-900";
                    else btnClass += "border-gray-100 bg-gray-50 opacity-60";
                  } else {
                    if (selectedOption === idx) btnClass += "border-emerald-500 bg-emerald-50 shadow-md ring-1 ring-emerald-500";
                    else btnClass += "border-gray-100 hover:border-emerald-200 hover:bg-gray-50";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !isAnswerRevealed && setSelectedOption(idx)}
                      disabled={isAnswerRevealed}
                      className={btnClass}
                    >
                      <div className="flex items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold text-sm ${
                          selectedOption === idx || (isAnswerRevealed && idx === q.correctAnswer) ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                      </div>
                      {isAnswerRevealed && idx === q.correctAnswer && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {isAnswerRevealed && idx === selectedOption && idx !== q.correctAnswer && <XCircle className="w-5 h-5 text-red-600" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Subjective
              <div>
                <textarea
                  value={subjectiveAnswer}
                  onChange={(e) => setSubjectiveAnswer(e.target.value)}
                  placeholder="请输入您的答案..."
                  disabled={isAnswerRevealed}
                  className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
            )}

            {/* Actions & Explanation */}
            <div className="mt-8 pt-6 border-t border-gray-100">
               {!isAnswerRevealed ? (
                 <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 text-lg" 
                    onClick={checkAnswer}
                    disabled={q.type === 'multiple_choice' ? selectedOption === null : !subjectiveAnswer.trim()}
                 >
                   提交答案
                 </Button>
               ) : (
                 <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
                     <h4 className="flex items-center text-blue-800 font-bold mb-2">
                       <HelpCircle className="w-5 h-5 mr-2" />
                       解析
                     </h4>
                     <p className="text-blue-700 text-sm leading-relaxed">{q.explanation}</p>
                   </div>
                   <Button 
                      className="w-full" 
                      onClick={handleNext}
                   >
                     {isLast ? '查看成绩' : '下一题'} <ChevronRight className="w-4 h-4 ml-1" />
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
    <div className="max-w-md mx-auto mt-20 text-center fade-in-up">
      <div className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-100">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">测验完成！</h2>
        <p className="text-gray-500 mb-8">
            客观题得分：<span className="text-emerald-600 font-bold text-2xl ml-1">{score}</span> / {quizData?.questions.filter(q => q.type === 'multiple_choice').length}
        </p>
        <p className="text-sm text-gray-400 mb-8 px-4">
           主观题已通过 AI 解析展示，请参考解析自我评估。错题已自动加入您的错题本。
        </p>
        <div className="space-y-3">
          <Button onClick={() => setState('CONFIG')} className="w-full bg-emerald-600 hover:bg-emerald-700">
             再来一套
          </Button>
          <Button variant="outline" onClick={onBack} className="w-full">
             返回首页
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {state === 'CONFIG' && renderConfig()}
      {state === 'LOADING' && renderLoading()}
      {state === 'TAKING' && renderQuestionCard()}
      {state === 'RESULT' && renderResult()}
    </div>
  );
};
