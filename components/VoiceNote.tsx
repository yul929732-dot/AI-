import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { geminiService } from '../services/geminiService';

interface VoiceNoteProps {
  onSaveNote: (text: string) => void;
}

export const VoiceNote: React.FC<VoiceNoteProps> = ({ onSaveNote }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleTranscription(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("无法访问麦克风，请检查权限。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const text = await geminiService.transcribeAudio(blob);
      if (text) {
        onSaveNote(text);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-2xl p-5 shadow-lg shadow-indigo-100/50 transition-all duration-300 hover:shadow-xl hover:border-indigo-200">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-60 -z-10 transform translate-x-10 -translate-y-10" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          AI 智能笔记
        </h3>
        <span className="text-[10px] font-semibold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase">
          Gemini 2.5 Flash
        </span>
      </div>
      
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        录制您对该视频的想法，让 AI 立即为您转录成文字。
      </p>

      <div className="flex gap-3">
        {!isRecording ? (
          <Button 
            onClick={startRecording} 
            disabled={isProcessing}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-indigo-50/50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 text-indigo-600" />
                <span className="text-indigo-600">正在转录...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-indigo-600" />
                <span className="text-gray-700">开始录音</span>
              </>
            )}
          </Button>
        ) : (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full pulse-ring"></div>
              <Button 
                onClick={stopRecording} 
                variant="danger"
                className="relative z-10 rounded-full w-12 h-12 flex items-center justify-center p-0"
              >
                <div className="w-4 h-4 bg-white rounded-sm" />
              </Button>
            </div>
            <span className="text-xs font-medium text-red-500 animate-pulse">正在录音中...</span>
          </div>
        )}
      </div>
    </div>
  );
};