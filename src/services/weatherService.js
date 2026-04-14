const WEATHER_API_BASE_URL = "https://api.weatherapi.com/v1";
const OPEN_METEO_GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const API_KEY = import.meta.env.VITE_WEATHERAPI_KEY;
const hasWeatherApiKey = Boolean(API_KEY);
const REGIONAL_CITY_COUNT = 5;
const CITY_SEARCH_SEEDS = ["new", "san", "sa", "de", "be", "ka", "ma", "la", "ra", "ta", "na", "co", "bo", "ba", "po", "al"];
const REGIONAL_CITY_FALLBACKS = {
    countries: {
        IN: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune"],
        US: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"],
        GB: ["London", "Birmingham", "Manchester", "Leeds", "Liverpool", "Glasgow"],
    },
    states: {
        "IN|MAHARASHTRA": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad"],
        "IN|KARNATAKA": ["Bengaluru", "Mysuru", "Hubli", "Mangalore", "Belgaum", "Davanagere"],
        "IN|TAMILNADU": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur"],
    },
};

const STATE_TO_MAJOR_CITY = {
    gujarat: "Ahmedabad",
    maharashtra: "Mumbai",
    karnataka: "Bengaluru",
    tamilnadu: "Chennai",
    delhi: "Delhi",
    rajasthan: "Jaipur",
    uttarpradesh: "Lucknow",
    westbengal: "Kolkata",
    telangana: "Hyderabad",
    andhrapradesh: "Visakhapatnam",
    kerala: "Kochi",
    punjab: "Ludhiana",
    haryana: "Gurugram",
    madhyapradesh: "Indore",
    bihar: "Patna",
    odisha: "Bhubaneswar",
    assam: "Guwahati",
    himachalpradesh: "Shimla",
    jharkhand: "Ranchi",
    chhattisgarh: "Raipur",
};

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const normalizeText = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const uniqueNonEmpty = (values) => {
    const seen = new Set();
    const result = [];

    for (const value of values) {
        const text = String(value || "").trim();
        if (!text) {
            continue;
        }

        const key = normalizeText(text);
        if (!key || seen.has(key)) {
            continue;
        }

        seen.add(key);
        result.push(text);
    }

    return result;
};

const parseLocationInput = (input) => {
    const raw = String(input || "").trim();
    const segments = raw.split(",").map((part) => part.trim()).filter(Boolean);

    const cityOrVillage = segments[0] || raw;
    const state = segments.length >= 3 ? segments[1] : "";
    const country = segments.length >= 2 ? segments[segments.length - 1] : "";

    const fullQuery = segments.join(", ");
    const cityStateCountry = cityOrVillage && state && country ? `${cityOrVillage}, ${state}, ${country}` : "";
    const cityCountry = cityOrVillage && country ? `${cityOrVillage}, ${country}` : "";

    return {
        raw,
        cityOrVillage,
        state,
        country,
        queryCandidates: uniqueNonEmpty([fullQuery, cityStateCountry, cityCountry, cityOrVillage]),
    };
};

const getMappedCityFromState = (stateName) => {
    const key = normalizeText(stateName);
    return STATE_TO_MAJOR_CITY[key] || "";
};

const withDisplayLocationOverride = (weatherInfo, stateName, countryName) => {
    const state = String(stateName || "").trim();
    const country = String(countryName || "").trim();

    if (!state) {
        return weatherInfo;
    }

    const displayLabel = [state, country].filter(Boolean).join(", ");

    return {
        ...weatherInfo,
        city: displayLabel,
        resolvedLocationName: displayLabel,
        locationName: state,
        locationRegion: state,
        locationCountry: country || weatherInfo.locationCountry || "",
    };
};

const roundTo = (value, decimals = 1) => {
    const numeric = toNumber(value);
    if (numeric === null) {
        return null;
    }

    const factor = 10 ** decimals;
    return Math.round(numeric * factor) / factor;
};

const getResolvedLocationName = (location = {}) => {
    return [location.name, location.region, location.country].filter(Boolean).join(", ");
};

const isLocationNameExact = (inputVillageName, location = {}) => {
    const target = normalizeText(inputVillageName);
    if (!target) {
        return false;
    }

    const candidates = [
        location.name,
        `${location.name || ""} ${location.region || ""}`,
        `${location.name || ""} ${location.country || ""}`,
        `${location.name || ""} ${location.region || ""} ${location.country || ""}`,
    ]
        .map(normalizeText)
        .filter(Boolean);

    return candidates.some((candidate) => candidate === target);
};

