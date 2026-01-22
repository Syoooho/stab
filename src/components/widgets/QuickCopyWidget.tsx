import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { QuickCopyItem } from '../../types';

interface QuickCopyWidgetProps {
    items: QuickCopyItem[];
}

export const QuickCopyWidget = ({ items }: QuickCopyWidgetProps) => {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (val: string) => {
        navigator.clipboard.writeText(val);
        setCopied(val);
        setTimeout(() => setCopied(null), 2000);
    }

    return (
        <div className="glass p-[1.5vh] rounded-xl h-[14vh] flex flex-col">
             <h3 className="font-medium text-white/70 mb-2" style={{ fontSize: 'clamp(12px, 1.5vh, 14px)' }}>快速复制</h3>
             <div className="space-y-2 overflow-y-auto custom-scrollbar">
                 {items.length === 0 && (
                     <div className="text-white/30 text-center py-4" style={{ fontSize: 'clamp(10px, 1.2vh, 12px)' }}>暂无内容</div>
                 )}
                 {items.map(item => (
                     <button 
                       key={item.id}
                       onClick={() => handleCopy(item.value)}
                       className="w-full flex items-center justify-between p-2 rounded hover:bg-white/10 transition-colors group cursor-pointer"
                       style={{ fontSize: 'clamp(10px, 1.2vh, 12px)' }}
                    >
                        <span className="text-white/80 truncate mr-2">{item.label}</span>
                        {copied === item.value ? (
                            <Check className="w-3 h-3 text-green-400 shrink-0" />
                        ) : (
                            <Copy className="w-3 h-3 text-white/30 group-hover:text-white/70 shrink-0" />
                        )}
                    </button>
                 ))}
             </div>
        </div>
    );
}
