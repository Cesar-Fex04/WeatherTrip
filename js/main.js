
// Variable global para almacenar la ciudad actual
let currentCity = '';

//Esta función se ejecuta cuando la página termina de cargar
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Aplicación iniciada');
    
    // Inicializar Geocoding (obtener ubicación del usuario)
    await Geocoding.initialize();
    
    // Verificar si hay un parámetro de ciudad en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const cityFromUrl = urlParams.get('city');
    
    if (cityFromUrl) {
        // Si hay ciudad en la URL, buscarla automáticamente
        document.getElementById('cityInput').value = cityFromUrl;
        searchWeather(cityFromUrl);
    }
    
    // Manda a llamar 
    setupEventListeners();
});

// Configurar todos los event listeners de la página 
function setupEventListeners() {
    //Evento de envío del formulario
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', handleFormSubmit);
    
    //Evento de escritura en el input (para autocompletado)
    const cityInput = document.getElementById('cityInput');
    cityInput.addEventListener('input', handleInputChange);
    
    //Evento de click fuera del input (para cerrar sugerencias)
    document.addEventListener('click', function(e) {
        const suggestions = document.getElementById('suggestions');
        if (!e.target.closest('.search-form')) {
            suggestions.classList.remove('show');
        }
    });
}

// Manejar el envío del formulario
function handleFormSubmit(e) {
    // Prevenir que el formulario recargue la página
    e.preventDefault();
    
    // Obtener el valor del input
    const cityInput = document.getElementById('cityInput');
    const cityName = cityInput.value.trim();
    
    // Validar que no esté vacío
    if (!cityName) {
        showError('Por favor ingresa el nombre de una ciudad');
        return;
    }
    
    // Buscar el clima
    searchWeather(cityName);
}


 //Manejar cambios en el input (autocompletado con Geocoding)
function handleInputChange(e) {
    const value = e.target.value.trim();
    const suggestions = document.getElementById('suggestions');
    
    // Si el input está vacío, ocultar sugerencias
    if (!value) {
        suggestions.classList.remove('show');
        suggestions.innerHTML = '';
        return;
    }
    
    // Usar Geocoding con debouncing
    Geocoding.searchWithDebounce(value, (cities) => {
        // Limpiar sugerencias anteriores
        suggestions.innerHTML = '';
        
        // Si no hay resultados, ocultar
        if (cities.length === 0) {
            suggestions.classList.remove('show');
            return;
        }
        
        // Crear elemento para cada ciudad
        cities.forEach((city, index) => {
            const li = document.createElement('li');
            
            // Crear contenido con icono de bandera y distancia
            let content = `
                <div class="suggestion-item">
                    <div class="suggestion-main">
                        <strong>${city.name}</strong>
                        <span class="suggestion-details">${city.state ? city.state + ', ' : ''}${city.country}</span>
                    </div>
            `;
            
            // Mostrar distancia si está disponible
            if (city.distance !== Infinity) {
                content += `
                    <div class="suggestion-distance">
                        <i class="bi bi-geo-alt"></i>
                        ${city.distance} km
                    </div>
                `;
            }
            content += `</div>`;
            
            li.innerHTML = content;
            
            // Evento click en la sugerencia
            li.addEventListener('click', function() {
                // Usar el nombre completo de la ciudad
                document.getElementById('cityInput').value = city.name;
                searchWeather(city.name);
                suggestions.classList.remove('show');
                suggestions.innerHTML = '';
            });
            
            suggestions.appendChild(li);
        });
        
        // Mostrar sugerencias
        suggestions.classList.add('show');
    });
}

//Buscar el clima de una ciudad
async function searchWeather(cityName) {
    try {
        // Limpiar mensajes de error 
        hideError();
        
        //Ocultar resultados anteriores
        document.getElementById('weatherResults').classList.add('d-none');
        
        //Mostrar spinner de carga
        document.getElementById('loadingSpinner').classList.remove('d-none');
        
        //Hacer peticiones a la API
        console.log('🔍 Buscando clima de:', cityName);
        
        const [currentWeather, forecast] = await Promise.all([
            WeatherAPI.getCurrentWeather(cityName),
            WeatherAPI.getForecast(cityName)
        ]);
        
        // Guardar ciudad actual
        currentCity = currentWeather.name;
        
        //Guardar en historial
        Storage.addToHistory(currentCity);
        
        //Mostrar resultados
        displayWeatherResults(currentWeather, forecast);
        
        //Ocultar spinner
        document.getElementById('loadingSpinner').classList.add('d-none');
        
        //Mostrar resultados
        document.getElementById('weatherResults').classList.remove('d-none');
        
        //Scroll suave hacia los resultados
        document.getElementById('weatherResults').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
    } catch (error) {
        // Si hay error, mostrarlo
        console.error('❌ Error:', error);
        document.getElementById('loadingSpinner').classList.add('d-none');
        showError(error.message);
    }
}

