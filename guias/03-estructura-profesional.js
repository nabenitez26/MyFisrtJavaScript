/**
 * 📚 GUÍA: Estructura y Organización de Código Profesional
 * 
 * En equipos grandes, la organización es CRÍTICA
 */

// ❌ MAL: Todo mezclado en un archivo gigante
// No hagas esto en equipos:

var validator, handler, app, config, utils, data, temp;

function validate() { }
function handle() { }
function setup() { }
function init() { }
// 1000 líneas más...

// ✅ BUENO: Organización modular profesional

/**
 * 🏗️ ESTRUCTURA RECOMENDADA PARA EQUIPOS
 */

/**
 * 1. IMPORTS/DEPENDENCIES (siempre al inicio)
 */
// import { EmailValidator } from './validators/email-validator.js';
// import { FormHandler } from './handlers/form-handler.js';
// import { Logger } from './utils/logger.js';

/**
 * 2. CONSTANTES Y CONFIGURACIÓN
 */
const CONFIG = {
    MAX_RETRY_ATTEMPTS: 3,
    VALIDATION_TIMEOUT: 5000,
    API_ENDPOINTS: {
        VALIDATE_EMAIL: '/api/validate/email',
        SUBMIT_FORM: '/api/forms/submit'
    }
};

const VALIDATION_RULES = {
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        MIN_LENGTH: 5,
        MAX_LENGTH: 254
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        REQUIRE_UPPERCASE: true,
        REQUIRE_NUMBERS: true
    }
};

/**
 * 3. CLASES PRINCIPALES (una responsabilidad por clase)
 */

/**
 * Maneja únicamente la validación de formularios
 * 
 * @class FormValidator
 * @since 1.0.0
 */
class FormValidator {
    constructor(config = CONFIG) {
        this.config = config;
        this.rules = new Map();
        this.errors = [];
        
        this._initializeDefaultRules();
    }

    /**
     * Métodos públicos (API externa)
     */
    addRule(name, validator, message) {
        this._validateInputs(name, validator, message);
        this.rules.set(name, { validator, message });
    }

    validateField(fieldName, value, context = {}) {
        const rule = this.rules.get(fieldName);
        if (!rule) {
            throw new Error(`Validation rule '${fieldName}' not found`);
        }

        return this._executeValidation(rule, value, context);
    }

    /**
     * Métodos privados (implementación interna)
     */
    _initializeDefaultRules() {
        this.addRule('required', (value) => {
            return value !== null && value !== undefined && value.trim() !== '';
        }, 'This field is required');

        this.addRule('email', (value) => {
            return VALIDATION_RULES.EMAIL.PATTERN.test(value);
        }, 'Please enter a valid email address');
    }

    _validateInputs(name, validator, message) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('Rule name must be a non-empty string');
        }
        if (typeof validator !== 'function') {
            throw new Error('Validator must be a function');
        }
        if (typeof message !== 'string') {
            throw new Error('Message must be a string');
        }
    }

    _executeValidation(rule, value, context) {
        try {
            const isValid = rule.validator(value, context);
            return {
                valid: isValid,
                message: isValid ? null : rule.message,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                valid: false,
                message: 'Validation error occurred',
                error: error.message
            };
        }
    }
}

/**
 * 4. FUNCIONES UTILITARIAS (sin estado, reutilizables)
 */
const ValidationUtils = {
    /**
     * Formatea un mensaje de error con parámetros
     */
    formatMessage(template, params) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] || match;
        });
    },

    /**
     * Sanitiza input del usuario
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.trim().replace(/[<>]/g, '');
    },

    /**
     * Valida que un objeto tenga las propiedades requeridas
     */
    validateRequiredProperties(object, requiredProps) {
        const missing = requiredProps.filter(prop => !(prop in object));
        if (missing.length > 0) {
            throw new Error(`Missing required properties: ${missing.join(', ')}`);
        }
    }
};

/**
 * 5. FACTORY FUNCTIONS (para crear instancias configuradas)
 */
const ValidatorFactory = {
    /**
     * Crea un validador para formularios de registro
     */
    createRegistrationValidator() {
        const validator = new FormValidator();
        
        validator.addRule('username', (value) => {
            return value.length >= 3 && value.length <= 20 && /^[a-zA-Z0-9_]+$/.test(value);
        }, 'Username must be 3-20 characters, letters, numbers, and underscores only');

        validator.addRule('strongPassword', (value) => {
            const hasLength = value.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH;
            const hasUpper = /[A-Z]/.test(value);
            const hasNumber = /\d/.test(value);
            return hasLength && hasUpper && hasNumber;
        }, 'Password must be at least 8 characters with uppercase and numbers');

        return validator;
    },

    /**
     * Crea un validador para formularios de contacto
     */
    createContactValidator() {
        const validator = new FormValidator();
        
        validator.addRule('phone', (value) => {
            return /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''));
        }, 'Please enter a valid phone number');

        return validator;
    }
};

/**
 * 6. MAIN APPLICATION CLASS (orquesta todo)
 */
class ValidationApp {
    constructor(config = {}) {
        this.config = { ...CONFIG, ...config };
        this.validator = null;
        this.handlers = new Map();
        this.isInitialized = false;
    }

    async initialize() {
        try {
            await this._loadDependencies();
            this._setupValidator();
            this._registerEventHandlers();
            this._setupErrorHandling();
            
            this.isInitialized = true;
            console.log('✅ ValidationApp initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize ValidationApp:', error);
            throw error;
        }
    }

    async _loadDependencies() {
        // Simular carga de dependencias
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    _setupValidator() {
        this.validator = ValidatorFactory.createRegistrationValidator();
    }

    _registerEventHandlers() {
        // Setup event handlers
    }

    _setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });
    }
}

/**
 * 7. INITIALIZATION (punto de entrada)
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const app = new ValidationApp();
        await app.initialize();
        
        // Exponer para debugging (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
            window.validationApp = app;
        }
    } catch (error) {
        console.error('Failed to start application:', error);
    }
});

/**
 * 8. EXPORTS (para otros módulos)
 */
// export { FormValidator, ValidationUtils, ValidatorFactory };

/**
 * 🎯 PRINCIPIOS APLICADOS:
 * 
 * 1. ✅ Single Responsibility: Cada clase hace una cosa
 * 2. ✅ Separation of Concerns: UI, lógica, datos separados
 * 3. ✅ Error Handling: Manejo consistente de errores
 * 4. ✅ Configuration: Todo configurable
 * 5. ✅ Dependency Injection: Fácil testing
 * 6. ✅ Factory Pattern: Creación de objetos centralizada
 * 7. ✅ Clear API: Interfaz pública bien definida
 */

/**
 * 💡 TU EJERCICIO 3:
 * 
 * Toma el código actual del formulario empresarial y:
 * 1. Identifica qué responsabilidades tiene cada clase
 * 2. ¿Hay alguna clase que hace demasiadas cosas?
 * 3. ¿Cómo lo reorganizarías siguiendo estos principios?
 */