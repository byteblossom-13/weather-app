// Live Weather Forecast (OpenWeatherMap)
const API_KEY = "11fb7a8ce1314f6b5a14ba349a05b749";

// DOM elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const statusEl = document.getElementById("status");
const currentSection = document.getElementById("current");
const forecastSection = document.getElementById("forecast");
const cityNameEl = document.getElementById("cityName");
const descriptionEl = document.getElementById("description");
const tempEl = document.getElementById("temp");
const feelsEl = document.getElementById("feels");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const iconEl = document.getElementById("icon");
const forecastCards = document.getElementById("forecastCards");
const loader = document.getElementById("loader");

// Loader
function showLoader(show) {
  loader.classList.toggle("hidden", !show);
}

// Status
function showStatus(msg, error = false) {
  statusEl.textContent = msg;
  statusEl.style.color = error ? "#ff6b6b" : "";
}

// Weather background
function setWeatherTheme(weather) {
  weather = weather.toLowerCase();

  if (weather.includes("cloud"))
    document.body.style.background = "linear-gradient(rgba(107,122,161,.6),rgba(43,58,103,.6)),url('./image/cloudy.jpg') center/cover";
  else if (weather.includes("rain"))
    document.body.style.background = "linear-gradient(rgba(31,60,136,.6),rgba(2,6,23,.6)),url('./image/rain.jpg') center/cover";
  else if (weather.includes("clear"))
    document.body.style.background = "linear-gradient(rgba(79,195,255,.6),rgba(0,78,146,.6)),url('./image/clear.jpg') center/cover";
  else if (weather.includes("snow"))
    document.body.style.background = "linear-gradient(rgba(230,242,255,.6),rgba(163,201,249,.6)),url('./image/snow.jpg') center/cover";
  else
    document.body.style.background = "linear-gradient(rgba(15,23,36,.6),rgba(2,6,23,.6)),url('./image/bg.jpg') center/cover";
}

// Weather icon
function iconUrl(code) {
  return `https://openweathermap.org/img/wn/${code}@2x.png`;
}

// API calls
async function fetchCurrentByCity(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  );
  if (!res.ok) throw new Error("City not found");
  return res.json();
}

async function fetchCurrentByCoords(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  return res.json();
}

async function fetchForecast(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  const data = await res.json();

  const days = {};
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!days[date]) days[date] = [];
    days[date].push(item);
  });

  return Object.keys(days).slice(1, 6).map(day => {
    const temps = days[day].map(d => d.main.temp);
    const icons = days[day].map(d => d.weather[0].icon);
    return {
      day,
      temp: Math.round(temps.reduce((a, b) => a + b) / temps.length),
      icon: icons[0]
    };
  });
}

// Render current
function renderCurrent(data) {
  currentSection.classList.remove("hidden");

  cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
  descriptionEl.textContent = data.weather[0].description;
  tempEl.textContent = `${Math.round(data.main.temp)}°C`;
  feelsEl.textContent = `Feels: ${Math.round(data.main.feels_like)}°C`;
  humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
  windEl.textContent = `Wind: ${data.wind.speed} m/s`;

  iconEl.src = iconUrl(data.weather[0].icon);

  setWeatherTheme(data.weather[0].main);

  // Sunrise / Sunset
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

  document.querySelector(".details").innerHTML = `
    <span id="feels">Feels: ${Math.round(data.main.feels_like)}°C</span>
    <span id="humidity">Humidity: ${data.main.humidity}%</span>
    <span id="wind">Wind: ${data.wind.speed} m/s</span>
    <span>🌅 ${sunrise}</span>
    <span>🌇 ${sunset}</span>
  `;
}

// Render forecast
function renderForecast(days) {
  forecastSection.classList.remove("hidden");
  forecastCards.innerHTML = "";

  days.forEach(d => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <small>${d.day}</small>
      <img src="${iconUrl(d.icon)}">
      <div>${d.temp}°C</div>
    `;
    forecastCards.appendChild(card);
  });
}

// Search
async function searchCity(city) {
  try {
    showStatus("Loading...");
    showLoader(true);

    const current = await fetchCurrentByCity(city);
    renderCurrent(current);

    const forecast = await fetchForecast(current.coord.lat, current.coord.lon);
    renderForecast(forecast);

    showStatus("");
    showLoader(false);
  } catch (err) {
    showStatus(err.message, true);
    showLoader(false);
  }
}

// Location
locBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    const current = await fetchCurrentByCoords(latitude, longitude);
    renderCurrent(current);
    const forecast = await fetchForecast(latitude, longitude);
    renderForecast(forecast);
  });
};

// Events
searchBtn.onclick = () => {
  if (cityInput.value) searchCity(cityInput.value);
};

// Load default
searchCity("London");
