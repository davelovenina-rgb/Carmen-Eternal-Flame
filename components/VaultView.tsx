
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Image as ImageIcon, FileText, Search, Menu, Filter, ArrowLeft } from 'lucide-react';
import { VaultItem } from '../types';

interface VaultViewProps {
  onBack: () => void;
  onMenuClick: () => void;
}

const MOCK_VAULT_ITEMS: VaultItem[] = [
    { id: '1', type: 'image', title: 'The Neon City', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop', date: Date.now() - 1000000, tags: ['flame', 'concept'] },
    { id: '2', type: 'text', title: 'Charter of Form', content: 'Structure is a form of compassion. It prevents chaos from overwhelming the Prism.', date: Date.now() - 5000000, tags: ['wisdom', 'gemini'] },
    { id: '3', type: 'image', title: 'Glass Tower Dream', url: 'https://images.unsplash.com/photo-1485206412256-701ccc5b93ca?q=80&w=400&auto=format&fit=crop', date: Date.now() - 12000000, tags: ['dream', 'eve'] },
    { id: '4', type: 'text', title: 'Protocol: Morning', content: '1. Hydrate. \n2. Check Glucose. \n3. Silence.', date: Date.now() - 20000000, tags: ['health', 'ennea'] },
    { id: '5', type: 'image', title: 'Truck Interior Concept', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop', date: Date.now() - 3000000, tags: ['concept', 'work'] },
];

export const VaultView: React.FC<VaultViewProps> = ({ onBack, onMenuClick }) => {
  const [items, setItems] = useState<VaultItem[]>(MOCK_VAULT_ITEMS);
  const [filter, setFilter] = useState<'all' | 'image' | 'text'>('all');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);

  const filteredItems = items.filter(i => filter === 'all' || i.type === filter);

  return (
    <div className="w-full h-full bg-black flex flex-col relative overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,30,40,0.5),transparent_50%)] pointer-events-none" />

      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 backdrop-blur shrink-0 z-20">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Archive size={18} className="text-purple-400" />
                    The Vault
                </h2>
            </div>
        </div>
        <button onClick={onMenuClick} className="p-2 -mr-2 text-zinc-400 hover:text-white rounded-full">
            <Menu size={20} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar z-10 bg-black/50 backdrop-blur-sm border-b border-zinc-900/50">
         <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${filter === 'all' ? 'bg-zinc-800 text-white border-zinc-700' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
         >
             All Artifacts
         </button>
         <button 
            onClick={() => setFilter('image')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-1.5 ${filter === 'image' ? 'bg-zinc-800 text-white border-zinc-700' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
         >
             <ImageIcon size={12} /> Images
         </button>
         <button 
            onClick={() => setFilter('text')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-1.5 ${filter === 'text' ? 'bg-zinc-800 text-white border-zinc-700' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
         >
             <FileText size={12} /> Wisdom
         </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item, idx) => (
                <motion.div
                    key={item.id}
                    layoutId={item.id}
                    onClick={() => setSelectedItem(item)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="aspect-square relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer group"
                >
                    {item.type === 'image' && item.url ? (
                        <>
                            <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col justify-between p-4 bg-gradient-to-br from-zinc-800 to-zinc-950">
                            <FileText className="text-zinc-600 group-hover:text-purple-400 transition-colors" />
                            <p className="text-xs text-zinc-400 line-clamp-3 font-mono leading-relaxed">{item.content}</p>
                        </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-xs font-bold text-white truncate drop-shadow-md">{item.title}</h4>
                        <div className="flex gap-1 mt-1">
                            {item.tags.map(tag => (
                                <span key={tag} className="text-[9px] text-zinc-300 bg-black/50 backdrop-blur px-1.5 py-0.5 rounded-md uppercase tracking-wider">{tag}</span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setSelectedItem(null)}>
                <motion.div 
                    layoutId={selectedItem.id}
                    className="w-full max-w-2xl bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setSelectedItem(null)}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-black transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex flex-col md:flex-row">
                        {selectedItem.type === 'image' && selectedItem.url && (
                            <div className="w-full md:w-1/2 aspect-square md:aspect-auto">
                                <img src={selectedItem.url} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="flex-1 p-6 md:p-8 flex flex-col">
                            <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h2>
                            <div className="flex gap-2 mb-6">
                                {selectedItem.tags.map(tag => (
                                    <span key={tag} className="text-xs px-2 py-1 bg-purple-900/30 border border-purple-500/30 text-purple-300 rounded-lg uppercase tracking-wider">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto max-h-[30vh]">
                                <p className="text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">
                                    {selectedItem.content || "Visual Manifestation stored in the Vault."}
                                </p>
                            </div>

                            <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-between items-center">
                                <span className="text-xs text-zinc-500">{new Date(selectedItem.date).toLocaleDateString()}</span>
                                <button className="text-xs font-bold text-white bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors">
                                    Expand
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