const weatherCodeText = {
    0: "clear sky",
    1: "mainly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "fog",
    48: "depositing rime fog",
    51: "light drizzle",
    53: "moderate drizzle",
    55: "dense drizzle",
    56: "light freezing drizzle",
    57: "dense freezing drizzle",
    61: "slight rain",
    63: "moderate rain",
    65: "heavy rain",
    66: "light freezing rain",
    67: "heavy freezing rain",
    71: "slight snow",
    73: "moderate snow",
    75: "heavy snow",
    77: "snow grains",
    80: "slight rain showers",
    81: "moderate rain showers",
    82: "violent rain showers",
    85: "slight snow showers",
    86: "heavy snow showers",
    95: "thunderstorm",
    96: "thunderstorm with slight hail",
    99: "thunderstorm with heavy hail",
};

const fetchJson = async (url) => {
    let response;
    try {
        response = await fetch(url);
    } catch {
        throw new Error("Network error while fetching weather data.");
    }

    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const apiMessage = data?.error?.message;
        throw new Error(apiMessage || "Unable to fetch weather data.");
    }

    return data;
};

const fetchOpenMeteoLocations = async (name, options = {}) => {
    const params = new URLSearchParams({
        name,
        count: String(options.count || 20),
        language: "en",
        format: "json",
    });

    if (options.countryCode) {
        params.set("countryCode", options.countryCode);
    }

    const data = await fetchJson(`${OPEN_METEO_GEOCODE_URL}?${params.toString()}`);
    return Array.isArray(data?.results) ? data.results : [];
};

const fetchNominatimRegion = async (input) => {
    const params = new URLSearchParams({
        q: input,
        format: "json",
        limit: "1",
        addressdetails: "1",
    });

    try {
        const data = await fetchJson(`${NOMINATIM_SEARCH_URL}?${params.toString()}`);
        if (!Array.isArray(data) || data.length === 0) {
            return null;
        }

        const first = data[0] || {};
        const address = first.address || {};
        const addresstype = String(first.addresstype || "").toLowerCase();
        const countryCode = String(address.country_code || "").toUpperCase();
        const country = address.country || "";

        if (!countryCode || !country) {
            return null;
        }

        if (addresstype === "country") {
            return {
                type: "country",
                countryCode,
                country,
                label: country,
            };
        }

        if (["state", "region", "province"].includes(addresstype)) {
            const state = address.state || address.region || address.province || "";
            if (!state) {
                return null;
            }

            return {
                type: "state",
                countryCode,
                country,
                state,
                label: `${state}, ${country}`,
            };
        }

        return null;
    } catch {
        return null;
    }
};

const mapCurrentWeather = (data) => {
    const location = data?.location;
    const current = data?.current;

    if (!location || !current) {
        throw new Error("Invalid weather data received from WeatherAPI.");
    }

    const resolvedLocationName = getResolvedLocationName(location);
    const tempC = toNumber(current.temp_c);

    return {
        city: resolvedLocationName || "Unknown location",
        resolvedLocationName: resolvedLocationName || "Unknown location",
        locationName: location.name || "",
        locationRegion: location.region || "",
        locationCountry: location.country || "",
        temperatureC: tempC,
        temp: tempC,
        tempMin: tempC,
        tempMax: tempC,
        humidity: toNumber(current.humidity),
        feelsLike: toNumber(current.feelslike_c),
        weather: current?.condition?.text || "Weather unavailable",
        lat: toNumber(location.lat),
        lon: toNumber(location.lon),
    };
};

const mapOpenMeteoCurrentWeather = (location, forecastData) => {
    const current = forecastData?.current;

    if (!location || !current) {
        throw new Error("Invalid weather data received from fallback weather provider.");
    }

    const resolvedLocationName = getResolvedLocationName(location);
    const tempC = toNumber(current.temperature_2m);

    return {
        city: resolvedLocationName || "Unknown location",
        resolvedLocationName: resolvedLocationName || "Unknown location",
        locationName: location.name || "",
        locationRegion: location.region || "",
        locationCountry: location.country || "",
        temperatureC: tempC,
        temp: tempC,
        tempMin: tempC,
        tempMax: tempC,
        humidity: toNumber(current.relative_humidity_2m),
        feelsLike: toNumber(current.apparent_temperature),
        weather: weatherCodeText[current.weather_code] || "Weather unavailable",
        lat: toNumber(location.lat),
        lon: toNumber(location.lon),
    };
};

