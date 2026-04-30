import { useEffect, useState } from 'react';
import { Cloud, CloudLightning, CloudRain, Sun } from 'lucide-react';

const WeatherCard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const CITY = 'Nellore';

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        const currentRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`,
          { signal }
        );
        const currentJson = await currentRes.json();

        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&units=metric&appid=${API_KEY}`,
          { signal }
        );
        const forecastJson = await forecastRes.json();

        if (currentJson.cod !== 200 || forecastJson.cod !== "200") {
          throw new Error('Failed to fetch weather data');
        }

        setWeatherData(currentJson);

        const dailyForecast = [];
        const processedDates = new Set();
        const todayStr = new Date().toDateString();

        forecastJson.list.forEach((item) => {
          const date = new Date(item.dt * 1000);
          const dateString = date.toDateString();
          if (
            dateString !== todayStr &&
            !processedDates.has(dateString) &&
            (date.getHours() >= 12 || dailyForecast.length === 0)
          ) {
            dailyForecast.push(item);
            processedDates.add(dateString);
          }
        });

        setForecastData(dailyForecast.slice(0, 5));
        setLoading(false);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError("Unable to load weather");
        setLoading(false);
      }
    };

    fetchWeather();
    return () => controller.abort();
  }, [API_KEY]);

  const getDayName = (timestamp) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[new Date(timestamp * 1000).getDay()];
  };

  const getWeatherIcon = (weatherId) => {
    if (weatherId >= 200 && weatherId < 300) return <CloudLightning size={24} />;
    if (weatherId >= 300 && weatherId < 600) return <CloudRain size={24} />;
    if (weatherId >= 600 && weatherId < 700) return <Cloud size={24} />;
    if (weatherId === 800) return <Sun size={24} />;
    if (weatherId === 801 || weatherId === 802) return <Cloud size={24} />;
    return <Cloud size={24} />;
  };

  if (loading) return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 w-full shadow-2xl">
      <p>Loading weather...</p>
    </div>
  );
  if (error || !weatherData) return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 w-full shadow-2xl">
      <p>Weather unavailable</p>
    </div>
  );

  const { main, weather, wind } = weatherData;
  const currentTemp = Math.round(main.temp);
  const condition = weather[0].description;
  const weatherId = weather[0].id;

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 w-full shadow-2xl font-sans box-border">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-md:flex-col max-md:items-center max-md:text-center">
        {/* Location */}
        <div className="flex flex-col flex-[1.2]">
          <span className="text-base font-bold tracking-tight text-white">Nellore, AP</span>
          <span className="text-[0.65rem] text-slate-400 font-medium uppercase mt-0.5">
            {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* Icon + condition */}
        <div className="flex flex-col items-center gap-1 flex-[0.8]">
          <div className="text-4xl text-amber-400 flex items-center justify-center">
            {getWeatherIcon(weatherId)}
          </div>
          <span className="text-[0.7rem] font-semibold capitalize whitespace-nowrap">{condition}</span>
        </div>

        {/* Temperature */}
        <div className="flex items-start flex-1 justify-center max-md:justify-center">
          <span className="text-[2.8rem] font-medium leading-none">{currentTemp}</span>
          <span className="text-2xl mt-1 font-light">°C</span>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-1.5 text-[0.7rem] flex-1 text-right max-md:items-center">
          <div className="flex justify-end gap-2 text-slate-400">
            <span>Wind:</span>
            <span className="text-white font-medium">{Math.round(wind.speed * 3.6)} km/h</span>
          </div>
          <div className="flex justify-end gap-2 text-slate-400">
            <span>Humidity:</span>
            <span className="text-white font-medium">{main.humidity}%</span>
          </div>
          <div className="flex justify-end gap-2 text-slate-400">
            <span>Pressure:</span>
            <span className="text-white font-medium">{main.pressure} mb</span>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="flex justify-between mt-5 pt-5 border-t border-white/10">
        {forecastData.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <span className="text-[0.6rem] font-bold text-slate-400 mb-1">{getDayName(day.dt)}</span>
            <span className="text-xl text-white my-2">{getWeatherIcon(day.weather[0].id)}</span>
            <span className="text-[0.75rem] font-semibold">{Math.round(day.main.temp)}°c</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherCard;
