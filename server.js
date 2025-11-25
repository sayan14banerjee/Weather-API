require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { createClient } = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || '43200', 10); // 12 hours

const rateLimit = require('express-rate-limit');


const weatherLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 60,                   // 60 requests per window per IP
  standardHeaders: true,     // send rate limit info in headers
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});


// Redis client
const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
  console.log('Connected to Redis ✅');
})();

// helper: fetch from Visual Crossing
async function fetchWeatherFromAPI(city) {
  try {
    const response = await axios.get(process.env.WEATHER_API_BASE_URL, {
      params: {
        key: process.env.WEATHER_API_KEY,
        q: city,
        aqi: "no"
      }
    });

    const data = response.data;

    return {
      city: data.location.name,
      country: data.location.country,
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      wind_kph: data.current.wind_kph,
      source: "weatherapi.com"
    };

  } catch (err) {
    throw err;
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Weather API is running ✅' });
});

app.get('/weather', weatherLimiter, async (req, res) => {
  const city = req.query.city?.trim();

  if (!city) {
    return res.status(400).json({ error: 'city query parameter is required' });
  }

  const cacheKey = `weather:${city.toLowerCase()}`;

  try {
    // 1) Try cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('Cache hit for', city);
      return res.json({ ...JSON.parse(cached), source: 'cache' });
    }

    console.log('Cache miss for', city, '→ calling API');

    // 2) Not in cache → call API
    const weather = await fetchWeatherFromAPI(city);

    // 3) Save to cache with expiry (EX seconds)
    await redisClient.set(cacheKey, JSON.stringify(weather), {
      EX: CACHE_TTL_SECONDS
    });

    res.json(weather);
  } catch (err) {
    console.error('Error in /weather:', err.message);

    if (err.response) {
      if (err.response.status === 400 || err.response.status === 404) {
        return res.status(400).json({ error: 'Invalid city or not found' });
      }
    }

    res.status(500).json({ error: 'Something went wrong fetching weather data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
