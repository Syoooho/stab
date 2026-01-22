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
        <div className="glass p-[1.5vh] rounded-xl h-[14vh] flex flex-col justify-center items-center bg-gradient-to-br from-purple-500/20 to-blue-500/20">
             <span className="font-medium text-white/60 uppercase tracking-wider" style={{ fontSize: 'clamp(10px, 1.2vh, 12px)' }}>{label}</span>
             <div className="font-bold mt-1" style={{ fontSize: 'clamp(24px, 3.5vh, 32px)' }}>{timeLeft.days} <span className="font-normal text-white/50" style={{ fontSize: 'clamp(12px, 1.5vh, 14px)' }}>天</span></div>
             <div className="text-white/50" style={{ fontSize: 'clamp(10px, 1.2vh, 12px)' }}>剩余 {timeLeft.hours} 小时</div>
        </div>
    );
}
