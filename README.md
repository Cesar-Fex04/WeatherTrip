# WeatherTrip - Aplicación de Clima y Recomendaciones

Aplicación web moderna que muestra el clima actual, pronóstico de 5 días y recomendaciones inteligentes de actividades basadas en las condiciones meteorológicas.

## Descripción

WeatherTrip es una aplicación web que permite consultar el clima de cualquier ciudad del mundo con una interfaz moderna y responsiva. Incluye autocompletado inteligente, sistema de favoritos, historial de búsquedas y recomendaciones personalizadas según las condiciones climáticas.


## Características Principales

###  Funcionalidades
-  **Clima Actual**: Temperatura, sensación térmica, humedad y velocidad del viento
-  **Pronóstico 5 Días**: Predicción extendida del clima
-  **Autocompletado Inteligente**: Sugerencias de ciudades con prioridad por distancia
-  **Favoritos**: Guarda hasta 20 ciudades favoritas
-  **Historial**: Últimas 10 búsquedas guardadas
-  **Recomendaciones**: Sugerencias de actividades según el clima
-  **Colores Dinámicos**: Interfaz que cambia según la temperatura
- **Patrón Retry**: Reintentos automáticos con backoff exponencial
- **Circuit Breaker**: Protección contra APIs caídas
- **Cache Inteligente**: Almacenamiento temporal de datos (10 min)
- **Geolocalización**: Prioriza ciudades cercanas
- **Offline Support**: Usa datos en caché cuando no hay conexión


## Instalación y Configuración

### Paso 1: Clonar el Repositorio

```bash
git clone 
cd weather-app
```

### Paso 2: Obtener API Key de OpenWeatherMap

1. **Crear cuenta en OpenWeatherMap** (GRATIS):
   - Ve a: https://openweathermap.org/api
   - Haz clic en "Sign Up"
   - Completa el formulario de registro
   - Verifica tu email

2. **Obtener tu API Key**:
   - Inicia sesión en tu cuenta
   - Ve a: https://home.openweathermap.org/api_keys
   - Copia tu API Key (aparece automáticamente)
   - Ejemplo: `bec180e7a99f5dc3fc9090bc217014`


### Paso 3: Configurar la API Key

1. Abre el archivo `js/config.js` en tu editor
2. Busca la línea:
   ```javascript
   API_KEY: 'TU_API_KEY_AQUI',
   ```
3. Reemplaza con tu API Key:

4. Guarda el archivo

### Paso 4: Ejecutar la Aplicación

**Con Servidor Local:**
```bash
# Método 1: Python 3
python -m http.server 8000
# Abre: http://localhost:8000

# Método 2: Node.js (si tienes http-server)
npx http-server -p 8000

# Método 3: VS Code - Extension "Live Server"
ALT + L + O
```

## 🌐 APIs Utilizadas
```
**Documentación Oficial:**
- 📚 Current Weather: https://openweathermap.org/current
- 📚 Forecast: https://openweathermap.org/forecast5
- 📚 Geocoding: https://openweathermap.org/api/geocoding-api
---

## 💻 Tecnologías

- HTML5
- CSS3
- javaScript 

### Frameworks y Librerías
- Bootstrap 5.3: Sistema de grid y componentes UI
- Bootstrap Icons 1.11: Iconografía
