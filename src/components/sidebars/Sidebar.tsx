import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  position: 'left' | 'right';
  title: string;
  children: React.ReactNode;
}

export const Sidebar = ({ isOpen, onClose, position, title, children }: SidebarProps) => {
  const variants = {
    closed: { 
        x: position === 'left' ? '-100%' : '100%',
        opacity: 0 
    },
    open: { 
        x: 0,
        opacity: 1
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 bottom-0 ${position === 'left' ? 'left-0' : 'right-0'} w-80 bg-[#1a1a1a] border-${position === 'left' ? 'r' : 'l'} border-white/10 shadow-2xl z-50 p-6 flex flex-col`}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
