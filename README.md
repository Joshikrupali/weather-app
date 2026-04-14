# Weather App

A React + Vite weather app that fetches temperature data using WeatherAPI.

## Prerequisites

- Node.js 18+
- npm
- A WeatherAPI key from https://www.weatherapi.com/

## Environment setup

1. Copy `.env.example` to `.env`.
2. Set your WeatherAPI key:

```env
VITE_WEATHERAPI_KEY=your_actual_weatherapi_key
```

3. Restart the Vite dev server after changing env values.

## Install and run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- The app searches by village name.
- If an exact village is not found, it automatically falls back to the nearest available location.
- Temperature is returned in Celsius.
