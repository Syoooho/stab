import type { PresetApp } from '../data/presets';
import { getPresetIcon } from '../hooks/useIconFetch';

interface PresetGridProps {
  presets: PresetApp[];
  onSelect: (preset: PresetApp) => void;
  onSwitchToCustom: () => void;
}

export function PresetGrid({ presets, onSelect, onSwitchToCustom }: PresetGridProps) {
  return (
    <>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 mb-8 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => onSelect(preset)}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group cursor-pointer"
          >
            <img 
              src={getPresetIcon(preset)} 
              className="w-10 h-10 mb-2 rounded-lg object-contain group-hover:scale-110 transition-transform" 
              alt={preset.name}
            />
            <span className="text-xs text-white/70">{preset.name}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <button
          onClick={onSwitchToCustom}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          自定义添加
        </button>
        <div className="text-xs text-white/30">
          从上方选择或自定义
        </div>
      </div>
    </>
  );
}