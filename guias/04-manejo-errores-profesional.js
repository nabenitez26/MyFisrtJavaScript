/**
 * 📚 GUÍA: Manejo de Errores Profesional en Equipos
 * 
 * En equipos, los errores no controlados = bugs en producción
 */

/**
 * ❌ MALO: Código que falla sin avisar
 */
function badErrorHandling() {
    // Sin validación
    function validateEmail(email) {
        return email.includes('@'); // ¿Y si email es null?
    }

    // Sin manejo de errores
    function saveUser(userData) {
        fetch('/api/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        }); // ¿Y si falla?
    }

    // Errores silenciosos
    function processForm() {
        try {
            validateForm();
        } catch (error) {
            // Ignora el error
        }
    }
}

/**
 * ✅ BUENO: Manejo profesional de errores
 */

/**
 * 1. CUSTOM ERROR CLASSES (errores específicos del dominio)
 */
class ValidationError extends Error {
    constructor(field, value, rule, message) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.value = value;
        this.rule = rule;
        this.timestamp = new Date().toISOString();
    }
}

class NetworkError extends Error {
    constructor(url, status, statusText) {
        super(`Network request failed: ${status} ${statusText}`);
        this.name = 'NetworkError';
        this.url = url;
        this.status = status;
        this.statusText = statusText;
    }
}

class ConfigurationError extends Error {
    constructor(property, expectedType, receivedValue) {
        super(`Invalid configuration: ${property} expected ${expectedType}, got ${typeof receivedValue}`);
        this.name = 'ConfigurationError';
        this.property = property;
        this.expectedType = expectedType;
        this.receivedValue = receivedValue;
    }
}

/**
 * 2. INPUT VALIDATION (validar todo input)
 */
class ProfessionalValidator {
    /**
     * Valida email con manejo completo de errores
     */
    static validateEmail(email) {
        // Validar tipo
        if (typeof email !== 'string') {
            throw new ValidationError('email', email, 'type', 'Email must be a string');
        }

        // Validar que no esté vacío
        if (email.trim() === '') {
            throw new ValidationError('email', email, 'required', 'Email is required');
        }

        // Validar formato
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ValidationError('email', email, 'format', 'Invalid email format');
        }

        // Validar longitud
        if (email.length > 254) {
            throw new ValidationError('email', email, 'length', 'Email too long (max 254 characters)');
        }

        return true;
    }

    /**
     * Valida configuración de objeto
     */
    static validateConfig(config, requiredFields) {
        if (!config || typeof config !== 'object') {
            throw new ConfigurationError('config', 'object', config);
        }

        for (const field of requiredFields) {
            if (!(field.name in config)) {
                throw new ConfigurationError(
                    field.name, 
                    field.type, 
                    'undefined - missing field'
                );
            }

            if (typeof config[field.name] !== field.type) {
                throw new ConfigurationError(
                    field.name,
                    field.type,
                    config[field.name]
                );
            }
        }
    }
}

/**
 * 3. ASYNC ERROR HANDLING (manejo de promesas)
 */
class ApiService {
    /**
     * Realiza petición HTTP con manejo completo de errores
     */
    static async makeRequest(url, options = {}) {
        // Validar inputs
        if (typeof url !== 'string' || url.trim() === '') {
            throw new Error('URL must be a non-empty string');
        }

        let response;
        
        try {
            // Timeout para evitar requests eternos
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

        } catch (error) {
            // Diferentes tipos de errores de red
            if (error.name === 'AbortError') {
                throw new NetworkError(url, 'TIMEOUT', 'Request timed out after 10 seconds');
            }
            
            if (error instanceof TypeError) {
                throw new NetworkError(url, 'NETWORK', 'Network connection failed');
            }

            // Re-lanzar otros errores
            throw error;
        }

        // Validar respuesta HTTP
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            
            try {
                const errorBody = await response.text();
                if (errorBody) {
                    errorMessage += `: ${errorBody}`;
                }
            } catch {
                // Si no puede leer el body, usar mensaje genérico
            }

            throw new NetworkError(url, response.status, errorMessage);
        }

        // Intentar parsear JSON
        try {
            return await response.json();
        } catch (error) {
            throw new Error(`Invalid JSON response from ${url}: ${error.message}`);
        }
    }

    /**
     * Guarda usuario con reintentos automáticos
     */
    static async saveUser(userData, maxRetries = 3) {
        // Validar datos antes de enviar
        this._validateUserData(userData);

        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.makeRequest('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                // Log éxito
                console.log(`✅ User saved successfully on attempt ${attempt}`);
                return result;

            } catch (error) {
                lastError = error;
                
                // Log intento fallido
                console.warn(`⚠️ Save attempt ${attempt}/${maxRetries} failed:`, error.message);

                // No reintentar en ciertos errores
                if (error instanceof ValidationError) {
                    throw error; // Errores de validación no se solucionan reintentando
                }

                if (error.status === 400 || error.status === 401) {
                    throw error; // Errores de cliente no se solucionan reintentando
                }

                // Esperar antes del siguiente intento
                if (attempt < maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Backoff exponencial
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // Si llegamos aquí, todos los intentos fallaron
        throw new Error(`Failed to save user after ${maxRetries} attempts. Last error: ${lastError.message}`);
    }

    static _validateUserData(userData) {
        const required = [
            { name: 'email', type: 'string' },
            { name: 'name', type: 'string' }
        ];

        ProfessionalValidator.validateConfig(userData, required);
        ProfessionalValidator.validateEmail(userData.email);

        if (userData.name.trim().length < 2) {
            throw new ValidationError('name', userData.name, 'length', 'Name must be at least 2 characters');
        }
    }
}

/**
 * 4. ERROR BOUNDARY (captura errores globales)
 */
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        // Errores de JavaScript
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Promesas rechazadas no manejadas
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'Unhandled Promise Rejection',
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });
    }

    handleError(errorInfo) {
        // Log para desarrolladores
        console.error('🚨 Error capturado:', errorInfo);

        // Guardar en lista de errores
        this.errors.push(errorInfo);

        // En producción, enviar a servicio de logging
        if (process.env.NODE_ENV === 'production') {
            this.sendErrorToLoggingService(errorInfo);
        }

        // Mostrar mensaje amigable al usuario
        this.showUserFriendlyMessage(errorInfo);
    }

    sendErrorToLoggingService(errorInfo) {
        // Enviar a Sentry, LogRocket, etc.
        // No lanzar errores aquí para evitar loops infinitos
        try {
            fetch('/api/errors', {
                method: 'POST',
                body: JSON.stringify(errorInfo)
            }).catch(() => {
                // Fallar silenciosamente si no se puede enviar el error
            });
        } catch {
            // Fallar silenciosamente
        }
    }

    showUserFriendlyMessage(errorInfo) {
        // Mensaje genérico para usuarios
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-content">
                <strong>🚨 Algo salió mal</strong>
                <p>Hemos detectado un problema. Nuestro equipo ha sido notificado.</p>
                <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }
}

