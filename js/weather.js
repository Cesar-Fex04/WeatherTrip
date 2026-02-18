
const WeatherAPI = {
    
    //Clima actual
    getCurrentWeather: async function(cityName) {
        try {
            // Intentar obtener del caché
            const cachedData = Storage.getCachedWeather(cityName);
            if (cachedData) {
                return cachedData;
            }
            
            // Si no hay caché, hacer petición a la API CON RETRY Y CIRCUIT BREAKER
            const url = `${Config.API_BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${Config.API_KEY}&units=${Config.UNITS}&lang=${Config.LANGUAGE}`;
            
            console.log('🌐 Haciendo petición a la API con protecciones...');
            
            // Usar Circuit Breaker + Retry Pattern
            const response = await CircuitBreaker.execute(async () => {
                return await RetryPattern.fetchWithRetry(url);
            }, 'Current Weather API');
            
            // Manejar errores específicos de la API
            if (!response.ok) {
                await this.handleAPIError(response);
            }
            
            // Convertir la respuesta a JSON
            const data = await response.json();
            
            // Guardar en caché para futuras consultas
            Storage.saveCachedWeather(cityName, data);
            
            // Retornar los datos
            return data;
            
        } catch (error) {
            // Si el circuit breaker está abierto, usar caché antiguo si existe
            if (error.circuitBreakerOpen) {
                console.log('⚠️ Circuit Breaker abierto, intentando usar caché antiguo...');
                const oldCache = Storage.getCachedWeather(cityName, true); // true = ignorar expiración
                if (oldCache) {
                    console.log('✅ Usando datos del caché (pueden estar desactualizados)');
                    return oldCache;
                }
            }
            
            console.error('❌ Error al obtener clima:', error);
            throw error;
        }
    },
    
    //Pronostico de 5 días
    getForecast: async function(cityName) {
        try {
            const url = `${Config.API_BASE_URL}/forecast?q=${encodeURIComponent(cityName)}&appid=${Config.API_KEY}&units=${Config.UNITS}&lang=${Config.LANGUAGE}`;
            
            // Usar Circuit Breaker + Retry Pattern
            const response = await CircuitBreaker.execute(async () => {
                return await RetryPattern.fetchWithRetry(url);
            }, 'Forecast API');
            
            if (!response.ok) {
                await this.handleAPIError(response);
            }
            
            const data = await response.json();
            
            // Filtrar para obtener un pronóstico por día (al mediodía)
            return this.processForecastData(data);
            
        } catch (error) {
            console.error('❌ Error al obtener pronóstico:', error);
            throw error;
        }
    },
    
    //Manejar errores de la API de manera específica
    handleAPIError: async function(response) {
        let errorMessage = 'Error desconocido';
        
        // Diferentes códigos de error HTTP
        switch (response.status) {
            case 401:
                errorMessage = '🔑 API Key inválida. Por favor verifica tu configuración.';
                break;
            case 404:
                errorMessage = '🏙️ Ciudad no encontrada. Verifica el nombre e intenta de nuevo.';
                break;
            case 429:
                errorMessage = '⏱️ Demasiadas peticiones. Espera un momento e intenta de nuevo.';
                break;
            case 500:
            case 502:
            case 503:
                errorMessage = '🔧 El servidor está teniendo problemas. Intenta más tarde.';
                break;
            default:
                // Intentar obtener mensaje de error de la respuesta
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || `Error ${response.status}`;
                } catch {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
        }
        
        // Lanzar error con mensaje personalizado
        throw new Error(errorMessage);
    },
    
    //Procesar datos del pronóstico para mostrar 5 días
    processForecastData: function(data) {
        const dailyForecasts = [];
        const processedDays = new Set();
        
        // Recorrer todas las predicciones (cada 3 horas)
        for (const item of data.list) {
            const date = new Date(item.dt * 1000);
            const dateString = date.toLocaleDateString('es-MX');
            
            // Solo tomar una predicción por día (cerca del mediodía)
            const hour = date.getHours();
            if (hour >= 11 && hour <= 14 && !processedDays.has(dateString)) {
                dailyForecasts.push(item);
                processedDays.add(dateString);
            }
            
            // Detenerse cuando tengamos 5 días
            if (dailyForecasts.length >= 5) {
                break;
            }
        }
        
        return dailyForecasts;
    },
    
    //Obtener URL del icono del clima
    getIconUrl: function(iconCode) {
        return `${Config.ICON_BASE_URL}/${iconCode}@2x.png`;
    },
    
    //Determinar clase de temperatura basada en grados Celsius
    getTemperatureClass: function(temp) {
        if (temp >= 35) return 'temp-hot';        // Muy caliente
        if (temp >= 25) return 'temp-warm';       // Cálido
        if (temp >= 15) return 'temp-mild';       // Templado
        if (temp >= 5) return 'temp-cold';        // Frío
        return 'temp-freezing';                   // Muy frío
    },
    
    //Formatear fecha legible en español
    formatDate: function(timestamp) {
        const date = new Date(timestamp * 1000);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('es-MX', options);
    },
    
    //Obtener nombre del día de la semana
    getDayName: function(timestamp) {
        const date = new Date(timestamp * 1000);
        const options = { weekday: 'long' };
        return date.toLocaleDateString('es-MX', options);
    }
};