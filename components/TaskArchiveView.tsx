
import React, { useState } from 'react';
import { Task, Note } from '../types';

interface TaskArchiveViewProps {
  tasks: Task[];
  notes: Note[];
  onUpdateTasks: (ts: Task[]) => void;
  onUpdateNotes: (ns: Note[]) => void;
  onBack: () => void;
}

const TaskArchiveView: React.FC<TaskArchiveViewProps> = ({ tasks, notes, onUpdateTasks, onUpdateNotes, onBack }) => {
  const [taskInput, setTaskInput] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [activePane, setActivePane] = useState<'tasks' | 'notes'>('tasks');

  const addTask = () => {
    if (!taskInput.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskInput,
      completed: false,
      priority: 'med',
      timestamp: Date.now()
    };
    onUpdateTasks([newTask, ...tasks]);
    setTaskInput('');
  };

  const toggleTask = (id: string) => {
    onUpdateTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addNote = () => {
    if (!noteTitle.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      title: noteTitle,
      content: noteContent,
      timestamp: Date.now()
    };
    onUpdateNotes([newNote, ...notes]);
    setNoteTitle('');
    setNoteContent('');
  };

  return (
    <div className="h-full bg-black flex flex-col animate-in fade-in duration-700">
      <header className="px-10 py-10 border-b border-white/5 flex justify-between items-center bg-black">
        <div className="flex items-center gap-8">
           <button onClick={onBack} className="p-2 text-neutral-800 hover:text-white transition-all">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
           </button>
           <div className="space-y-1">
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Archive Ledger</h2>
             <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-blue-500 font-black">Operational Record Node</p>
           </div>
        </div>
        <div className="flex gap-2 bg-white/[0.03] p-1 rounded-full border border-white/5">
           <button onClick={() => setActivePane('tasks')} className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activePane === 'tasks' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:text-white'}`}>Tasks</button>
           <button onClick={() => setActivePane('notes')} className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activePane === 'notes' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:text-white'}`}>Notes</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar pb-32 max-w-5xl mx-auto w-full">
        {activePane === 'tasks' && (
          <div className="space-y-8 animate-in slide-in-from-left duration-500">
            <div className="flex gap-4 p-2 bg-white/[0.02] border border-white/5 rounded-3xl group focus-within:border-blue-500/30 transition-all">
               <input 
                 type="text" 
                 value={taskInput}
                 onChange={e => setTaskInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && addTask()}
                 placeholder="Command a new task into registry..."
                 className="flex-1 bg-transparent border-none focus:ring-0 text-white font-mono p-4"
               />
               <button onClick={addTask} className="px-8 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-blue-500 transition-all">Register</button>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-800 px-4">Ledger Entries</p>
              {tasks.length === 0 ? (
                <div className="py-32 text-center opacity-10">
                  <p className="font-mono text-sm uppercase tracking-[0.5em]">No operations pending.</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="card-refined p-6 flex items-center justify-between group border-l-2 border-l-transparent hover:border-l-blue-600">
                    <div className="flex items-center gap-6">
                       <button 
                         onClick={() => toggleTask(task.id)}
                         className={`w-6 h-6 rounded border transition-all flex items-center justify-center ${task.completed ? 'bg-blue-600 border-blue-600' : 'border-white/10'}`}
                       >
                         {task.completed && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                       </button>
                       <p className={`font-mono text-sm uppercase tracking-tight transition-all ${task.completed ? 'text-neutral-700 line-through' : 'text-white'}`}>{task.title}</p>
                    </div>
                    <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-all">
                       <span className="text-[9px] font-mono text-neutral-800 uppercase">{new Date(task.timestamp).toLocaleTimeString()}</span>
                       <button onClick={() => onUpdateTasks(tasks.filter(t => t.id !== task.id))} className="text-rose-900 hover:text-rose-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activePane === 'notes' && (
          <div className="space-y-12 animate-in slide-in-from-right duration-500">
             <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8">
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-800">New Operational Note</p>
               <input 
                 type="text" 
                 value={noteTitle}
                 onChange={e => setNoteTitle(e.target.value)}
                 placeholder="Subject Title"
                 className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-black uppercase tracking-widest text-sm focus:border-blue-500/30"
               />
               <textarea 
                 value={noteContent}
                 onChange={e => setNoteContent(e.target.value)}
                 placeholder="Detailed specifications..."
                 className="w-full h-48 bg-black/40 border border-white/5 rounded-3xl p-6 text-neutral-300 font-mono text-sm focus:border-blue-500/30 transition-all resize-none"
               />
               <button 
                 onClick={addNote}
                 disabled={!noteTitle.trim()}
                 className="w-full py-6 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-5"
               >
                 Archive Note
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map(note => (
                  <div key={note.id} className="card-refined p-8 space-y-4 group">
                    <header className="flex justify-between items-start">
                       <h3 className="text-sm font-black text-white uppercase tracking-widest">{note.title}</h3>
                       <button onClick={() => onUpdateNotes(notes.filter(n => n.id !== note.id))} className="text-neutral-800 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
                    </header>
                    <p className="text-[11px] font-mono text-neutral-600 leading-relaxed line-clamp-4">{note.content}</p>
                    <p className="text-[8px] font-mono text-neutral-800 uppercase tracking-widest">{new Date(note.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskArchiveView;
