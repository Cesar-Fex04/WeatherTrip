
// Objeto de configuración principal
const Config = {
    // ⚠️ IMPORTANTE: Debes obtener tu propia API key de OpenWeatherMap
    // Visita: https://openweathermap.org/api
    // Regístrate gratis y copia tu API key aquí
    
    API_KEY: 'bec180e7a99f5dc3fc9090bc21701322',
    
    // URL base de la API de OpenWeatherMap
    API_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    
    // URL para obtener iconos del clima
    ICON_BASE_URL: 'https://openweathermap.org/img/wn',
    
    // Configuración de idioma y unidades
    LANGUAGE: 'es',           // Español
    UNITS: 'metric',          // Celsius, km/h, etc.
    
    // Límites de almacenamiento
    MAX_HISTORY: 10,          // Máximo 10 búsquedas en historial
    MAX_FAVORITES: 20,        // Máximo 20 favoritos
    
    // Configuración de caché
    CACHE_DURATION: 10 * 60 * 1000  // 10 minutos en milisegundos
};

// Exportar para que otros archivos puedan usar Config
