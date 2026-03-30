import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { NetworkType } from '../../types';

interface SortablePriorityItemProps {
  type: NetworkType;
  label: string;
}

export const SortablePriorityItem = ({ type, label }: SortablePriorityItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: type });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 mb-2 touch-none"
    >
      <span className="text-sm text-white/80">{label}</span>
      <div {...attributes} {...listeners} className="text-white/30 cursor-grab hover:text-white/60">
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  );
};