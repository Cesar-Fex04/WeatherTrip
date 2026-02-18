const Geocoding = {
    config: {
        debounceDelay: 300,         // Esperar 300ms antes de buscar
        maxResults: 5,              // Máximo de sugerencias
        minChars: 2,                // Mínimo de caracteres para buscar
    },
    
    state: {
        debounceTimer: null,        // Timer para debouncing
        lastQuery: '',              // Última búsqueda
        userLocation: null,         // Ubicación del usuario (lat, lon)
    },
    
 //Obtener sugerencias de ciudades
    async getSuggestions(query) {
        // Validar input
        if (!query || query.length < this.config.minChars) {
            return [];
        }
        
        try {
            // Construir URL de la API de Geocoding
            // Documentación: https://openweathermap.org/api/geocoding-api
            const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${this.config.maxResults}&appid=${Config.API_KEY}`;
            
            console.log('🔍 Buscando ciudades:', query);
            
            // Hacer petición con Circuit Breaker y Retry
            const response = await CircuitBreaker.execute(async () => {
                return await RetryPattern.fetchWithRetry(url);
            }, 'Geocoding API');
            
            const cities = await response.json();
            
            // Procesar y ordenar resultados
            const processedCities = this.processCities(cities, query);
            
            console.log(`✅ Encontradas ${processedCities.length} ciudades`);
            
            return processedCities;
            
        } catch (error) {
            console.error('❌ Error al buscar ciudades:', error);
            
            // Si el circuit breaker está abierto, mostrar mensaje amigable
            if (error.circuitBreakerOpen) {
                return [];
            }
            
            throw error;
        }
    },
    
    processCities(cities, query) {
        // Mapear a formato más útil
        const processed = cities.map(city => ({
            name: city.name,
            country: city.country,
            state: city.state || '',
            lat: city.lat,
            lon: city.lon,
            // Nombre completo para mostrar
            displayName: this.formatDisplayName(city),
            // Distancia desde usuario (si tenemos ubicación)
            distance: this.calculateDistance(city)
        }));
        
        // Ordenar por distancia (si tenemos ubicación del usuario)
        if (this.state.userLocation) {
            processed.sort((a, b) => a.distance - b.distance);
        }
        
        return processed;
    },
    
 
    formatDisplayName(city) {
        let parts = [city.name];
        
        // Agregar estado si existe
        if (city.state) {
            parts.push(city.state);
        }
        
        // Agregar país
        parts.push(this.getCountryName(city.country));
        
        return parts.join(', ');
    },
    
    
  // Obtener nombre completo del país desde código ISO 
    getCountryName(code) {
        const countries = {
            'MX': 'México',
            'US': 'Estados Unidos',
            'CA': 'Canadá',
            'ES': 'España',
            'FR': 'Francia',
            'IT': 'Italia',
            'DE': 'Alemania',
            'GB': 'Reino Unido',
            'BR': 'Brasil',
            'AR': 'Argentina',
            'CL': 'Chile',
            'CO': 'Colombia',
            'PE': 'Perú',
            'JP': 'Japón',
            'CN': 'China',
            'KR': 'Corea del Sur',
            'AU': 'Australia',
            'NZ': 'Nueva Zelanda',
            'RU': 'Rusia',
            // Agregar más según necesites
        };
        
        return countries[code] || code;
    },
    
    
     //Calcular distancia desde ubicación del usuario
     //Fórmula de Haversine (distancia entre dos puntos en esfera)
    calculateDistance(city) {
        if (!this.state.userLocation) {
            return Infinity;
        }
        
        const R = 6371; // Radio de la Tierra en km
        
        const lat1 = this.state.userLocation.lat * Math.PI / 180;
        const lat2 = city.lat * Math.PI / 180;
        const deltaLat = (city.lat - this.state.userLocation.lat) * Math.PI / 180;
        const deltaLon = (city.lon - this.state.userLocation.lon) * Math.PI / 180;
        
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        const distance = R * c;
        
        return Math.round(distance);
    },
    
    
    // Obtener ubicación del usuario,permitiendo priorizar ciudades cercanas
    async getUserLocation() {
        // Verificar si el navegador soporta geolocalización
        if (!navigator.geolocation) {
            console.log('⚠️ Geolocalización no disponible');
            return;
        }
        
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 5000,
                    maximumAge: 300000, // Cache por 5 minutos
                });
            });
            
            this.state.userLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            
            console.log('📍 Ubicación del usuario obtenida:', this.state.userLocation);
            
        } catch (error) {
            console.log('⚠️ No se pudo obtener ubicación:', error.message);
            // No es crítico, simplemente no priorizaremos por distancia
        }
    },
    
    
 // Espera a que el usuario termine de escribir antes de buscar ciudades   
    searchWithDebounce(query, callback) {
        // Limpiar timer anterior
        if (this.state.debounceTimer) {
            clearTimeout(this.state.debounceTimer);
        }
        
        // Si es muy corto, limpiar resultados
        if (query.length < this.config.minChars) {
            callback([]);
            return;
        }
        
        // Configurar nuevo timer
        this.state.debounceTimer = setTimeout(async () => {
            try {
                const results = await this.getSuggestions(query);
                callback(results);
            } catch (error) {
                callback([]);
            }
        }, this.config.debounceDelay);
    },

    async initialize() {
        console.log('🌍 Inicializando Geocoding...');
        
        // Intentar obtener ubicación del usuario
        await this.getUserLocation();
        
        console.log('✅ Geocoding listo');
    }
};
