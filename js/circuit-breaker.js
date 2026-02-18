

const CircuitBreaker = {
    // Estados del Circuit Breaker
     
    states: {
        CLOSED: 'CLOSED',           // 🟢 Normal, peticiones pasan
        OPEN: 'OPEN',               // 🔴 Bloqueado, rechaza peticiones
        HALF_OPEN: 'HALF_OPEN'      // 🟡 Probando si ya funciona
    },
    
    /**
     * Configuración
     */
    config: {
        failureThreshold: 5,        // Fallos necesarios para abrir el circuito
        successThreshold: 2,        // Éxitos necesarios para cerrar (desde HALF_OPEN)
        timeout: 30000,             // Tiempo en OPEN antes de probar (30 segundos)
    },
    
    /**
     * Estado actual del circuito
     */
    state: {
        current: 'CLOSED',          // Estado actual
        failureCount: 0,            // Contador de fallos consecutivos
        successCount: 0,            // Contador de éxitos (en HALF_OPEN)
        nextAttempt: null,          // Timestamp del próximo intento permitido
        lastError: null             // Último error recibido
    },
    
    /**
     * Ejecutar función con protección de Circuit Breaker
     * @param {Function} fn - Función asíncrona a ejecutar
     * @param {string} operationName - Nombre de la operación
     * @returns {Promise} - Resultado de la función
     */
    async execute(fn, operationName = 'Operación') {
        // Verificar el estado del circuito
        this.checkState();
        
        // Si el circuito está OPEN, rechazar inmediatamente
        if (this.state.current === this.states.OPEN) {
            const error = new Error(
                `🔴 Circuit Breaker OPEN: El servicio está temporalmente no disponible. ` +
                `Intenta de nuevo en ${this.getTimeUntilRetry()} segundos.`
            );
            error.circuitBreakerOpen = true;
            
            console.warn(`🔴 ${operationName} - Bloqueado por Circuit Breaker`);
            throw error;
        }
        
        try {
            // Intentar ejecutar la función
            console.log(`${this.getStateIcon()} ${operationName} - Circuit Breaker: ${this.state.current}`);
            const result = await fn();
            
            // Éxito! Registrarlo
            this.onSuccess(operationName);
            
            return result;
            
        } catch (error) {
            // Fallo! Registrarlo
            this.onFailure(error, operationName);
            throw error;
        }
    },
    
    
    // Verificar y actualizar el estado del circuito
    checkState() {
        // Si está OPEN, verificar si ya pasó el timeout
        if (this.state.current === this.states.OPEN) {
            const now = Date.now();
            
            if (now >= this.state.nextAttempt) {
                // Cambiar a HALF_OPEN para probar
                console.log('🟡 Circuit Breaker: OPEN → HALF_OPEN (probando recuperación)');
                this.state.current = this.states.HALF_OPEN;
                this.state.successCount = 0;
            }
        }
    },
    
    /**
     * Manejar éxito de una petición
     * @param {string} operationName - Nombre de la operación
     */
    onSuccess(operationName) {
        // Resetear contador de fallos
        this.state.failureCount = 0;
        
        // Si estamos en HALF_OPEN, contar éxito
        if (this.state.current === this.states.HALF_OPEN) {
            this.state.successCount++;
            
            console.log(
                `🟡 ${operationName} - Éxito en HALF_OPEN ` +
                `(${this.state.successCount}/${this.config.successThreshold})`
            );
            
            // Si alcanzamos el threshold de éxitos, cerrar el circuito
            if (this.state.successCount >= this.config.successThreshold) {
                console.log('🟢 Circuit Breaker: HALF_OPEN → CLOSED (recuperado)');
                this.state.current = this.states.CLOSED;
                this.state.successCount = 0;
            }
        }
    },
    
    /**
     * Manejar fallo de una petición
     * @param {Error} error - Error recibido
     * @param {string} operationName - Nombre de la operación
     */
    onFailure(error, operationName) {
        this.state.failureCount++;
        this.state.lastError = error;
        
        console.log(
            `❌ ${operationName} - Fallo registrado ` +
            `(${this.state.failureCount}/${this.config.failureThreshold})`
        );
        
        // Si estamos en HALF_OPEN y falla, volver a OPEN inmediatamente
        if (this.state.current === this.states.HALF_OPEN) {
            console.log('🔴 Circuit Breaker: HALF_OPEN → OPEN (aún no recuperado)');
            this.state.current = this.states.OPEN;
            this.state.successCount = 0;
            this.state.nextAttempt = Date.now() + this.config.timeout;
            return;
        }
        
        // Si estamos en CLOSED y alcanzamos el threshold, abrir circuito
        if (
            this.state.current === this.states.CLOSED &&
            this.state.failureCount >= this.config.failureThreshold
        ) {
            console.log('🔴 Circuit Breaker: CLOSED → OPEN (demasiados fallos)');
            this.state.current = this.states.OPEN;
            this.state.nextAttempt = Date.now() + this.config.timeout;
        }
    },
    
    /**
     * Obtener tiempo hasta el próximo reintento (en segundos)
     * @returns {number} - Segundos hasta el próximo intento
     */
    getTimeUntilRetry() {
        if (this.state.current !== this.states.OPEN) {
            return 0;
        }
        
        const ms = this.state.nextAttempt - Date.now();
        return Math.ceil(ms / 1000);
    },
    
    /**
     * Obtener icono del estado actual
     * @returns {string} - Emoji representativo
     */
    getStateIcon() {
        switch (this.state.current) {
            case this.states.CLOSED: return '🟢';
            case this.states.OPEN: return '🔴';
            case this.states.HALF_OPEN: return '🟡';
            default: return '⚪';
        }
    },
    
    /**
     * Obtener información del estado actual
     * @returns {object} - Información del circuito
     */
    getStatus() {
        return {
            state: this.state.current,
            failureCount: this.state.failureCount,
            successCount: this.state.successCount,
            timeUntilRetry: this.getTimeUntilRetry(),
            lastError: this.state.lastError?.message
        };
    },
    
    /**
     * Reset manual del Circuit Breaker (para testing o admin)
     */
    reset() {
        console.log('🔄 Circuit Breaker: Reset manual');
        this.state.current = this.states.CLOSED;
        this.state.failureCount = 0;
        this.state.successCount = 0;
        this.state.nextAttempt = null;
        this.state.lastError = null;
    },
    
    /**
     * Wrapper para fetch con Circuit Breaker
     * @param {string} url - URL a consultar
     * @param {object} options - Opciones de fetch
     * @returns {Promise} - Response de fetch
     */
    async fetchWithCircuitBreaker(url, options = {}) {
        return this.execute(async () => {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                throw error;
            }
            
            return response;
        }, `Fetch ${url}`);
    }
};

// Exportar