const matchesResolvedLocation = (query, weatherInfo) => {
    return isLocationNameExact(query, {
        name: weatherInfo.locationName,
        region: weatherInfo.locationRegion,
        country: weatherInfo.locationCountry,
    });
};

const fetchCurrentByQuery = async (query) => {
    const requestUrl = `${WEATHER_API_BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(query)}&aqi=no`;
    const data = await fetchJson(requestUrl);
    return mapCurrentWeather(data);
};

const fetchNearestSearchMatch = async (villageName) => {
    const parsed = parseLocationInput(villageName);

    for (const candidate of parsed.queryCandidates) {
        const requestUrl = `${WEATHER_API_BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(candidate)}`;
        const matches = await fetchJson(requestUrl);

        if (Array.isArray(matches) && matches.length > 0) {
            return matches[0];
        }
    }

    throw new Error("Village not found and no nearby locations are available.");
};

const findOpenMeteoNearestLocation = async (villageName) => {
    const parsed = parseLocationInput(villageName);

    for (const candidate of parsed.queryCandidates) {
        const requestUrl = `${OPEN_METEO_GEOCODE_URL}?name=${encodeURIComponent(candidate)}&count=10&language=en&format=json`;
        const data = await fetchJson(requestUrl);
        const results = Array.isArray(data?.results) ? data.results : [];

        if (results.length === 0) {
            continue;
        }

        const exact = results.find((location) => isLocationNameExact(candidate, {
            name: location.name,
            region: location.admin1,
            country: location.country,
        }));

        const best = exact || results[0];

        return {
            name: best.name || "",
            region: best.admin1 || "",
            country: best.country || "",
            lat: toNumber(best.latitude),
            lon: toNumber(best.longitude),
        };
    }

    throw new Error("Village not found and no nearby locations are available.");
};

const fetchOpenMeteoByCoordinates = async (lat, lon, locationMeta = {}) => {
    const requestUrl = `${OPEN_METEO_FORECAST_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&timezone=auto`;
    const data = await fetchJson(requestUrl);

    const location = {
        name: locationMeta.name || `Lat ${lat.toFixed(2)}`,
        region: locationMeta.region || "",
        country: locationMeta.country || "",
        lat,
        lon,
    };

    return mapOpenMeteoCurrentWeather(location, data);
};

const fetchWeatherForLocationMeta = async (locationMeta) => {
    const lat = toNumber(locationMeta.lat);
    const lon = toNumber(locationMeta.lon);

    if (lat === null || lon === null) {
        throw new Error("Invalid city coordinates while calculating regional average.");
    }

    if (hasWeatherApiKey) {
        try {
            return await fetchCurrentByQuery(`${lat},${lon}`);
        } catch {
            return await fetchOpenMeteoByCoordinates(lat, lon, locationMeta);
        }
    }

    return await fetchOpenMeteoByCoordinates(lat, lon, locationMeta);
};

const deduplicateCityLocations = (locations) => {
    const unique = new Map();

    for (const location of locations) {
        const key = [location.name, location.region, location.country].map(normalizeText).join("|");
        if (!key) {
            continue;
        }

        if (!unique.has(key)) {
            unique.set(key, location);
        }
    }

    return [...unique.values()];
};

const selectBestLocationForCityName = (locations, cityName, regionMeta) => {
    if (!Array.isArray(locations) || locations.length === 0) {
        return null;
    }

    const placeRows = locations
        .filter((result) => String(result?.feature_code || "").startsWith("PPL"))
        .map((result) => ({
            name: result.name || "",
            region: result.admin1 || "",
            country: result.country || regionMeta.country,
            lat: toNumber(result.latitude),
            lon: toNumber(result.longitude),
            population: toNumber(result.population) || 0,
        }))
        .filter((result) => result.name && result.lat !== null && result.lon !== null);

    const exactName = placeRows.filter((item) => normalizeText(item.name) === normalizeText(cityName));
    const scopedRows = regionMeta.type === "state"
        ? exactName.filter((item) => normalizeText(item.region) === normalizeText(regionMeta.state))
        : exactName;

    const candidates = scopedRows.length > 0 ? scopedRows : (exactName.length > 0 ? exactName : placeRows);

    if (candidates.length === 0) {
        return null;
    }

    return candidates.sort((a, b) => b.population - a.population)[0];
};

