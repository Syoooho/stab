import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, CloudSnow } from 'lucide-react';

interface WeatherData {
  city: string;
  temperature: number;
  weather: string;
}

interface WeatherWidgetProps {
    city: string;
}

export const WeatherWidget = ({ city }: WeatherWidgetProps) => {
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!city) return;
        
        const fetchWeather = async () => {
            setLoading(true);
            setError(false);
            try {
                const res = await fetch(`https://uapis.cn/api/v1/misc/weather?city=${encodeURIComponent(city)}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                
                setData({
                    city: json.city || city,
                    temperature: json.temperature,
                    weather: json.weather
                });
            } catch (e) {
                console.error(e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        // Refresh every 30 minutes
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [city]);

    const getIcon = (weather: string) => {
        if (weather.includes('晴')) return <Sun className="w-8 h-8 text-yellow-400" />;
        if (weather.includes('雨')) return <CloudRain className="w-8 h-8 text-blue-400" />;
        if (weather.includes('雪')) return <CloudSnow className="w-8 h-8 text-white" />;
        if (weather.includes('雷')) return <CloudLightning className="w-8 h-8 text-purple-400" />;
        return <Cloud className="w-8 h-8 text-gray-400" />;
    }

    return (
        <div className="glass p-4 rounded-xl h-32 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                 <div className="text-sm font-medium text-white/70">天气</div>
                 {data && getIcon(data.weather)}
            </div>
            <div>
                {loading && !data ? (
                    <div className="text-2xl font-bold animate-pulse">--°</div>
                ) : error ? (
                    <div className="text-sm text-red-400">获取失败</div>
                ) : (
                    <>
                        <div className="text-3xl font-bold">{data?.temperature}°C</div>
                        <div className="text-xs text-white/50">{data?.city} · {data?.weather}</div>
                    </>
                )}
            </div>
        </div>
    );
}
