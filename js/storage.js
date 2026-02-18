const Storage = {
    
    //Historial de búsquedas
    addToHistory: function(cityName) {
        // Obtener historial actual (o array vacío si no existe)
        let history = this.getHistory();
        
        // Crear objeto con información de la búsqueda
        const searchEntry = {
            name: cityName,
            timestamp: new Date().toISOString() // Fecha y hora actual
        };
        
        // Verificar si la ciudad ya está en el historial
        // Esto evita duplicados
        const existingIndex = history.findIndex(item => 
            item.name.toLowerCase() === cityName.toLowerCase()
        );
        
        // Si ya existe, eliminarla (la agregaremos de nuevo al inicio)
        if (existingIndex !== -1) {
            history.splice(existingIndex, 1);
        }
        
        // Agregar la nueva búsqueda al INICIO del array
        history.unshift(searchEntry);
        
        // Limitar el historial al máximo configurado
        if (history.length > Config.MAX_HISTORY) {
            history = history.slice(0, Config.MAX_HISTORY);
        }
        
        // Guardar en localStorage
        // JSON.stringify convierte el array en texto para guardarlo
        localStorage.setItem('weatherHistory', JSON.stringify(history));
    },
    
    getHistory: function() {
        try {
            // Intentar obtener el historial del localStorage
            const history = localStorage.getItem('weatherHistory');
            
            // Si existe, convertirlo de texto a array (JSON.parse)
            // Si no existe, retornar array vacío
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error al obtener historial:', error);
            return [];
        }
    },
    
    //Limpiar historial
    clearHistory: function() {
        localStorage.removeItem('weatherHistory');
    },
    
    //  Favoritos storage
    addFavorite: function(cityName) {
        let favorites = this.getFavorites();
        
        // Verificar si ya está en favoritos
        const exists = favorites.some(fav => 
            fav.name.toLowerCase() === cityName.toLowerCase()
        );
        
        // Si ya existe, no hacer nada
        if (exists) {
            return false;
        }
        
        // Verificar límite de favoritos
        if (favorites.length >= Config.MAX_FAVORITES) {
            alert(`Solo puedes tener máximo ${Config.MAX_FAVORITES} favoritos`);
            return false;
        }
        
        // Agregar nuevo favorito
        const favorite = {
            name: cityName,
            timestamp: new Date().toISOString()
        };
        
        favorites.push(favorite);
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
        return true;
    },
    
    //Quitar de favoritos
    removeFavorite: function(cityName) {
        let favorites = this.getFavorites();
        
        // Filtrar: mantener todos menos el que queremos eliminar
        favorites = favorites.filter(fav => 
            fav.name.toLowerCase() !== cityName.toLowerCase()
        );
        
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    },
    
    //Si es favorito
    isFavorite: function(cityName) {
        const favorites = this.getFavorites();
        return favorites.some(fav => 
            fav.name.toLowerCase() === cityName.toLowerCase()
        );
    },
    
    // get todos Fav
    getFavorites: function() {
        try {
            const favorites = localStorage.getItem('weatherFavorites');
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Error al obtener favoritos:', error);
            return [];
        }
    },
    
    // Datos cahce
    saveCachedWeather: function(cityName, data) {
        const cacheEntry = {
            data: data,
            timestamp: Date.now() // Timestamp en milisegundos
        };
        
        // Guardar con una clave única para cada ciudad
        const cacheKey = `weather_cache_${cityName.toLowerCase()}`;
        localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    },
    
    // Obtener datos del clima desde caché
    getCachedWeather: function(cityName, ignoreExpiration = false) {
        try {
            const cacheKey = `weather_cache_${cityName.toLowerCase()}`;
            const cached = localStorage.getItem(cacheKey);
            
            if (!cached) {
                return null;
            }
            
            const cacheEntry = JSON.parse(cached);
            const now = Date.now();
            
            // Si ignoramos expiración, retornar inmediatamente
            if (ignoreExpiration) {
                console.log('⚠️ Usando caché expirado como fallback');
                return cacheEntry.data;
            }
            
            // Verificar si el caché no ha expirado
            if (now - cacheEntry.timestamp < Config.CACHE_DURATION) {
                console.log('✅ Usando datos del caché');
                return cacheEntry.data;
            } else {
                // Si expiró, eliminar el caché
                console.log('⏰ Caché expirado, obteniendo datos frescos');
                localStorage.removeItem(cacheKey);
                return null;
            }
        } catch (error) {
            console.error('Error al obtener caché:', error);
            return null;
        }
    }
};