const resolveFallbackCities = async (regionMeta) => {
    const stateKey = `${regionMeta.countryCode}|${normalizeText(regionMeta.state || "")}`;
    const stateFallback = regionMeta.type === "state" ? REGIONAL_CITY_FALLBACKS.states[stateKey.toUpperCase()] : null;
    const countryFallback = REGIONAL_CITY_FALLBACKS.countries[regionMeta.countryCode] || [];
    const cityNames = (stateFallback || countryFallback).slice(0, REGIONAL_CITY_COUNT + 2);

    if (cityNames.length === 0) {
        return [];
    }

    const resolved = await Promise.all(cityNames.map(async (cityName) => {
        const rows = await fetchOpenMeteoLocations(cityName, { count: 20, countryCode: regionMeta.countryCode });
        return selectBestLocationForCityName(rows, cityName, regionMeta);
    }));

    return deduplicateCityLocations(resolved.filter(Boolean)).slice(0, REGIONAL_CITY_COUNT);
};

const pickMajorCitiesForRegion = async (regionMeta) => {
    const searches = CITY_SEARCH_SEEDS.map((seed) => fetchOpenMeteoLocations(seed, {
        count: 50,
        countryCode: regionMeta.countryCode,
    }));

    const searchResults = await Promise.all(searches);

    let candidates = searchResults
        .flat()
        .filter((result) => String(result?.feature_code || "").startsWith("PPL"))
        .map((result) => ({
            name: result.name || "",
            region: result.admin1 || "",
            country: result.country || regionMeta.country,
            lat: toNumber(result.latitude),
            lon: toNumber(result.longitude),
            population: toNumber(result.population) || 0,
        }))
        .filter((result) => result.name && result.lat !== null && result.lon !== null);

    if (regionMeta.type === "state") {
        const stateKey = normalizeText(regionMeta.state);
        candidates = candidates.filter((result) => normalizeText(result.region) === stateKey);
    }

    const uniqueCandidates = deduplicateCityLocations(candidates)
        .sort((a, b) => b.population - a.population)
        .slice(0, REGIONAL_CITY_COUNT);

    if (uniqueCandidates.length >= REGIONAL_CITY_COUNT) {
        return uniqueCandidates;
    }

    const fallbackCandidates = await resolveFallbackCities(regionMeta);
    const merged = deduplicateCityLocations([...uniqueCandidates, ...fallbackCandidates])
        .sort((a, b) => b.population - a.population)
        .slice(0, REGIONAL_CITY_COUNT);

    if (merged.length < REGIONAL_CITY_COUNT) {
        throw new Error(`Could not find ${REGIONAL_CITY_COUNT} major cities for ${regionMeta.label}. Try a nearby city name instead.`);
    }

    return merged;
};

const buildRegionalAverageWeather = (regionMeta, cities, weatherRows) => {
    const validRows = weatherRows.filter((item) => toNumber(item.temp) !== null);

    if (validRows.length === 0) {
        throw new Error(`Unable to calculate average temperature for ${regionMeta.label}.`);
    }

    const temps = validRows.map((item) => item.temp);
    const humidities = validRows.map((item) => toNumber(item.humidity)).filter((value) => value !== null);
    const feelsLikeValues = validRows.map((item) => toNumber(item.feelsLike)).filter((value) => value !== null);

    const tempAvg = temps.reduce((sum, value) => sum + value, 0) / temps.length;
    const humidityAvg = humidities.length > 0 ? humidities.reduce((sum, value) => sum + value, 0) / humidities.length : null;
    const feelsLikeAvg = feelsLikeValues.length > 0 ? feelsLikeValues.reduce((sum, value) => sum + value, 0) / feelsLikeValues.length : null;
    const cityNames = cities.slice(0, REGIONAL_CITY_COUNT).map((item) => item.name);
    const safeTempAvg = roundTo(tempAvg, 1);
    const safeHumidity = humidityAvg === null ? 0 : Math.round(humidityAvg);
    const safeFeelsLike = feelsLikeAvg === null ? safeTempAvg : roundTo(feelsLikeAvg, 1);

    return {
        city: regionMeta.label,
        resolvedLocationName: regionMeta.label,
        locationName: regionMeta.type === "state" ? regionMeta.state : regionMeta.country,
        locationRegion: regionMeta.type === "state" ? regionMeta.state : "",
        locationCountry: regionMeta.country,
        temperatureC: safeTempAvg,
        temp: safeTempAvg,
        tempMin: roundTo(Math.min(...temps), 1),
        tempMax: roundTo(Math.max(...temps), 1),
        humidity: safeHumidity,
        feelsLike: safeFeelsLike,
        weather: "Weather overview",
        lat: null,
        lon: null,
        isRegionalAverage: true,
        sampleCities: cityNames,
    };
};

