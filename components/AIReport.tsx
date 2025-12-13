
import React, { useState, useEffect } from 'react';
import { FileText, Upload, Sparkles, BarChart2, CheckCircle, ArrowLeft, Loader2, Award, Save } from 'lucide-react';
import { Button } from './Button';
import { geminiService } from '../services/geminiService';
import { api } from '../services/api';
import { ReportAnalysis } from '../types';

interface AIReportProps {
  onBack: () => void;
}

export const AIReport: React.FC<AIReportProps> = ({ onBack }) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
     api.getSession().then(user => {
         if(user) setUserId(user.id);
     });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!fileContent) return;
    setLoading(true);
    try {
      const result = await geminiService.analyzeReport(fileContent);
      setAnalysis(result);
    } catch (e) {
      alert("分析失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
      if (!analysis || !userId) return;
      setSaving(true);
      try {
          await api.saveReport(userId, {
              fileName: fileName,
              analysis: analysis
          });
          alert("报告已保存至云端！");
      } catch(e) {
          alert("保存失败");
      } finally {
          setSaving(false);
      }
  };

  const renderScoreBar = (label: string, score: number, color: string) => (
      <div className="mb-4">
          <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-gray-600">{label}</span>
              <span className="text-gray-900">{score}/100</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${color}`} 
                style={{ width: `${score}%`, transition: 'width 1s ease-in-out' }}
              ></div>
          </div>
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="glass" size="sm" onClick={onBack} className="pl-3 pr-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回首页
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Award className="w-6 h-6 mr-2 text-blue-600" /> AI 智能作业报告
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Upload & Input */}
          <div className="glass-panel p-8 rounded-[32px] h-fit">
              <div className="border-3 border-dashed border-blue-100 rounded-3xl p-10 text-center bg-blue-50/30 hover:bg-blue-50/50 transition-all group">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">上传作业报告</h3>
                  <p className="text-sm text-gray-400 mb-6">支持 Markdown, TXT (暂不支持复杂 Word 格式解析)</p>
                  
                  <input type="file" id="report-upload" className="hidden" accept=".txt,.md" onChange={handleFileUpload} />
                  <label htmlFor="report-upload">
                      <Button variant="secondary" className="cursor-pointer" onClick={() => document.getElementById('report-upload')?.click()}>
                          选择文件
                      </Button>
                  </label>
                  {fileName && (
                      <div className="mt-4 flex items-center justify-center text-sm font-bold text-blue-600 bg-blue-100 py-2 px-4 rounded-lg">
                          <FileText className="w-4 h-4 mr-2" /> {fileName}
                      </div>
                  )}
              </div>

              <div className="mt-6">
                   <Button 
                     onClick={handleAnalyze} 
                     disabled={!fileContent || loading} 
                     className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-200"
                   >
                       {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                       {loading ? 'AI 正在深度分析...' : '开始智能评估'}
                   </Button>
              </div>
          </div>

          {/* Right: Analysis Result */}
          <div className="space-y-6">
              {analysis ? (
                  <>
                    <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center"><BarChart2 className="w-5 h-5 mr-2" /> 评分详情</h3>
                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{analysis.overallScore} <span className="text-sm text-gray-400 font-medium">/ 100</span></span>
                        </div>
                        {renderScoreBar("主题相关性", analysis.scores.relevance, "bg-green-500")}
                        {renderScoreBar("逻辑结构完整性", analysis.scores.logic, "bg-blue-500")}
                        {renderScoreBar("知识点覆盖率", analysis.scores.coverage, "bg-purple-500")}
                        {renderScoreBar("语言规范性", analysis.scores.style, "bg-orange-500")}
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                             <Button onClick={handleSaveReport} disabled={saving} className="w-full bg-slate-800 hover:bg-slate-900 text-white">
                                 {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2" />}
                                 {saving ? '正在保存...' : '保存报告到云端'}
                             </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-right-4 delay-100">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-yellow-500" /> 优化建议</h3>
                        <ul className="space-y-3">
                            {analysis.suggestions.map((s, i) => (
                                <li key={i} className="flex items-start text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                  </>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white/40 rounded-[32px] border-2 border-dashed border-gray-200">
                      <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                      <p>上传文件并点击分析以查看 AI 报告</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
