# 🌦️ Weather API (Node.js + Express + Redis)
Sample solution for the [weather-api-wrapper-service](https://github.com/sayan14banerjee/Weather-API) challenge from [roadmap.sh](https://roadmap.sh/projects/weather-api-wrapper-service)
A simple Weather API that fetches real-time weather data from **WeatherAPI.com**, caches results using **Redis**, and protects the endpoint with **rate limiting**.  
This project helps you learn how to work with 3rd-party APIs, caching, environment variables, and backend API structuring.

---

## 🚀 Features

- Fetch real-time weather using **WeatherAPI.com**
- In-memory caching using **Redis** (12-hour TTL)
- Rate limiting using **express-rate-limit**
- Clean and structured API response
- Error handling for invalid cities or API failure
- Environment variables for secrets and config

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **Redis**
- **Axios**
- **dotenv**
- **express-rate-limit**

---

## 📦 Installation

```bash
git clone <your-repo-url>
cd weather-api
npm install
```

## ⚙️ Environment Variables

### Create a .env file:
```js
PORT=3000
WEATHER_API_KEY=YOUR_WEATHERAPI_KEY
WEATHER_API_BASE_URL=https://api.weatherapi.com/v1/current.json
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=43200
```

⚠️ *Do not commit .env to GitHub.*

#### ▶️ Run the Server

Make sure Redis is running:
```bash
redis-server
```

Then start your API:
```bash
node server.js
```
#### 🌍 API Endpoint
##### GET /weather?city=<cityname>
Example:
```
http://localhost:3000/weather?city=London
```
Example Response:
```
{
  "city": "London",
  "country": "United Kingdom",
  "temperature": 11,
  "condition": "Partly cloudy",
  "humidity": 72,
  "wind_kph": 10.5,
  "source": "weatherapi.com"
}
```

If cached:
```
{
  "city": "London",
  "temperature": 11,
  "condition": "Partly cloudy",
  "source": "cache"
}
```
### 🧰 How It Works

- You request weather for a city

- API checks if data exists in Redis

- If cached → return cached data

- If not cached → fetch from WeatherAPI → store in Redis → return result

- Rate limiter prevents API abuse

### 📄 License

**Free to use & modify. Educational purpose.**

**Made with ❤️ for learning backend development.**