const validateCoordinates = (latitude, longitude) => {
    const lat = toNumber(latitude);
    const lon = toNumber(longitude);

    if (lat === null || lon === null) {
        throw new Error("Latitude and longitude must be valid numbers.");
    }

    if (lat < -90 || lat > 90) {
        throw new Error("Latitude must be between -90 and 90.");
    }

    if (lon < -180 || lon > 180) {
        throw new Error("Longitude must be between -180 and 180.");
    }

    return { lat, lon };
};

export async function fetchWeatherByCoordinates(latitude, longitude) {
    const { lat, lon } = validateCoordinates(latitude, longitude);

    if (!hasWeatherApiKey) {
        return await fetchOpenMeteoByCoordinates(lat, lon);
    }

    const weather = await fetchCurrentByQuery(`${lat},${lon}`);
    return { ...weather, lat, lon };
}

export async function fetchWeatherByVillage(villageName) {
    const normalizedVillageName = String(villageName || "").trim();

    if (!normalizedVillageName) {
        throw new Error("Village name is required.");
    }

    const parsed = parseLocationInput(normalizedVillageName);

    if (!hasWeatherApiKey) {
        const nearest = await findOpenMeteoNearestLocation(normalizedVillageName);
        return await fetchOpenMeteoByCoordinates(nearest.lat, nearest.lon, nearest);
    }

    let firstSuccessfulWeather = null;

    for (const candidate of parsed.queryCandidates) {
        try {
            const weather = await fetchCurrentByQuery(candidate);

            if (!firstSuccessfulWeather) {
                firstSuccessfulWeather = weather;
            }

            if (matchesResolvedLocation(candidate, weather)) {
                return weather;
            }
        } catch {
            // Continue trying more specific/less specific query variants.
        }
    }

    if (firstSuccessfulWeather) {
        return firstSuccessfulWeather;
    }

    try {
        const nearest = await fetchNearestSearchMatch(normalizedVillageName);
        return await fetchCurrentByQuery(`${nearest.lat},${nearest.lon}`);
    } catch (error) {
        if (!/No matching location found/i.test(error.message)) {
            throw error;
        }

        const nearest = await fetchNearestSearchMatch(normalizedVillageName);
        return await fetchCurrentByQuery(`${nearest.lat},${nearest.lon}`);
    }
}

export async function fetchWeatherByCityAndState(cityOrVillageName, stateName) {
    const city = String(cityOrVillageName || "").trim();
    const state = String(stateName || "").trim();

    if (!city || !state) {
        throw new Error("Please enter both city/village name and state name.");
    }

    const combinedQuery = `${city}, ${state}`;
    const normalizedState = normalizeText(state);

    if (hasWeatherApiKey) {
        const searchCombinedUrl = `${WEATHER_API_BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(combinedQuery)}`;
        const combinedMatches = await fetchJson(searchCombinedUrl);

        let matched = Array.isArray(combinedMatches)
            ? combinedMatches.find((item) => normalizeText(item?.region) === normalizedState)
            : null;

        if (!matched) {
            const searchCityUrl = `${WEATHER_API_BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(city)}`;
            const cityMatches = await fetchJson(searchCityUrl);
            matched = Array.isArray(cityMatches)
                ? cityMatches.find((item) => normalizeText(item?.region) === normalizedState)
                : null;
        }

        if (!matched) {
            throw new Error("Location not found in the specified state.");
        }

        return await fetchCurrentByQuery(`${matched.lat},${matched.lon}`);
    }

    const geoCombined = await fetchOpenMeteoLocations(combinedQuery, { count: 20 });
    let fallbackMatch = geoCombined.find((item) => normalizeText(item?.admin1) === normalizedState);

    if (!fallbackMatch) {
        const geoCityOnly = await fetchOpenMeteoLocations(city, { count: 30 });
        fallbackMatch = geoCityOnly.find((item) => normalizeText(item?.admin1) === normalizedState);
    }

    if (!fallbackMatch) {
        throw new Error("Location not found in the specified state.");
    }

    return await fetchOpenMeteoByCoordinates(
        toNumber(fallbackMatch.latitude),
        toNumber(fallbackMatch.longitude),
        {
            name: fallbackMatch.name || city,
            region: fallbackMatch.admin1 || state,
            country: fallbackMatch.country || "",
        }
    );
}

