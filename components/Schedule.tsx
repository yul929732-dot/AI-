
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, Calendar, Upload } from 'lucide-react';
import { Button } from './Button';
import { ScheduleItem } from '../types';
import { api } from '../services/api';

interface ScheduleProps {
  userId: string;
  isEditable: boolean;
}

const DAYS = ['周一', '周二', '周三', '周四', '周五'];
const TIME_SLOTS = [
  '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
  '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
];

export const Schedule: React.FC<ScheduleProps> = ({ userId, isEditable }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<{day: string, time: string} | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSchedule();
  }, [userId]);

  const loadSchedule = async () => {
    setLoading(true);
    const data = await api.getSchedule(userId);
    setSchedule(data);
    setLoading(false);
  };

  const handleSaveItem = async () => {
    if (!editingSlot || !newItemText.trim()) {
      setEditingSlot(null);
      return;
    }

    const newItem: ScheduleItem = {
      id: Math.random().toString(36),
      day: editingSlot.day,
      timeSlot: editingSlot.time,
      courseName: newItemText
    };

    // Remove existing item in this slot if any
    const filtered = schedule.filter(s => !(s.day === editingSlot.day && s.timeSlot === editingSlot.time));
    const newSchedule = [...filtered, newItem];
    
    setSchedule(newSchedule);
    await api.saveSchedule(userId, newSchedule);
    setEditingSlot(null);
    setNewItemText('');
  };

  const handleDeleteItem = async (day: string, time: string) => {
    const newSchedule = schedule.filter(s => !(s.day === day && s.timeSlot === time));
    setSchedule(newSchedule);
    await api.saveSchedule(userId, newSchedule);
  };

  // Mock parsing of Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          const file = e.target.files[0];
          // In a real app, use 'xlsx' library to parse. Here we mock a successful import.
          if (confirm(`是否确认从 ${file.name} 导入课程表？这将覆盖当前课表。`)) {
             setLoading(true);
             setTimeout(() => {
                 // Generate a random schedule
                 const mockSchedule: ScheduleItem[] = [];
                 DAYS.forEach(day => {
                     TIME_SLOTS.forEach(time => {
                         if (Math.random() > 0.6) {
                             mockSchedule.push({
                                 id: Math.random().toString(),
                                 day,
                                 timeSlot: time,
                                 courseName: ['高等数学', '大学物理', '英语视听说', '计算机基础'][Math.floor(Math.random()*4)]
                             });
                         }
                     });
                 });
                 setSchedule(mockSchedule);
                 api.saveSchedule(userId, mockSchedule);
                 setLoading(false);
                 alert("导入成功！");
             }, 1000);
          }
      }
  };

  const getItem = (day: string, time: string) => schedule.find(s => s.day === day && s.timeSlot === time);

  if (loading) return <div className="p-10 text-center text-slate-400">加载课程表中...</div>;

  return (
    <div className="glass-panel p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          我的课程表
        </h3>
        <div className="flex items-center gap-2">
            {isEditable && (
                <>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center hover:bg-indigo-100 transition-colors"
                >
                    <Upload className="w-3 h-3 mr-2" /> 导入 Excel
                </button>
                <input 
                    type="file" 
                    accept=".xlsx,.xls" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleImportExcel} 
                />
                </>
            )}
            <span className="text-xs text-slate-400 bg-white/50 px-2 py-1 rounded-lg">点击空白添加，点击卡片删除</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[600px] grid grid-cols-6 gap-3">
          {/* Header */}
          <div className="p-2 font-bold text-slate-400 text-xs text-center bg-white/40 rounded-xl flex items-center justify-center">时间</div>
          {DAYS.map(day => (
            <div key={day} className="p-2 font-bold text-indigo-900 text-sm text-center bg-indigo-50/50 border border-indigo-100/50 rounded-xl">
              {day}
            </div>
          ))}

          {/* Rows */}
          {TIME_SLOTS.map(time => (
            <React.Fragment key={time}>
              <div className="p-2 text-[10px] font-medium text-slate-500 flex items-center justify-center bg-white/40 rounded-xl">
                {time}
              </div>
              {DAYS.map(day => {
                const item = getItem(day, time);
                const isEditing = editingSlot?.day === day && editingSlot?.time === time;

                return (
                  <div 
                    key={`${day}-${time}`}
                    onClick={() => isEditable && !item && !isEditing && setEditingSlot({ day, time })}
                    className={`
                      relative p-2 min-h-[64px] rounded-xl border transition-all duration-300 flex flex-col justify-center items-center text-center group
                      ${item 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-200' 
                        : 'bg-white/40 border-white/50 hover:border-indigo-200 hover:bg-white/80 cursor-pointer'}
                    `}
                  >
                    {isEditing ? (
                      <div className="w-full h-full flex flex-col gap-1 z-10" onClick={(e) => e.stopPropagation()}>
                        <input 
                          autoFocus
                          className="w-full text-xs p-1 rounded text-slate-900 outline-none border border-indigo-300 bg-white/90"
                          placeholder="课程名称"
                          value={newItemText}
                          onChange={e => setNewItemText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSaveItem()}
                        />
                        <div className="flex gap-1 justify-center">
                          <button onClick={handleSaveItem} className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded shadow-sm">确定</button>
                          <button onClick={() => setEditingSlot(null)} className="text-[10px] bg-slate-400 text-white px-2 py-0.5 rounded shadow-sm">取消</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {item ? (
                          <>
                            <span className="font-bold text-xs leading-tight tracking-wide">{item.courseName}</span>
                            {isEditable && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteItem(day, time); }}
                                className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 shadow-sm transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        ) : (
                          <Plus className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
