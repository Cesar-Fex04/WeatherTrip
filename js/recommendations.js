const Recommendations = {
    //  obtener recomendaciones para el clima
    getRecommendations: function(weatherData) {
        const recommendations = [];
        
        // Extraer datos importantes
        const temp = weatherData.main.temp;
        const weatherMain = weatherData.weather[0].main.toLowerCase();
        const description = weatherData.weather[0].description;
        const windSpeed = weatherData.wind.speed;
        const humidity = weatherData.main.humidity;
        
        // Recomendacion segun temperatura
        if (temp >= 30) {
            // Hace mucho calor
            recommendations.push({
                icon: 'bi-umbrella-fill',
                title: 'Protégete del sol',
                description: 'Usa protector solar, gorra y busca sombra. Hidrátate constantemente.'
            });
            
            recommendations.push({
                icon: 'bi-water',
                title: 'Actividades acuáticas',
                description: 'Perfecto para piscina, playa o parques acuáticos.'
            });
            
            // Hidratación
            recommendations.push({
                icon: 'bi-droplet-fill',
                title: 'Hidrátate constantemente',
                description: 'Toma agua regularmente para evitar deshidratación.'
            });
        } else if (temp >= 20 && temp < 30) {
            // Temperatura agradable
            recommendations.push({
                icon: 'bi-bicycle',
                title: 'Actividades al aire libre',
                description: 'Clima ideal para ciclismo, caminatas o picnic en el parque.'
            });
            
            recommendations.push({
                icon: 'bi-camera-fill',
                title: 'Turismo y fotografía',
                description: 'Temperatura perfecta para recorrer la ciudad y tomar fotos.'
            });
            
            // Deportes
            recommendations.push({
                icon: 'bi-trophy',
                title: 'Deportes al aire libre',
                description: 'Temperatura ideal para correr, hacer ejercicio o jugar deportes.'
            });
        } else if (temp >= 10 && temp < 20) {
            // Fresco
            recommendations.push({
                icon: 'bi-cup-hot-fill',
                title: 'Cafés y restaurantes',
                description: 'Clima agradable para disfrutar en terrazas y cafeterías.'
            });
            
            recommendations.push({
                icon: 'bi-tree-fill',
                title: 'Senderismo',
                description: 'Temperatura ideal para caminatas y explorar la naturaleza.'
            });
            
            // NUEVA: Ropa
            recommendations.push({
                icon: 'bi-bag',
                title: 'Lleva una chaqueta ligera',
                description: 'Temperatura fresca, una prenda extra es buena idea.'
            });
        } else {
            // Hace frío
            recommendations.push({
                icon: 'bi-snow',
                title: 'Abrígate bien',
                description: 'Lleva abrigo, bufanda y guantes. El clima está frío.'
            });
            
            recommendations.push({
                icon: 'bi-building',
                title: 'Actividades bajo techo',
                description: 'Visita museos, galerías de arte o centros comerciales.'
            });
            
            // NUEVA: Bebidas calientes
            recommendations.push({
                icon: 'bi-cup-straw',
                title: 'Bebidas calientes',
                description: 'Perfecto para chocolate caliente, té o café.'
            });
        }
        
        // Segun condicion climatica
        
        if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
            // Está lloviendo
            recommendations.push({
                icon: 'bi-umbrella',
                title: 'Lleva paraguas',
                description: 'Está lloviendo. Prepárate con paraguas o impermeable.'
            });
            
            recommendations.push({
                icon: 'bi-film',
                title: 'Cine o teatro',
                description: 'Perfecto para disfrutar de una película o obra de teatro.'
            });
            
            recommendations.push({
                icon: 'bi-book',
                title: 'Museos y bibliotecas',
                description: 'Ideal para actividades culturales bajo techo.'
            });
            
            // NUEVA: Café
            recommendations.push({
                icon: 'bi-cup-hot',
                title: 'Café caliente',
                description: 'Un buen momento para disfrutar bebidas calientes en un lugar acogedor.'
            });
        }
        
        if (weatherMain.includes('clear') || weatherMain.includes('sun')) {
            // Soleado
            recommendations.push({
                icon: 'bi-brightness-high',
                title: 'Día soleado',
                description: 'Aprovecha el sol para actividades al aire libre.'
            });
            
            recommendations.push({
                icon: 'bi-geo-alt-fill',
                title: 'Explora atracciones',
                description: 'Visita monumentos, parques y lugares turísticos.'
            });
            
            // NUEVA: Protección
            recommendations.push({
                icon: 'bi-sunglasses',
                title: 'Usa lentes de sol',
                description: 'Protege tus ojos del sol directo con gafas UV.'
            });
        }
        
        if (weatherMain.includes('cloud')) {
            // Nublado
            recommendations.push({
                icon: 'bi-cloud',
                title: 'Clima nublado',
                description: 'Buena temperatura para caminar sin sol directo.'
            });
            
            recommendations.push({
                icon: 'bi-images',
                title: 'Fotografía de paisajes',
                description: 'Las nubes crean atmósferas interesantes para fotos.'
            });
            
            // NUEVA: Actividades
            recommendations.push({
                icon: 'bi-balloon',
                title: 'Actividades al aire libre',
                description: 'Clima perfecto sin sol intenso para paseos y ejercicio.'
            });
        }
        
        if (weatherMain.includes('snow')) {
            // Nevando
            recommendations.push({
                icon: 'bi-snow2',
                title: 'Actividades de invierno',
                description: 'Disfruta de esquí, snowboard o simplemente jugar con la nieve.'
            });
            
            recommendations.push({
                icon: 'bi-fire',
                title: 'Lugares con calefacción',
                description: 'Busca cafés o restaurantes acogedores con chimenea.'
            });
            
            // NUEVA: Precaución
            recommendations.push({
                icon: 'bi-exclamation-circle',
                title: 'Maneja con precaución',
                description: 'Las carreteras pueden estar resbalosas. Conduce despacio.'
            });
        }
        
        if (weatherMain.includes('thunder') || weatherMain.includes('storm')) {
            // Tormenta
            recommendations.push({
                icon: 'bi-exclamation-triangle',
                title: '⚠️ Precaución',
                description: 'Hay tormenta. Busca refugio y evita estar al aire libre.'
            });
            
            recommendations.push({
                icon: 'bi-house-door',
                title: 'Quédate en lugares seguros',
                description: 'Lo mejor es permanecer en interiores hasta que pase.'
            });
            
            // NUEVA: Evitar electrónicos
            recommendations.push({
                icon: 'bi-lightning',
                title: 'Evita dispositivos electrónicos',
                description: 'No uses aparatos conectados durante la tormenta eléctrica.'
            });
        }
        
        // Segun la velocidad del viento
        
        if (windSpeed > 10) {
            // Viento fuerte
            recommendations.push({
                icon: 'bi-wind',
                title: 'Viento fuerte',
                description: 'Cuidado con objetos que puedan volar. Asegura tus pertenencias.'
            });
            
            // NUEVA: Evitar altura
            recommendations.push({
                icon: 'bi-sign-stop',
                title: 'Evita lugares altos',
                description: 'No camines cerca de árboles altos o estructuras inestables.'
            });
        }
        
        // Segun la humedad
        
        if (humidity > 80) {
            // Humedad alta
            recommendations.push({
                icon: 'bi-droplet-half',
                title: 'Alta humedad',
                description: 'El ambiente está húmedo. Lleva ropa ligera y transpirable.'
            });
            
            // Ventilación
            recommendations.push({
                icon: 'bi-fan',
                title: 'Busca lugares ventilados',
                description: 'Lugares cerrados con ventilacion para evitar humedad.'
            });
        }
        
        // Recomendación general
        recommendations.push({
            icon: 'bi-phone',
            title: 'Mantente informado',
            description: 'Revisa el pronóstico regularmente para planificar mejor tu día.'
        });
        
    
        return recommendations.slice(0, 8); // Limitar a 8 recomendaciones para no saturar
    },
    
    // Obtener emoji según la condición climática
    getWeatherEmoji: function(weatherMain) {
        const emojis = {
            'clear': '☀️',
            'clouds': '☁️',
            'rain': '🌧️',
            'drizzle': '🌦️',
            'thunderstorm': '⛈️',
            'snow': '❄️',
            'mist': '🌫️',
            'fog': '🌫️',
            'haze': '🌫️'
        };
        
        return emojis[weatherMain.toLowerCase()] || '🌡️';
    },
    
   // Mensaje motivacional segun el clima
    getMotivationalMessage: function(weatherMain) {
        const messages = {
            'clear': '¡Perfecto día para salir a explorar! ☀️',
            'clouds': '¡Un día nublado también puede ser aventurero! ☁️',
            'rain': '¡La lluvia trae oportunidades para disfrutar bajo techo! 🌧️',
            'thunderstorm': '¡Es momento de quedarse seguro y cómodo! ⛈️',
            'snow': '¡Aprovecha la magia del invierno! ❄️',
            'mist': '¡El misterio de la niebla tiene su encanto! 🌫️'
        };
        
        return messages[weatherMain.toLowerCase()] || '¡Disfruta tu día! 🌟';
    }
};

// Exportar para uso en otros archivos