/**
 * 5. DEFENSIVE PROGRAMMING (código a prueba de errores)
 */
class RobustFormValidator {
    constructor(options = {}) {
        // Valores por defecto seguros
        this.options = {
            timeout: 5000,
            maxRetries: 3,
            enableLogging: true,
            ...options
        };

        // Validar configuración
        this._validateOptions();
        
        this.rules = new Map();
        this.errorHandler = new ErrorHandler();
    }

    _validateOptions() {
        if (typeof this.options.timeout !== 'number' || this.options.timeout < 0) {
            throw new ConfigurationError('timeout', 'positive number', this.options.timeout);
        }
    }

    /**
     * Valida campo con múltiples capas de protección
     */
    validateField(fieldName, value, rules = []) {
        // Input validation
        if (typeof fieldName !== 'string' || fieldName.trim() === '') {
            throw new ValidationError(fieldName, value, 'fieldName', 'Field name must be a non-empty string');
        }

        if (!Array.isArray(rules)) {
            throw new ValidationError(fieldName, value, 'rules', 'Rules must be an array');
        }

        const result = {
            field: fieldName,
            value: value,
            isValid: true,
            errors: [],
            warnings: [],
            timestamp: new Date().toISOString()
        };

        try {
            for (const rule of rules) {
                try {
                    const ruleResult = this._executeRule(fieldName, value, rule);
                    
                    if (!ruleResult.isValid) {
                        result.isValid = false;
                        result.errors.push(ruleResult);
                    }

                } catch (error) {
                    result.isValid = false;
                    result.errors.push({
                        rule: rule.name || 'unknown',
                        message: `Rule execution failed: ${error.message}`,
                        error: error
                    });

                    // Log error but continue with other rules
                    this.errorHandler.handleError({
                        type: 'Rule Execution Error',
                        field: fieldName,
                        rule: rule,
                        error: error.message
                    });
                }
            }

        } catch (error) {
            // Catastrophic failure - return safe error state
            result.isValid = false;
            result.errors.push({
                rule: 'system',
                message: 'Validation system error',
                error: error.message
            });

            this.errorHandler.handleError({
                type: 'Validation System Error',
                field: fieldName,
                error: error.message
            });
        }

        return result;
    }

    _executeRule(fieldName, value, rule) {
        // Validar estructura de regla
        if (!rule || typeof rule !== 'object') {
            throw new Error('Rule must be an object');
        }

        if (typeof rule.validator !== 'function') {
            throw new Error('Rule must have a validator function');
        }

        // Ejecutar con timeout
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Rule execution timeout'));
            }, this.options.timeout);

            try {
                const result = rule.validator(value);
                clearTimeout(timeout);
                resolve({
                    rule: rule.name || 'unnamed',
                    isValid: result,
                    message: result ? null : rule.message || 'Validation failed'
                });
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }
}

/**
 * 🎯 TU EJERCICIO 4: MEJORAR MANEJO DE ERRORES
 * 
 * Toma esta función problemática y mejórala:
 */
function problematicFunction(userData) {
    // Sin validación, sin manejo de errores
    const email = userData.email;
    fetch('/api/validate', {
        method: 'POST',
        body: JSON.stringify({ email: email })
    }).then(response => response.json())
      .then(data => {
          if (data.valid) {
              console.log('Valid');
          }
      });
}

/**
 * Mejora esta función aplicando:
 * 1. Validación de inputs
 * 2. Manejo de errores de red
 * 3. Timeouts
 * 4. Logging apropiado
 * 5. Mensajes de usuario amigables
 */

/**
 * 💡 PRINCIPIOS APLICADOS:
 * 
 * 1. ✅ Fail Fast: Validar inputs inmediatamente
 * 2. ✅ Defensive Programming: Asumir que todo puede fallar
 * 3. ✅ Error Types: Diferentes clases para diferentes errores
 * 4. ✅ Graceful Degradation: Continuar funcionando aunque haya errores
 * 5. ✅ User Experience: Errores técnicos no llegan al usuario
 * 6. ✅ Monitoring: Todos los errores se loggean
 * 7. ✅ Recovery: Reintentos automáticos cuando es apropiado
 */