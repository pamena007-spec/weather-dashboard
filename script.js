/* ==========================================================
   Weather Dashboard - script.js
   Uses the Open-Meteo Geocoding API and Forecast API
   (no API key required).
   ========================================================== */

// ----- API endpoints -----
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// City shown when the page first loads
const DEFAULT_CITY = "Chennai";

// ----- DOM elements -----
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const weatherCard = document.getElementById("weather-card");

const cityNameEl = document.getElementById("city-name");
const countryEl = document.getElementById("country");
const dateTimeEl = document.getElementById("date-time");
const iconEl = document.getElementById("weather-icon");
const temperatureEl = document.getElementById("temperature");
const conditionEl = document.getElementById("condition");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");

// ----- Weather code lookup (WMO codes used by Open-Meteo) -----
const WEATHER_CODES = {
  0:  { label: "Clear Sky",           icon: "☀️", nightIcon: "🌙" },
  1:  { label: "Mainly Clear",        icon: "🌤️", nightIcon: "🌙" },
  2:  { label: "Partly Cloudy",       icon: "⛅", nightIcon: "☁️" },
  3:  { label: "Overcast",            icon: "☁️" },
  45: { label: "Foggy",               icon: "🌫️" },
  48: { label: "Foggy (Rime Fog)",    icon: "🌫️" },
  51: { label: "Light Drizzle",       icon: "🌦️" },
  53: { label: "Drizzle",             icon: "🌦️" },
  55: { label: "Heavy Drizzle",       icon: "🌦️" },
  56: { label: "Freezing Drizzle",    icon: "🌧️" },
  57: { label: "Freezing Drizzle",    icon: "🌧️" },
  61: { label: "Light Rain",          icon: "🌧️" },
  63: { label: "Rain",                icon: "🌧️" },
  65: { label: "Heavy Rain",          icon: "🌧️" },
  66: { label: "Freezing Rain",       icon: "🌧️" },
  67: { label: "Freezing Rain",       icon: "🌧️" },
  71: { label: "Light Snow",          icon: "🌨️" },
  73: { label: "Snow",                icon: "❄️" },
  75: { label: "Heavy Snow",          icon: "❄️" },
  77: { label: "Snow Grains",         icon: "❄️" },
  80: { label: "Light Rain Showers",  icon: "🌦️" },
  81: { label: "Rain Showers",        icon: "🌧️" },
  82: { label: "Violent Rain Showers", icon: "⛈️" },
  85: { label: "Light Snow Showers",  icon: "🌨️" },
  86: { label: "Heavy Snow Showers",  icon: "❄️" },
  95: { label: "Thunderstorm",        icon: "⛈️" },
  96: { label: "Thunderstorm with Hail", icon: "⛈️" },
  99: { label: "Thunderstorm with Heavy Hail", icon: "⛈️" }
};

/** Convert a weather code into a readable label and icon. */
function getWeatherInfo(code, isDay) {
  const info = WEATHER_CODES[code] || { label: "Unknown", icon: "🌡️" };
  const icon = !isDay && info.nightIcon ? info.nightIcon : info.icon;
  return { label: info.label, icon };
}

// ----- UI helper functions -----

function showLoading(isLoading) {
  loadingEl.classList.toggle("hidden", !isLoading);
  searchBtn.disabled = isLoading;
  cityInput.disabled = isLoading;
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function clearError() {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}

/** Format an Open-Meteo time string like "2026-10-07T06:02" as a time (e.g. 6:02 AM). */
function formatTime(isoString) {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Format an Open-Meteo time string as a full date and time in the city's local time. */
function formatDateTime(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

/** Show a value with a unit, or "N/A" when the API did not return it. */
function formatValue(value, unit) {
  return value === undefined || value === null ? "N/A" : `${Math.round(value)}${unit}`;
}

// ----- API functions -----

/** Step 1: turn a city name into coordinates using the geocoding API. */
async function fetchCityCoordinates(city) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("GEOCODING_FAILED");
  }

  const data = await response.json();

  // The API leaves out "results" entirely when nothing matches
  if (!data.results || data.results.length === 0) {
    throw new Error("CITY_NOT_FOUND");
  }

  const { name, country, latitude, longitude } = data.results[0];
  return { name, country: country || "Unknown country", latitude, longitude };
}

/** Step 2: get the current weather for those coordinates. */
async function fetchCurrentWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
    daily: "sunrise,sunset",
    wind_speed_unit: "kmh",
    temperature_unit: "celsius",
    timezone: "auto",
    forecast_days: 1
  });

  const response = await fetch(`${WEATHER_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("WEATHER_FAILED");
  }

  const data = await response.json();

  // Make sure the data we need is really there
  if (!data.current || typeof data.current.temperature_2m !== "number") {
    throw new Error("BAD_RESPONSE");
  }

  return data;
}

// ----- Display function -----

/** Put the weather data on the page. */
function displayWeather(place, weather) {
  const { current, daily, current_units } = weather;
  const { label, icon } = getWeatherInfo(current.weather_code, current.is_day === 1);

  cityNameEl.textContent = place.name;
  countryEl.textContent = place.country;
  dateTimeEl.textContent = formatDateTime(current.time);
  iconEl.textContent = icon;
  temperatureEl.textContent = `${Math.round(current.temperature_2m)}°C`;
  conditionEl.textContent = label;
  feelsLikeEl.textContent = formatValue(current.apparent_temperature, "°C");
  humidityEl.textContent = formatValue(current.relative_humidity_2m, "%");
  windEl.textContent = formatValue(current.wind_speed_10m, " km/h");
  sunriseEl.textContent = formatTime(daily && daily.sunrise && daily.sunrise[0]);
  sunsetEl.textContent = formatTime(daily && daily.sunset && daily.sunset[0]);

  weatherCard.classList.remove("hidden");

  // Restart the small entrance animation on every new search
  weatherCard.style.animation = "none";
  void weatherCard.offsetWidth;
  weatherCard.style.animation = "";
}

/** Turn an error into a friendly message for the user. */
function getFriendlyMessage(error) {
  switch (error.message) {
    case "CITY_NOT_FOUND":
      return "City not found. Check the spelling and try again.";
    case "GEOCODING_FAILED":
    case "WEATHER_FAILED":
      return "The weather service is not responding right now. Please try again later.";
    case "BAD_RESPONSE":
      return "The weather service sent unexpected data. Please try again.";
    default:
      // fetch() throws a TypeError when the network is down
      return "Could not connect. Check your internet connection and try again.";
  }
}

// ----- Main flow -----

/** Look up a city and show its weather. */
async function searchWeather(city) {
  clearError();
  showLoading(true);

  try {
    const place = await fetchCityCoordinates(city);
    const weather = await fetchCurrentWeather(place.latitude, place.longitude);
    displayWeather(place, weather);
  } catch (error) {
    weatherCard.classList.add("hidden");
    showError(getFriendlyMessage(error));
  } finally {
    showLoading(false);
    cityInput.focus();
  }
}

/** Handle the form submit (Search button click or Enter key). */
function handleSearch(event) {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  // Only letters, spaces, apostrophes, dots and hyphens (supports accents)
  if (!/^[\p{L}\s.'-]+$/u.test(city)) {
    showError("Please enter a valid city name (letters only).");
    return;
  }

  searchWeather(city);
}

// ----- Events -----
searchForm.addEventListener("submit", handleSearch);

// Load the default city when the page opens
document.addEventListener("DOMContentLoaded", () => {
  searchWeather(DEFAULT_CITY);
});
