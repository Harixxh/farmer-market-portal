import React, { useState, useEffect, useCallback } from 'react'
import api from '../config/api'
import { useLanguage } from '../context/LanguageContext'

const Weather = () => {
  const { t } = useLanguage()
  const [weatherData, setWeatherData] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchCity, setSearchCity] = useState('')

  // ─── Geocode a city/village name to lat/lon via Open-Meteo ───
  const geocode = async (name) => {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en`)
    const data = await res.json()
    if (data.results && data.results.length > 0) {
      const r = data.results[0]
      return { lat: r.latitude, lon: r.longitude, name: r.name, admin: r.admin1 || '', country: r.country || '' }
    }
    return null
  }

  // ─── Fetch weather from Open-Meteo (free, no API key needed) ───
  const fetchWeather = useCallback(async (lat, lon) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,uv_index&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=7`
      const res = await fetch(url)
      const data = await res.json()
      setWeatherData(data)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Failed to fetch weather data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Initialize: farmer profile location → browser geolocation → Delhi ───
  useEffect(() => {
    const init = async () => {
      // 1. Try user profile location (works for both farmer and buyer)
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const res = await api.get('/api/profile/me', { _skipAuthRedirect: true })
          const profile = res.data?.profile
          if (profile?.location) {
            const loc = profile.location
            // Farmer: village/district/state, Buyer: city/state/address
            const locString = [loc.village, loc.city, loc.district, loc.state].filter(Boolean).join(', ')
            if (locString) {
              const searchTerm = loc.district || loc.city || loc.village || loc.state
              const geo = await geocode(searchTerm)
              if (geo) {
                setLocationName(locString)
                await fetchWeather(geo.lat, geo.lon)
                return
              }
            }
          }
        }
      } catch (e) {
        console.log('Profile fetch skipped:', e.message)
      }

      // 2. Try browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords
            setLocationName(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`)
            await fetchWeather(latitude, longitude)
          },
          async () => {
            // 3. Fallback to Delhi
            setLocationName('New Delhi, Delhi')
            await fetchWeather(28.6139, 77.209)
          },
          { timeout: 5000 }
        )
      } else {
        setLocationName('New Delhi, Delhi')
        await fetchWeather(28.6139, 77.209)
      }
    }
    init()
  }, [fetchWeather])

  // ─── Search handler ───
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchCity.trim()) return
    setLoading(true)
    setError('')
    const geo = await geocode(searchCity.trim())
    if (geo) {
      setLocationName(`${geo.name}${geo.admin ? ', ' + geo.admin : ''}`)
      await fetchWeather(geo.lat, geo.lon)
      setSearchCity('')
    } else {
      setError(`Location "${searchCity}" not found. Try another name.`)
      setLoading(false)
    }
  }

  // ─── Weather code → description + icon type ───
  const weatherCodeMap = (code) => {
    if (code <= 1) return { desc: 'Clear Sky', type: 'sunny' }
    if (code <= 3) return { desc: 'Partly Cloudy', type: 'cloudy' }
    if (code <= 48) return { desc: 'Foggy', type: 'cloudy' }
    if (code <= 57) return { desc: 'Drizzle', type: 'rainy' }
    if (code <= 67) return { desc: 'Rain', type: 'rainy' }
    if (code <= 77) return { desc: 'Snow', type: 'cloudy' }
    if (code <= 82) return { desc: 'Rain Showers', type: 'rainy' }
    if (code <= 86) return { desc: 'Snow Showers', type: 'cloudy' }
    if (code <= 99) return { desc: 'Thunderstorm', type: 'storm' }
    return { desc: 'Unknown', type: 'cloudy' }
  }

  const getDayName = (dateStr, idx) => {
    if (idx === 0) return 'Today'
    if (idx === 1) return 'Tomorrow'
    return new Date(dateStr).toLocaleDateString('en', { weekday: 'short' })
  }

  // ─── SVG icons ───
  const WeatherIcon = ({ type, size = 'md' }) => {
    const sizeClass = size === 'lg' ? 'w-16 h-16' : size === 'md' ? 'w-10 h-10' : 'w-6 h-6'
    const icons = {
      sunny: (
        <svg className={sizeClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ),
      cloudy: (
        <svg className={sizeClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      rainy: (
        <svg className={sizeClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          <path strokeLinecap="round" strokeWidth={2} d="M8 19v2M12 19v2M16 19v2" />
        </svg>
      ),
      storm: (
        <svg className={sizeClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l-2 4 4-2-2 4" />
        </svg>
      ),
      night: (
        <svg className={sizeClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    }
    return icons[type] || icons.sunny
  }

  // ─── Generate farming alerts based on actual weather ───
  const generateAlerts = () => {
    if (!weatherData?.daily) return []
    const alerts = []
    const daily = weatherData.daily

    for (let i = 0; i < Math.min(3, daily.precipitation_probability_max.length); i++) {
      if (daily.precipitation_probability_max[i] > 60) {
        alerts.push({ type: 'warning', title: `Rain Expected on ${getDayName(daily.time[i], i)}`, message: `${daily.precipitation_probability_max[i]}% chance of rain. Consider harvesting ready crops and covering sensitive produce.` })
        break
      }
    }

    const maxTemp = Math.max(...daily.temperature_2m_max.slice(0, 3))
    if (maxTemp > 40) {
      alerts.push({ type: 'alert', title: 'Extreme Heat Warning', message: `Temperature expected to reach ${maxTemp.toFixed(0)}°C. Ensure adequate irrigation and protect livestock.` })
    } else if (maxTemp > 35) {
      alerts.push({ type: 'warning', title: 'High Temperature Alert', message: `Temperature may reach ${maxTemp.toFixed(0)}°C. Increase watering frequency for crops.` })
    }

    if (weatherData.current?.uv_index > 7) {
      alerts.push({ type: 'alert', title: 'High UV Index', message: `UV index is ${weatherData.current.uv_index.toFixed(0)}. Apply mulching to protect soil moisture. Avoid outdoor work during peak hours.` })
    }

    const noRainDays = daily.precipitation_probability_max.slice(0, 3).filter(p => p < 20).length
    if (noRainDays >= 2) {
      alerts.push({ type: 'info', title: 'Favorable Spraying Conditions', message: `Low chance of rain for the next ${noRainDays} days. Good time for pesticide or fertilizer application.` })
    }

    const minTemp = Math.min(...daily.temperature_2m_min.slice(0, 3))
    if (minTemp < 5) {
      alerts.push({ type: 'alert', title: 'Frost Risk', message: `Temperature may drop to ${minTemp.toFixed(0)}°C. Protect frost-sensitive crops with covers.` })
    }

    if (alerts.length === 0) {
      alerts.push({ type: 'info', title: 'Normal Conditions', message: 'Weather conditions look stable for the next few days. Good time for regular farming activities.' })
    }
    return alerts
  }

  // ─── Generate crop advisory based on actual weather ───
  const generateAdvisory = () => {
    if (!weatherData?.current) return []
    const temp = weatherData.current.temperature_2m
    const humidity = weatherData.current.relative_humidity_2m
    const advisory = []

    if (temp >= 20 && temp <= 30 && humidity >= 50) {
      advisory.push({ crop: 'Rice / Paddy', advice: 'Conditions are favorable for paddy cultivation. Maintain water levels in fields.', status: 'favorable' })
    } else if (temp > 35) {
      advisory.push({ crop: 'Rice / Paddy', advice: 'High heat may stress paddy. Ensure fields stay flooded for cooling.', status: 'caution' })
    }

    if (temp >= 15 && temp <= 25) {
      advisory.push({ crop: 'Wheat', advice: 'Temperature is ideal for wheat growth. Monitor for rust if humidity is high.', status: 'favorable' })
    } else if (temp > 30) {
      advisory.push({ crop: 'Wheat', advice: 'Heat stress risk for wheat. Irrigate in early morning to reduce damage.', status: 'caution' })
    }

    if (temp >= 25 && temp <= 35) {
      advisory.push({ crop: 'Cotton', advice: 'Good growing conditions for cotton. Ensure pest monitoring is active.', status: 'favorable' })
    }

    if (humidity > 80) {
      advisory.push({ crop: 'Vegetables', advice: 'High humidity may cause fungal diseases. Apply fungicide preventively and ensure good drainage.', status: 'caution' })
    } else {
      advisory.push({ crop: 'Vegetables', advice: 'Conditions are suitable. Apply mulching to conserve soil moisture.', status: 'favorable' })
    }

    if (temp >= 20 && temp <= 32) {
      advisory.push({ crop: 'Sugarcane', advice: 'Favorable conditions for sugarcane growth. Maintain regular irrigation schedule.', status: 'favorable' })
    }

    return advisory
  }

  const AlertIcon = ({ type }) => {
    if (type === 'warning') return (
      <svg className="w-6 h-6 text-yellow-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
    if (type === 'alert') return (
      <svg className="w-6 h-6 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
    return (
      <svg className="w-6 h-6 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="text-gray-500 text-sm">Fetching weather for your location...</p>
      </div>
    )
  }

  const current = weatherData?.current
  const daily = weatherData?.daily
  const hourly = weatherData?.hourly
  const currentCode = current ? weatherCodeMap(current.weather_code) : { desc: 'N/A', type: 'cloudy' }
  const alerts = generateAlerts()
  const advisory = generateAdvisory()

  const todayHourly = hourly ? [6, 9, 12, 15, 18, 21].map(h => ({
    time: `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`,
    temp: hourly.temperature_2m[h],
    type: weatherCodeMap(hourly.weather_code[h]).type
  })) : []

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Weather Forecast</h1>
            <p className="text-gray-500 mt-1 text-sm">Real-time weather for your farm location</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search city or village..."
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-sm w-52"
            />
            <button type="submit" className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              Search
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {current && (
          <>
            {/* Current Weather Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 sm:p-8 text-white mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-6 mb-6 lg:mb-0">
                  <div className="text-white">
                    <WeatherIcon type={currentCode.type} size="lg" />
                  </div>
                  <div>
                    <p className="text-5xl sm:text-6xl font-bold">{current.temperature_2m.toFixed(0)}°C</p>
                    <p className="text-xl text-blue-100">{currentCode.desc}</p>
                    <p className="text-blue-200 mt-1 flex items-center gap-1 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {locationName}
                    </p>
                    <p className="text-blue-300 text-xs mt-1">Feels like {current.apparent_temperature.toFixed(0)}°C</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                    <p className="text-blue-100 text-xs">Humidity</p>
                    <p className="text-2xl font-bold">{current.relative_humidity_2m}%</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                    <p className="text-blue-100 text-xs">Wind</p>
                    <p className="text-2xl font-bold">{current.wind_speed_10m.toFixed(0)}<span className="text-sm"> km/h</span></p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                    <p className="text-blue-100 text-xs">UV Index</p>
                    <p className="text-2xl font-bold">{current.uv_index.toFixed(0)}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                    <p className="text-blue-100 text-xs">Rain Today</p>
                    <p className="text-2xl font-bold">{daily?.precipitation_probability_max?.[0] || 0}<span className="text-sm">%</span></p>
                  </div>
                </div>
              </div>

              {/* Hourly */}
              {todayHourly.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/20">
                  <h3 className="text-lg font-semibold mb-4">Today's Forecast</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {todayHourly.map((hour, idx) => (
                      <div key={idx} className="shrink-0 bg-white/20 rounded-xl p-4 text-center min-w-[80px] backdrop-blur-sm">
                        <p className="text-sm text-blue-100">{hour.time}</p>
                        <div className="my-2 flex justify-center">
                          <WeatherIcon type={hour.type} size="sm" />
                        </div>
                        <p className="font-semibold">{hour.temp?.toFixed(0)}°</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 7-Day Forecast */}
            {daily && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">7-Day Forecast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                  {daily.time.map((date, idx) => {
                    const code = weatherCodeMap(daily.weather_code[idx])
                    return (
                      <div key={idx} className={`rounded-xl p-4 text-center ${idx === 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'}`}>
                        <p className="font-medium text-gray-900">{getDayName(date, idx)}</p>
                        <div className="my-3 flex justify-center text-gray-600">
                          <WeatherIcon type={code.type} size="md" />
                        </div>
                        <p className="text-sm text-gray-500">{code.desc}</p>
                        <div className="mt-2">
                          <span className="font-semibold text-gray-900">{daily.temperature_2m_max[idx].toFixed(0)}°</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-gray-500">{daily.temperature_2m_min[idx].toFixed(0)}°</span>
                        </div>
                        <p className="text-xs text-blue-500 mt-2 flex items-center justify-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
                          </svg>
                          {daily.precipitation_probability_max[idx]}%
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Alerts and Advisory */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Farming Alerts
                </h2>
                <div className="space-y-4">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      alert.type === 'alert' ? 'bg-red-50 border-red-400' :
                      'bg-green-50 border-green-400'
                    }`}>
                      <div className="flex items-start gap-3">
                        <AlertIcon type={alert.type} />
                        <div>
                          <p className="font-medium text-gray-900">{alert.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Crop Advisory
                </h2>
                <div className="space-y-4">
                  {advisory.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                        item.status === 'favorable' ? 'bg-green-500' :
                        item.status === 'moderate' ? 'bg-yellow-500' :
                        'bg-orange-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{item.crop}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.advice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sunrise / Sunset */}
            {daily?.sunrise && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sun & Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <svg className="w-8 h-8 mx-auto text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                      <circle cx="12" cy="12" r="4" strokeWidth={2} />
                    </svg>
                    <p className="text-xs text-gray-500">Sunrise</p>
                    <p className="font-semibold text-gray-800">{new Date(daily.sunrise[0]).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-xl">
                    <svg className="w-8 h-8 mx-auto text-indigo-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <p className="text-xs text-gray-500">Sunset</p>
                    <p className="font-semibold text-gray-800">{new Date(daily.sunset[0]).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <svg className="w-8 h-8 mx-auto text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <p className="text-xs text-gray-500">Wind</p>
                    <p className="font-semibold text-gray-800">{current.wind_speed_10m.toFixed(0)} km/h</p>
                  </div>
                  <div className="text-center p-4 bg-cyan-50 rounded-xl">
                    <svg className="w-8 h-8 mx-auto text-cyan-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <p className="text-xs text-gray-500">Humidity</p>
                    <p className="font-semibold text-gray-800">{current.relative_humidity_2m}%</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 text-center text-xs text-gray-400">
              Live weather data from Open-Meteo API &bull; Auto-detected from your farm profile location
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Weather