// Mostrar los resultados del clima en la interfaz
function displayWeatherResults(current, forecast) {
    // Nombre de la ciudad y fecha
    document.getElementById('cityName').textContent = `${current.name}, ${current.sys.country}`;
    document.getElementById('currentDate').textContent = WeatherAPI.formatDate(current.dt);
    
    // Temperatura
    document.getElementById('currentTemp').textContent = `${Math.round(current.main.temp)}°C`;
    
    // Icono y descripción
    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.src = WeatherAPI.getIconUrl(current.weather[0].icon);
    weatherIcon.alt = current.weather[0].description;
    document.getElementById('weatherDescription').textContent = current.weather[0].description;
    
    // Detalles
    document.getElementById('feelsLike').textContent = `${Math.round(current.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${current.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${current.wind.speed} km/h`;
    
    // Aplicar clase de temperatura al fondo de la tarjeta
    const weatherCard = document.querySelector('.current-weather');
    weatherCard.className = 'weather-card current-weather';
    const tempClass = WeatherAPI.getTemperatureClass(current.main.temp);
    weatherCard.classList.add(tempClass);
    
    //Boton de favorito
    updateFavoriteButton();
    
    //Recomendaciones
    displayRecommendations(current);
    
    //Pronostico
    displayForecast(forecast);
}

// Actualizar el botón de favorito según si la ciudad está en favoritos
function updateFavoriteButton() {
    const favoriteBtn = document.getElementById('favoriteBtn');
    const isFav = Storage.isFavorite(currentCity);
    
    // Actualizar apariencia del botón
    if (isFav) {
        favoriteBtn.classList.add('active');
        favoriteBtn.innerHTML = '<i class="bi bi-star-fill"></i>';
        favoriteBtn.title = 'Quitar de favoritos';
    } else {
        favoriteBtn.classList.remove('active');
        favoriteBtn.innerHTML = '<i class="bi bi-star"></i>';
        favoriteBtn.title = 'Agregar a favoritos';
    }
    
    // Remover eventos anteriores y agregar nuevo
    const newBtn = favoriteBtn.cloneNode(true);
    favoriteBtn.parentNode.replaceChild(newBtn, favoriteBtn);
    
    newBtn.addEventListener('click', toggleFavorite);
}

//Favorito update
function toggleFavorite() {
    const isFav = Storage.isFavorite(currentCity);
    
    if (isFav) {
        // Quitar de favoritos
        Storage.removeFavorite(currentCity);
        console.log('⭐ Quitado de favoritos:', currentCity);
    } else {
        // Agregar a favoritos
        const success = Storage.addFavorite(currentCity);
        if (success) {
            console.log('⭐ Agregado a favoritos:', currentCity);
        }
    }
        updateFavoriteButton();
}

//Mostrar recomendaciones basadas en el clima
function displayRecommendations(weatherData) {
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = ''; // Limpiar recomendaciones anteriores
    
    // Obtener recomendaciones
    const recommendations = Recommendations.getRecommendations(weatherData);
    
    // Crear elemento HTML para cada recomendación
    recommendations.forEach(rec => {
        const div = document.createElement('div');
        div.className = 'recommendation-item';
        div.innerHTML = `
            <i class="${rec.icon}"></i>
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
        `;
        recommendationsList.appendChild(div);
    });
}

//Mostrar pronóstico de 5 días
function displayForecast(forecast) {
    const forecastList = document.getElementById('forecastList');
    forecastList.innerHTML = ''; // Limpiar pronóstico anterior
    
    // Crear elemento para cada día
    forecast.forEach(day => {
        const div = document.createElement('div');
        div.className = 'forecast-item';
        
        const dayName = WeatherAPI.getDayName(day.dt);
        const temp = Math.round(day.main.temp);
        const icon = WeatherAPI.getIconUrl(day.weather[0].icon);
        const description = day.weather[0].description;
        
        div.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img src="${icon}" alt="${description}">
            <div class="forecast-temp">${temp}°C</div>
            <div class="text-capitalize small">${description}</div>
        `;
        
        forecastList.appendChild(div);
    });
}

// Manejo de errores
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    // Sanitizar el mensaje para evitar inyección de HTML
    errorText.textContent = message;
    
    // Mostrar el mensaje
    errorDiv.classList.remove('d-none');
    
    // Scroll al mensaje de error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

//Ocultar mensaje de error
function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.add('d-none');
}


//Lazy loading para imágenes (optimización de rendimiento)
function setupLazyLoading() {
    // Verificar si el navegador soporta IntersectionObserver
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        // Observar todas las imágenes con clase 'lazy'
        const lazyImages = document.querySelectorAll('img.lazy');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}