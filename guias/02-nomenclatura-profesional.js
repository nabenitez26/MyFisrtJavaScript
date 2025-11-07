/**
 * 📚 GUÍA: Nombres de Variables y Funciones Profesionales
 * 
 * En equipos, los nombres deben ser claros para TODOS
 */

// ❌ MALOS NOMBRES (nadie entiende qué hacen)
function badExamples() {
    let d = new Date();
    let usr = 'Juan';
    let calc = (a, b) => a + b;
    let data = [];
    let flag = true;
    let temp = getUser();
}

// ✅ BUENOS NOMBRES (auto-explicativos)
function goodExamples() {
    let currentDate = new Date();
    let currentUserName = 'Juan';
    let calculateTotal = (price, tax) => price + tax;
    let validationErrors = [];
    let isFormValid = true;
    let userProfile = getUserProfile();
}

/**
 * 🎯 CONVENCIONES PROFESIONALES
 */

// 1. VARIABLES: camelCase descriptivo
const userEmail = 'user@domain.com';
const maxRetryAttempts = 3;
const isEmailValidationEnabled = true;
const currentFormData = {};

// 2. CONSTANTES: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const API_BASE_URL = 'https://api.empresa.com';
const VALIDATION_MESSAGES = {
    REQUIRED: 'Este campo es obligatorio',
    EMAIL_INVALID: 'Email inválido'
};

// 3. FUNCIONES: verbos descriptivos
function validateUserEmail(email) { /* */ }
function calculateFormProgress(formData) { /* */ }
function displayValidationError(field, message) { /* */ }
function resetFormToInitialState() { /* */ }

// 4. CLASES: PascalCase (sustantivos)
class FormValidator { /* */ }
class UserProfileManager { /* */ }
class EmailNotificationService { /* */ }

// 5. MÉTODOS PRIVADOS: prefijo underscore
class FormHandler {
    validateField(field) {
        return this._performValidation(field);
    }
    
    _performValidation(field) { // Método interno
        /* lógica interna */
    }
}

/**
 * 📋 PATRONES COMUNES PARA EQUIPOS
 */

// Booleans: is/has/can/should
const isUserLoggedIn = true;
const hasValidationErrors = false;
const canSubmitForm = true;
const shouldShowWarning = false;

// Arrays: plural descriptivo
const validationRules = [];
const userPreferences = [];
const formFields = [];
const errorMessages = [];

// Objetos: singular descriptivo
const userProfile = {};
const formConfiguration = {};
const validationResult = {};
const apiResponse = {};

// Funciones: verbo + objeto
function createUser(userData) { /* */ }
function updateUserProfile(userId, newData) { /* */ }
function deleteFormField(fieldName) { /* */ }
function fetchUserPreferences(userId) { /* */ }

/**
 * 🚫 EVITAR EN EQUIPOS
 */
function avoidThesePatterns() {
    // Nombres muy cortos (no se entienden)
    let a, b, c, x, y, z;
    let tempData = calculate();
    
    // Nombres con números sin sentido
    let data1, data2, data3;
    let user1, user2;
    
    // Abreviaciones no estándar
    let usrNm = 'username';  // user name
    let vldt = validate;     // validate
    let cfg = config;        // config
}

/**
 * 🎯 TU EJERCICIO 2:
 * Renombra estas variables con nombres profesionales
 */
function practiceNaming() {
    // ANTES (nombres malos)
    let currentDay = new Date();
    let currentUser = getCurrentUser();
    let calculatePercentage = (amount, rate) => amount * rate / 100;
    let errorList = [];
    let isProcessing = false;
    let processedData = processData();

    // DESPUÉS: Escribe mejores nombres para estas variables
    // let betterCurrentDay = ???;
    // let betterCurrentUser = ???;
    // ...
}

/**
 * 📊 HERRAMIENTAS PARA EQUIPOS
 */

// ESLint rules para nombres consistentes
module.exports = {
    rules: {
        'camelcase': 'error',
        'no-underscore-dangle': 'warn',
        'consistent-naming': 'error'
    }
};

/**
 * 💡 CONSEJO PROFESIONAL:
 * 
 * "El código se lee 10 veces más de lo que se escribe"
 * 
 * Piensa en tu compañero que va a leer tu código a las 2 AM
 * tratando de arreglar un bug urgente. ¿Entenderá qué hace?
 */