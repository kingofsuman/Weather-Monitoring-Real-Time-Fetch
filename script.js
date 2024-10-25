const API_KEY = '50dd078f95c2b12bad2aaae20785e944'; // Your OpenWeatherMap API key

// Major cities database with country codes
const majorCities = [
    
    { city: "Delhi", country: "IN", fullName: "Delhi,India" },
    { city: "Chennai", country: "IN", fullName: " Chennai,India" },
    { city: "Bangalore", country: "IN", fullName: "  Bangalore,India" },
    { city: "Kolkata", country: "IN", fullName: "  Kolkata,India" },
    { city: "Hyderabad", country: "IN", fullName: "Hyderabad,India" },
    { city: "Berlin", country: "DE", fullName: "Berlin, Germany" },
    { city: "Rome", country: "IT", fullName: "Rome, Italy" },
    { city: "Madrid", country: "ES", fullName: "Madrid, Spain" },
    { city: "Toronto", country: "CA", fullName: "Toronto, Canada" },
    { city: "Dubai", country: "AE", fullName: "Dubai, UAE" },
    { city: "Singapore", country: "SG", fullName: "Singapore" },
    { city: "Hong Kong", country: "HK", fullName: "Hong Kong" },
    { city: "Mumbai", country: "IN", fullName: "Mumbai, India" },
    { city: "Rio de Janeiro", country: "BR", fullName: "Rio de Janeiro, Brazil" },
    { city: "Cape Town", country: "ZA", fullName: "Cape Town, South Africa" },
    { city: "Moscow", country: "RU", fullName: "Moscow, Russia" },
    { city: "Beijing", country: "CN", fullName: "Beijing, China" },
    { city: "Amsterdam", country: "NL", fullName: "Amsterdam, Netherlands" },
    { city: "Vienna", country: "AT", fullName: "Vienna, Austria" },
    { city: "Stockholm", country: "SE", fullName: "Stockholm, Sweden" }
];

let selectedIndex = -1;
let dailySummaries = []; // Array to hold daily summaries
let temperatureUnit = 'Celsius'; // Default temperature unit

function showSuggestions(input) {
    const suggestionsDiv = document.getElementById('suggestions');
    const inputValue = input.toLowerCase();
    
    if (inputValue.length < 2) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const matchingCities = majorCities.filter(city => 
        city.fullName.toLowerCase().includes(inputValue) ||
        city.city.toLowerCase().includes(inputValue)
    );

    if (matchingCities.length > 0) {
        const suggestionHtml = matchingCities.map((city, index) => `
            <div class="suggestion-item ${index === selectedIndex ? 'selected' : ''}" 
                 onclick="selectCity('${city.city}, ${city.country}')">
                <div>${city.city}</div>
                <div class="city-info">${city.fullName}</div>
            </div>
        `).join('');
        
        suggestionsDiv.innerHTML = suggestionHtml;
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

function selectCity(cityCountry) {
    document.getElementById('cityInput').value = cityCountry;
    document.getElementById('suggestions').style.display = 'none';
    getWeather();
}

async function getWeather() {
    const cityInput = document.getElementById('cityInput');
    const weatherInfo = document.getElementById('weatherInfo');
    const dailySummariesDiv = document.getElementById('dailySummaries');
    const city = cityInput.value.trim();

    if (!city) {
        weatherInfo.innerHTML = '<div class="error">Please enter a city name</div>';
        return;
    }

    weatherInfo.innerHTML = '<div class="loading">Loading weather data...</div>';
    
    try {
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`
        );

        if (currentWeatherResponse.status === 401) {
            throw new Error('Invalid API key. Please check your OpenWeatherMap API key');
        }
        
        if (currentWeatherResponse.status === 404) {
            throw new Error(`City "${city}" not found. Please check the spelling and try again`);
        }

        if (!currentWeatherResponse.ok) {
            throw new Error(`Weather service error: ${currentWeatherResponse.statusText}`);
        }

        const weatherData = await currentWeatherResponse.json();

        // Convert temperature from Kelvin based on user preference
        let temperature;
        if (temperatureUnit === 'Celsius') {
            temperature = weatherData.main.temp - 273.15; // Convert Kelvin to Celsius
        } else {
            temperature = (weatherData.main.temp - 273.15) * 9/5 + 32; // Convert Kelvin to Fahrenheit
        }

        // Display current weather data
        weatherInfo.innerHTML = `
            <h2>${weatherData.name}, ${weatherData.sys.country}</h2>
            <p>Temperature: ${temperature.toFixed(2)} °${temperatureUnit === 'Celsius' ? 'C' : 'F'}</p>
            <p>Humidity: ${weatherData.main.humidity}%</p>
            <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
            <p>Weather: ${weatherData.weather[0].description}</p>
        `;

        // Simulate daily summaries for the next 5 days
        dailySummaries = [];
        for (let i = 1; i <= 5; i++) {
            const dailyTemperature = temperature + (Math.random() * 10 - 5); // Simulate some variation
            const dailyHumidity = weatherData.main.humidity + (Math.random() * 5 - 2.5);
            const dailyCondition = weatherData.weather[0].description;
            dailySummaries.push({ day: i, temperature: dailyTemperature, humidity: dailyHumidity, condition: dailyCondition });
        }

        // Display daily summaries
        displayDailySummaries(dailySummaries);

    } catch (error) {
        weatherInfo.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

function displayDailySummaries(summaries) {
    const dailySummariesDiv = document.getElementById('dailySummaries');
    dailySummariesDiv.innerHTML = '';

    summaries.forEach(summary => {
        dailySummariesDiv.innerHTML += `
            <div class="summary-item">
                <h3>Day ${summary.day}</h3>
                <p>Temperature: ${summary.temperature.toFixed(2)} °${temperatureUnit === 'Celsius' ? 'C' : 'F'}</p>
                <p>Humidity: ${summary.humidity.toFixed(2)}%</p>
                <p>Condition: ${summary.condition}</p>
            </div>
        `;
    });
}

function setTemperatureUnit() {
    const selectedUnit = document.querySelector('input[name="unit"]:checked').value;
    temperatureUnit = selectedUnit;
    getWeather(); // Fetch the weather data again with the new unit
}

// Keyboard navigation for suggestions
document.getElementById('cityInput').addEventListener('input', (e) => {
    showSuggestions(e.target.value);
});

document.getElementById('cityInput').addEventListener('keydown', (e) => {
    const suggestionItems = document.getElementsByClassName('suggestion-item');
    switch (e.key) {
        case 'ArrowDown':
            selectedIndex = Math.min(selectedIndex + 1, suggestionItems.length - 1);
            updateSelection();
            break;
        case 'ArrowUp':
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection();
            break;
        case 'Enter':
            if (selectedIndex >= 0) {
                selectCity(suggestionItems[selectedIndex].innerText);
            }
            break;
        default:
            selectedIndex = -1; // Reset on other keys
            break;
    }
});

function updateSelection() {
    const suggestions = document.getElementById('suggestions');
    const suggestionItems = suggestions.getElementsByClassName('suggestion-item');
    
    for (let i = 0; i < suggestionItems.length; i++) {
        suggestionItems[i].classList.remove('selected');
    }
    
    if (selectedIndex >= 0) {
        suggestionItems[selectedIndex].classList.add('selected');
    }
}