export async function fetchWeatherByFlexibleLocation(cityOrVillageName, stateOrCountryName) {
    const city = String(cityOrVillageName || "").trim();
    const stateCountryInput = String(stateOrCountryName || "").trim();

    if (!city && !stateCountryInput) {
        throw new Error("Location not found");
    }

    const stateCountryParts = stateCountryInput
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

    const state = stateCountryParts[0] || "";
    const country = stateCountryParts.length > 1 ? stateCountryParts[stateCountryParts.length - 1] : "";

    const queryCandidates = uniqueNonEmpty([
        city && state && country ? `${city}, ${state}, ${country}` : "",
        city && stateCountryInput ? `${city}, ${stateCountryInput}` : "",
        city && state ? `${city}, ${state}` : "",
        city && country ? `${city}, ${country}` : "",
        stateCountryInput,
        country,
        state,
        city,
    ]);

    if (queryCandidates.length === 0) {
        throw new Error("Location not found");
    }

    if (hasWeatherApiKey) {
        for (const query of queryCandidates) {
            try {
                return await fetchCurrentByQuery(query);
            } catch {
                // Try next query candidate.
            }
        }

        throw new Error("Location not found");
    }

    for (const query of queryCandidates) {
        try {
            const nearest = await findOpenMeteoNearestLocation(query);
            return await fetchOpenMeteoByCoordinates(nearest.lat, nearest.lon, nearest);
        } catch {
            // Try next query candidate.
        }
    }

    throw new Error("Location not found");
}

export async function fetchWeatherByLocationParts(cityOrVillageName, stateName, countryName) {
    const city = String(cityOrVillageName || "").trim();
    const state = String(stateName || "").trim();
    const country = String(countryName || "").trim();
    const mappedCity = state ? getMappedCityFromState(state) : "";
    const shouldShowStateDisplay = !city && !!state;

    const effectiveCity = city || mappedCity;

    // If a state is entered, map to a major city to improve hit-rate with weather APIs.
    const mappedStateQuery = mappedCity && country ? `${mappedCity}, ${country}` : mappedCity;

    const queryCandidates = uniqueNonEmpty([
        effectiveCity && state && country ? `${effectiveCity}, ${state}, ${country}` : "",
        mappedStateQuery,
        effectiveCity && state && country ? `${effectiveCity}, ${country}` : "",
        !city && state && country ? `${state}, ${country}` : "",
        !city && !state && country ? country : "",
        effectiveCity && !state && !country ? effectiveCity : "",
        city && country ? `${city}, ${country}` : "",
        city && state ? `${city}, ${state}` : "",
    ]);

    if (queryCandidates.length === 0) {
        throw new Error("Location not found");
    }

    if (hasWeatherApiKey) {
        for (const query of queryCandidates) {
            try {
                const weatherInfo = await fetchCurrentByQuery(query);
                return shouldShowStateDisplay
                    ? withDisplayLocationOverride(weatherInfo, state, country)
                    : weatherInfo;
            } catch {
                // Try next query in priority order.
            }
        }

        throw new Error("Location not found");
    }

    for (const query of queryCandidates) {
        try {
            const nearest = await findOpenMeteoNearestLocation(query);
            const weatherInfo = await fetchOpenMeteoByCoordinates(nearest.lat, nearest.lon, nearest);
            return shouldShowStateDisplay
                ? withDisplayLocationOverride(weatherInfo, state, country)
                : weatherInfo;
        } catch {
            // Try next query in priority order.
        }
    }

    throw new Error("Location not found");
}

export async function fetchWeatherByInput(inputName) {
    const normalizedInput = String(inputName || "").trim();

    if (!normalizedInput) {
        throw new Error("Location input is required.");
    }

    const regionMeta = await fetchNominatimRegion(normalizedInput);

    if (regionMeta && (regionMeta.type === "country" || regionMeta.type === "state")) {
        const majorCities = await pickMajorCitiesForRegion(regionMeta);
        const weatherRows = await Promise.all(majorCities.map((city) => fetchWeatherForLocationMeta(city)));
        return buildRegionalAverageWeather(regionMeta, majorCities, weatherRows);
    }

    return await fetchWeatherByVillage(normalizedInput);
}