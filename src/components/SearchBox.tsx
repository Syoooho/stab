import { useState } from 'react';
import { Search } from 'lucide-react';
import { usePersistence } from '../hooks/usePersistence';

const ENGINES = [
  { name: 'Google', url: 'https://www.google.com/search?q=' },
  { name: '百度', url: 'https://www.baidu.com/s?wd=' },
  { name: 'Bing', url: 'https://www.bing.com/search?q=' },
];

export const SearchBox = () => {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = usePersistence('stab_search_engine', ENGINES[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `${engine.url}${encodeURIComponent(query)}`;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8 z-50">
      <form onSubmit={handleSearch} className="relative group">
        {/* Input is rendered first but z-index will handle layering */}
        <input
          type="text"
          className="w-full pl-24 pr-12 py-[1.5vh] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/15 transition-all shadow-lg"
          placeholder="搜索..."
          style={{ fontSize: 'clamp(14px, 1.8vh, 18px)' }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Engine Switcher - Absolute positioned over the input */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-10">
            <button 
                type="button"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 text-sm font-medium transition-colors border border-white/5 select-none cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                {engine.name}
            </button>
            
            {isOpen && (
                 <div className="absolute top-full left-3 mt-2 w-32 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                     {ENGINES.map(e => (
                         <button
                            key={e.name}
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
                            onClick={() => { setEngine(e); setIsOpen(false); }}
                         >
                             {e.name}
                         </button>
                     ))}
                 </div>
            )}
        </div>

        <button
          type="submit"
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-colors z-10 cursor-pointer"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
