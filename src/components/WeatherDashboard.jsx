import React, { useEffect, useState } from "react";
import '../App.css'; // Adjust path as needed

const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

export default function WeatherDashboard() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [recentCities, setRecentCities] = useState(() => {
    return JSON.parse(localStorage.getItem("recentCities")) || [];
  });

  useEffect(() => {
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
  }, [recentCities]);

  const fetchWeatherByCity = async (cityName) => {
    try {
      const res = await fetch(`${API_URL}?q=${cityName}&units=metric&appid=${API_KEY}`);
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data);
      fetchForecast(data.coord.lat, data.coord.lon);
      addCityToRecent(cityName);
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const res = await fetch(`${API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
      const data = await res.json();
      setWeather(data);
      fetchForecast(lat, lon);
    } catch (err) {
      alert("Error fetching location weather");
    }
  };

  const fetchForecast = async (lat, lon) => {
    try {
      const res = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
      const data = await res.json();
      const dailyData = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
      setForecast(dailyData);
    } catch (err) {
      alert("Error fetching forecast");
    }
  };

  const addCityToRecent = (cityName) => {
    if (!recentCities.includes(cityName)) {
      const updated = [...recentCities, cityName].slice(-5);
      setRecentCities(updated);
    }
  };

  const handleSearch = () => {
    if (city.trim()) fetchWeatherByCity(city.trim());
    else alert("Please enter a city name");
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => fetchWeatherByCoords(coords.latitude, coords.longitude),
        () => alert("Unable to get location")
      );
    } else {
      alert("Geolocation not supported");
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
        🌤️ Weather Forecast App
      </h1>
      <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1.5rem' }}>
        Get accurate and up-to-date weather information
      </p>

      {/* Input + Buttons */}
      <div className="space-y-4">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
        />
        <button onClick={handleSearch}>Search by City</button>
        <button onClick={handleCurrentLocation}>Get Weather for Current Location</button>
      </div>

      {/* Recently Searched Cities */}
      {recentCities.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Recently Searched Cities
          </h2>
          <select onChange={(e) => fetchWeatherByCity(e.target.value)}>
            <option value="">Select a city</option>
            {recentCities.map((city, idx) => (
              <option key={idx} value={city}>{city}</option>
            ))}
          </select>
        </div>
      )}

      {/* Current Weather */}
      {weather && (
        <div className="weather-box">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
            {weather.name}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <img
              src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt="Weather Icon"
              style={{ width: 80, height: 80 }}
            />
          </div>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
              Temperature: {weather.main.temp}°C
            </p>
            <p style={{ textTransform: 'capitalize', color: '#6b7280' }}>
              {weather.weather[0].description}
            </p>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#374151' }}>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Wind Speed: {weather.wind.speed} km/h</p>
          </div>
        </div>
      )}

      {/* Forecast */}
      {forecast.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>5-Day Forecast</h2>
          <div className="forecast-grid">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {new Date(day.dt_txt).toLocaleDateString("en-GB", {
                    weekday: "short",
                    month: "short",
                    day: "numeric"
                  })}
                </p>
                <img
                  src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt="Icon"
                  style={{ width: 64, height: 64 }}
                />
                <p className="text-sm">Temp: {day.main.temp}°C</p>
                <p className="text-sm">Humidity: {day.main.humidity}%</p>
                <p className="text-sm">Wind: {day.wind.speed} km/h</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
