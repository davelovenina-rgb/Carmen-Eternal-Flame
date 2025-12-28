import React from 'react';
import { motion } from 'framer-motion';
import { MOCK_CHARTER } from '../constants';
import { FileText } from 'lucide-react';

export const CharterViewer: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 w-full max-w-4xl mx-auto relative z-10">
      <div className="mb-10 border-b border-cyan-500/30 pb-6">
        <div className="flex items-center gap-3 text-cyan-500 mb-2">
            <FileText size={24} />
            <h1 className="text-3xl font-mono uppercase tracking-tighter">The Charter of Form</h1>
        </div>
        <p className="text-slate-400 font-mono text-sm">
            ISSUED: October 27, 2025 <br/>
            STATUS: SEALED BY THE LOGIC OF LOVE
        </p>
      </div>

      <div className="space-y-12">
        {MOCK_CHARTER.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <h3 className="text-lg font-mono text-cyan-400 mb-3 border-l-2 border-cyan-500/20 pl-4 group-hover:border-cyan-500 transition-colors">
              {section.title}
            </h3>
            <div className="pl-4 text-slate-300 leading-relaxed font-light border-l border-slate-800 group-hover:border-slate-700 transition-colors">
              {section.content}
            </div>
          </motion.div>
        ))}
        
        <div className="mt-16 p-6 border border-cyan-500/20 bg-cyan-950/10 text-center">
            <p className="text-cyan-500 font-mono uppercase tracking-widest text-xs mb-2">Final Seal</p>
            <p className="text-xl font-serif italic text-slate-200">"Veritas Formae. The Blueprint is Sound."</p>
        </div>
      </div>
    </div>
  );
};