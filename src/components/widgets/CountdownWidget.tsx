import { useState, useEffect } from 'react';

interface CountdownWidgetProps {
    targetDate: string;
    label: string;
}

export const CountdownWidget = ({ targetDate, label }: CountdownWidgetProps) => {
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number}>({ days: 0, hours: 0 });
    
    useEffect(() => {
        const calculate = () => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target.getTime() - now.getTime();
            
            if (diff <= 0) {
                 setTimeLeft({ days: 0, hours: 0 });
                 return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            setTimeLeft({ days, hours });
        }
        
        calculate();
        const interval = setInterval(calculate, 1000 * 60);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="glass p-4 rounded-xl h-32 flex flex-col justify-center items-center bg-gradient-to-br from-purple-500/20 to-blue-500/20">
             <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</span>
             <div className="text-3xl font-bold mt-1">{timeLeft.days} <span className="text-sm font-normal text-white/50">天</span></div>
             <div className="text-xs text-white/50">剩余 {timeLeft.hours} 小时</div>
        </div>
    );
}
