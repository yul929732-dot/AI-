
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Eraser, ArrowLeft, Search, History, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIAssistantProps {
  onBack?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '你好！我是你的 AI 助教。关于课程内容、作业或者任何学习上的困惑，随时可以问我。',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await geminiService.chat(history, userMsg.text);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "抱歉，我遇到了一些连接问题，请稍后再试。",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if(confirm("确定要清空所有对话历史吗？")) {
        setMessages([messages[0]]);
    }
  };

  // Extract user questions for the history sidebar
  const userQuestions = messages.filter(m => m.role === 'user');
  const filteredQuestions = userQuestions.filter(q => q.text.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleHistoryClick = (msgId: string) => {
      // Find the message element and scroll to it
      const element = document.getElementById(`msg-${msgId}`);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Optional: Highlight effect could be added here
          element.classList.add('bg-yellow-100');
          setTimeout(() => element.classList.remove('bg-yellow-100'), 2000);
      }
  };

  return (
    <div className="flex gap-6 h-[75vh] md:h-[80vh] fade-in-up">
      {/* LEFT SIDEBAR: History & Search */}
      <div className="w-80 flex-shrink-0 flex flex-col glass-panel rounded-[32px] overflow-hidden hidden md:flex">
         <div className="p-6 border-b border-white/40 bg-white/30 backdrop-blur-md">
             <h3 className="font-bold text-slate-700 mb-4 flex items-center">
                 <History className="w-5 h-5 mr-2 text-indigo-600"/> 提问记录
             </h3>
             {/* Search Input */}
             <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                 <input 
                    className="w-full pl-9 pr-3 py-2.5 bg-white/60 rounded-xl text-sm border border-transparent focus:border-indigo-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                    placeholder="搜索历史问题..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                 />
             </div>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3 bg-white/20">
             {filteredQuestions.length === 0 ? (
                 <div className="text-center text-slate-400 py-10 text-sm">
                     {searchQuery ? '未找到相关记录' : '暂无提问记录'}
                 </div>
             ) : (
                 filteredQuestions.map(q => (
                     <div 
                        key={q.id} 
                        onClick={() => handleHistoryClick(q.id)}
                        className="group p-3.5 rounded-2xl bg-white/40 border border-white/50 hover:bg-white hover:border-indigo-100 hover:shadow-md cursor-pointer transition-all duration-200"
                     >
                         <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0 group-hover:text-indigo-600" />
                            <p className="text-sm text-slate-600 font-medium line-clamp-2 leading-relaxed group-hover:text-slate-800">
                                {q.text}
                            </p>
                         </div>
                         <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <ChevronRight className="w-3 h-3 text-slate-300" />
                         </div>
                     </div>
                 ))
             )}
         </div>

         <div className="p-4 border-t border-white/40 bg-white/30 text-center">
             <span className="text-xs text-slate-400 font-medium">共 {userQuestions.length} 条提问</span>
         </div>
      </div>

      {/* RIGHT MAIN AREA: Chat Interface */}
      <div className="flex-1 flex flex-col glass-panel rounded-[32px] overflow-hidden relative shadow-xl">
          {/* Header */}
          <div className="p-5 border-b border-white/50 flex justify-between items-center bg-white/60 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center shadow-inner">
                      <Bot className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">AI 智能助教</h2>
                      <div className="flex items-center text-xs text-gray-500">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                          Gemini 2.5 Flash Online
                      </div>
                  </div>
              </div>
              
              <div className="flex gap-2">
                 <Button variant="ghost" size="sm" onClick={clearHistory} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl h-9 px-3">
                    <Eraser className="w-4 h-4 mr-1.5" /> 清空
                 </Button>
              </div>
          </div>

          {/* Messages Area */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-white/30 to-white/10">
              {messages.map((msg) => (
                <div
                  id={`msg-${msg.id}`}
                  key={msg.id}
                  className={`flex items-start gap-4 transition-colors duration-500 rounded-2xl p-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white ${
                    msg.role === 'user' ? 'bg-indigo-100' : 'bg-purple-100'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Bot className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm'
                        : 'bg-white text-slate-700 border border-white/60 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-4 p-2">
                   <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shadow-sm border-2 border-white">
                      <Bot className="w-5 h-5 text-purple-600" />
                   </div>
                   <div className="bg-white/80 px-6 py-4 rounded-2xl rounded-tl-sm border border-white/60 shadow-sm flex items-center gap-3">
                     <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                     <span className="text-sm text-slate-500 font-medium">正在思考与生成...</span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="p-5 bg-white/70 backdrop-blur-xl border-t border-white/60">
              <form onSubmit={handleSend} className="flex gap-3 relative max-w-4xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="请输入您的问题，例如：'解释一下量子纠缠'..."
                  className="flex-grow px-6 py-4 bg-white border border-indigo-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm text-sm placeholder-slate-400"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className={`px-6 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 flex-shrink-0 ${!input.trim() ? 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30'}`}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
          </div>
      </div>
    </div>
  );
};
