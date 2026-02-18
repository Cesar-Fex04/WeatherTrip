
const RetryPattern = {
    
    config: {
        maxRetries: 3,              // Número máximo de reintentos
        initialDelay: 1000,         // Delay inicial (1 segundo)
        maxDelay: 10000,            // Delay máximo (10 segundos)
        backoffMultiplier: 2,       // Multiplicador para backoff exponencial
        retryableErrors: [          // Errores que vale la pena reintentar
            429,  // Too Many Requests
            500,  // Internal Server Error
            502,  // Bad Gateway
            503,  // Service Unavailable
            504   // Gateway Timeout
        ]
    },
    
    // Ejecutar función con reintentos automáticos
    async executeWithRetry(fn, operationName = 'Operación') {
        let lastError;
        
        // Intentar hasta maxRetries veces
        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                console.log(`🔄 ${operationName} - Intento ${attempt + 1}/${this.config.maxRetries + 1}`);
                
                // Ejecutar la función
                const result = await fn();
                
                // Si llegamos aquí, fue exitoso
                if (attempt > 0) {
                    console.log(`✅ ${operationName} - Exitoso después de ${attempt + 1} intentos`);
                }
                
                return result;
                
            } catch (error) {
                lastError = error;
                
                // Verificar si debemos reintentar
                const shouldRetry = this.shouldRetry(error, attempt);
                
                if (!shouldRetry) {
                    console.error(`❌ ${operationName} - Error no recuperable:`, error.message);
                    throw error;
                }
                
                // Si no es el último intento, esperamos antes de reintentar
                if (attempt < this.config.maxRetries) {
                    const delay = this.calculateDelay(attempt);
                    console.log(`⏱️ ${operationName} - Esperando ${delay}ms antes de reintentar...`);
                    await this.sleep(delay);
                } else {
                    console.error(`❌ ${operationName} - Falló después de ${attempt + 1} intentos`);
                }
            }
        }
        
        // Si llegamos aquí, todos los intentos fallaron
        throw lastError;
    },
    
    // Determinar si debemos reintentar basado en el error
    shouldRetry(error, attempt) {
        // No reintentar si ya alcanzamos el máximo
        if (attempt >= this.config.maxRetries) {
            return false;
        }
        
        // Si el error tiene un código de estado HTTP
        if (error.status) {
            return this.config.retryableErrors.includes(error.status);
        }
        
        // Reintentar errores de red (TypeError: Failed to fetch)
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return true;
        }
        
        // No reintentar errores de cliente (400, 401, 404, etc.)
        return false;
    },
    
    /*
     * Calcular delay con backoff exponencial
     * Fórmula: delay = initialDelay * (backoffMultiplier ^ attempt)
     */
    calculateDelay(attempt) {
        const delay = this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempt);
        
        // No exceder el delay máximo
        return Math.min(delay, this.config.maxDelay);
    },
    
    //Función de utilidad para esperar 
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    //Wrapper conveniente para fetch con retry
    async fetchWithRetry(url, options = {}) {
        return this.executeWithRetry(async () => {
            const response = await fetch(url, options);
            
            // Si la respuesta no es OK y es un error retryable
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                throw error;
            }
            
            return response;
        }, `Fetch ${url}`);
    }
};