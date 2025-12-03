import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, FileText, Loader2, Sparkles } from 'lucide-react';
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
      alert("Could not access microphone. Please check permissions.");
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
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          AI Smart Notes
        </h3>
        <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
          Gemini 2.5 Flash
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Record your thoughts about this video and let AI transcribe them instantly.
      </p>

      <div className="flex gap-3">
        {!isRecording ? (
          <Button 
            onClick={startRecording} 
            disabled={isProcessing}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                Transcribing...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-indigo-600" />
                Start Recording
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={stopRecording} 
            variant="danger"
            className="w-full flex items-center justify-center gap-2 animate-pulse"
          >
            <MicOff className="w-4 h-4" />
            Stop Recording
          </Button>
        )}
      </div>
    </div>
  );
};
