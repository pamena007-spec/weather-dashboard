# Weather Dashboard Application

## Project Description

A responsive weather dashboard built with plain HTML, CSS and JavaScript. Users search for a city and see its current weather, fetched live from the free Open-Meteo API. No API key or backend is needed. Chennai, India is shown when the page first loads.

## Features

- Search any city by name (button click or Enter key)
- Empty and invalid input validation
- Current temperature (°C), weather condition and icon
- Feels-like temperature, humidity, wind speed (km/h)
- Local date and time of the searched city
- Sunrise and sunset times
- Loading message and friendly error messages
- Responsive layout for mobile, tablet and desktop

## Technologies Used

- HTML5 (semantic elements)
- CSS3 (variables, flexbox, grid, media queries, transitions)
- JavaScript ES6+ (vanilla)
- Fetch API with async/await
- DOM manipulation
- Git and GitHub

## API Used

[Open-Meteo](https://open-meteo.com/) (free, no API key):

- Geocoding API: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast API: `https://api.open-meteo.com/v1/forecast`

## Project Structure

```
weather-dashboard/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How to Run

1. Download or clone the project.
2. Open the `weather-dashboard` folder in VS Code.
3. Install the **Live Server** extension (by Ritwick Dey).
4. Right-click `index.html` and choose **Open with Live Server**.
5. Search for a city such as London, Tokyo or New York.

## How the API Works

Weather APIs need coordinates, not city names, so the app makes two requests:

1. **Geocoding:** the city name (for example "Paris") is sent to the geocoding API. It returns the matching place with its name, country, latitude and longitude. If nothing matches, the response has no `results`, and the app shows "City not found".
2. **Weather:** the latitude and longitude are sent to the forecast API. It returns the current temperature, feels-like temperature, humidity, wind speed, a numeric weather code, and today's sunrise and sunset.

The weather code (WMO standard) is converted into a readable condition and an emoji icon using a lookup object in `script.js`.

## JavaScript Concepts Used

- **ES6+:** `const`/`let`, arrow functions, `URLSearchParams`
- **async/await:** `searchWeather()` awaits each API call in order
- **Fetch API:** `fetch()` requests to both endpoints, `response.json()`
- **DOM manipulation:** `getElementById()`, `textContent`, `classList`
- **Event handling:** `submit` event on the form (covers button and Enter key), `DOMContentLoaded`
- **Error handling:** `try/catch/finally`, custom error messages, `response.ok` checks
- **Functions:** small reusable functions for fetching, formatting and displaying
- **Template literals:** building URLs and text such as `` `${temp}°C` ``
- **Destructuring:** `const { name, country, latitude, longitude } = data.results[0]`

## AI-Assisted Development

AI tools (such as Claude) were used as a helper during development. All generated code was reviewed, run and tested by the developer.

### AI-assisted API integration
- Compared free weather APIs and chose Open-Meteo because it needs no key.
- Generated the two-step flow (geocoding, then weather) and the list of `current` parameters to request.
- Explained the WMO weather codes so they could be mapped to readable conditions.

### AI-assisted debugging
- Pasted unexpected behaviour (for example, a missing `results` field) and asked the AI to explain the cause.
- Used AI suggestions to add `response.ok` checks and `encodeURIComponent()` for city names with spaces.

### AI-assisted error analysis
- Listed possible failures: empty input, unknown city, network failure, bad API response, HTTP errors.
- Mapped each failure to a clear user-facing message instead of console errors.

### AI-assisted documentation
- Drafted this README, code comments and the explanation of how the API works, then edited them for accuracy.

### AI-generated Git commit message suggestions
- Create responsive weather dashboard UI
- Integrate Open-Meteo weather API
- Add city search and validation
- Implement weather error handling
- Improve responsive design and documentation

## Git and GitHub

```bash
git init
git add .
git commit -m "Initial weather dashboard application"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Example commit messages for later changes:

1. `Create responsive weather dashboard UI`
2. `Integrate Open-Meteo weather API`
3. `Add city search and validation`
4. `Implement weather error handling`
5. `Improve responsive design and documentation`
