/**
 * 🎯 EJERCICIO PRÁCTICO #1: "Mi Primer Código Profesional"
 * 
 * OBJETIVO: Transformar código funcional en código profesional
 * TIEMPO: 30-45 minutos
 * NIVEL: Principiante → Intermedio
 */

// ========================================
// 🔴 CÓDIGO "ANTES" (Funcional pero no profesional)
// ========================================

// Función original del validador (ejemplo simplificado)
function validate(d, rules) {
    let errors = [];
    for(let r of rules) {
        if(r.type === 'required' && !d) {
            errors.push('Required');
        }
        if(r.type === 'email' && d && !d.includes('@')) {
            errors.push('Invalid email');
        }
    }
    return errors;
}

// ========================================
// 🟢 CÓDIGO "DESPUÉS" (Profesional)
// ========================================

/**
 * Validates input data against a set of validation rules
 * 
 * @description This function applies multiple validation rules to a single input value.
 * It's designed to be pure (no side effects) and predictable (same input = same output).
 * 
 * @param {string|number} inputValue - The value to validate (user input from form field)
 * @param {Array<ValidationRule>} validationRules - Array of rule objects defining validation criteria
 * @param {Object} [context={}] - Additional context for complex validations (field name, form data, etc.)
 * 
 * @returns {ValidationResult} Object containing validation status and error messages
 * 
 * @example
 * // Basic usage
 * const result = validateInputAgainstRules('user@email.com', [
 *   { type: 'required', message: 'Email is required' },
 *   { type: 'email', message: 'Please enter a valid email address' }
 * ]);
 * 
 * @example
 * // With context for complex validations
 * const result = validateInputAgainstRules('password123', [
 *   { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
 * ], { fieldName: 'password', userName: 'john_doe' });
 * 
 * @since 1.0.0
 * @author Tu nombre
 */
function validateInputAgainstRules(inputValue, validationRules, context = {}) {
    // Guard against invalid inputs early
    if (!Array.isArray(validationRules)) {
        throw new TypeError('validationRules must be an array');
    }

    const validationErrors = [];
    const normalizedValue = inputValue?.toString().trim() || '';

    // Process each validation rule independently
    for (const currentRule of validationRules) {
        try {
            const ruleResult = applySingleValidationRule(normalizedValue, currentRule, context);
            
            if (!ruleResult.isValid) {
                validationErrors.push({
                    type: currentRule.type,
                    message: ruleResult.errorMessage,
                    fieldName: context.fieldName || 'unknown',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (ruleError) {
            // Log error for debugging but don't break validation flow
            console.error(`Validation rule failed: ${currentRule.type}`, ruleError);
            
            validationErrors.push({
                type: 'validation_error',
                message: 'An unexpected validation error occurred',
                originalError: ruleError.message,
                fieldName: context.fieldName || 'unknown'
            });
        }
    }

    return {
        isValid: validationErrors.length === 0,
        errorCount: validationErrors.length,
        errors: validationErrors,
        validatedValue: normalizedValue,
        processingTimestamp: new Date().toISOString()
    };
}

/**
 * Applies a single validation rule to an input value
 * 
 * @description This is a pure function that handles one specific validation rule.
 * It's separated from the main validator to follow Single Responsibility Principle.
 * 
 * @param {string} value - Normalized input value to validate
 * @param {ValidationRule} rule - Single validation rule object
 * @param {Object} context - Additional context for rule processing
 * 
 * @returns {RuleResult} Object indicating if rule passed and any error message
 * 
 * @private This function is internal to the validation system
 */
function applySingleValidationRule(value, rule, context) {
    // Handle required field validation
    if (rule.type === 'required') {
        const isEmpty = !value || value.length === 0;
        return {
            isValid: !isEmpty,
            errorMessage: isEmpty ? (rule.message || 'This field is required') : null
        };
    }

    // Handle email format validation
    if (rule.type === 'email') {
        // Only validate if value exists (required check is separate)
        if (!value) {
            return { isValid: true, errorMessage: null };
        }

        const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmailFormat = emailRegexPattern.test(value);
        
        return {
            isValid: isValidEmailFormat,
            errorMessage: isValidEmailFormat ? null : (rule.message || 'Please enter a valid email address')
        };
    }

    // Handle minimum length validation
    if (rule.type === 'minLength') {
        if (!value) {
            return { isValid: true, errorMessage: null };
        }

        const meetsMinimumLength = value.length >= (rule.value || 0);
        return {
            isValid: meetsMinimumLength,
            errorMessage: meetsMinimumLength ? null : 
                (rule.message || `Must be at least ${rule.value} characters long`)
        };
    }

    // Unknown rule type - log warning and skip
    console.warn(`Unknown validation rule type: ${rule.type}`);
    return { isValid: true, errorMessage: null };
}

// ========================================
// 📚 EJERCICIO PARA TI
// ========================================

/**
 * 🎯 TU MISIÓN: Refactorizar esta función siguiendo el ejemplo anterior
 * 
 * FUNCIÓN ACTUAL (en validator.js):
 * validatePassword(password) {
 *   if (!password) return false;
 *   if (password.length < 8) return false;
 *   if (!/[A-Z]/.test(password)) return false;
 *   if (!/[a-z]/.test(password)) return false;
 *   if (!/[0-9]/.test(password)) return false;
 *   return true;
 * }
 * 
 * INSTRUCCIONES:
 * 1. 📝 Agrega documentación JSDoc completa
 * 2. 🏗️ Mejora la estructura (nombres claros, lógica separada)
 * 3. 🛡️ Agrega manejo de errores
 * 4. 📊 Retorna información detallada sobre qué falló
 * 5. 🧪 Piensa en cómo testearías esta función
 * 
 * RESULTADO ESPERADO:
 * - Función que retorna objeto con detalles de validación
 * - Mensajes específicos para cada tipo de error
 * - Manejo robusto de inputs inesperados
 * - Documentación que otro desarrollador pueda entender
 */

// 📝 ESCRIBE TU SOLUCIÓN AQUÍ:

// TODO: Implementar validatePasswordWithDetails() siguiendo el ejemplo anterior

// ========================================
// 🧪 TESTS PARA VERIFICAR TU CÓDIGO
// ========================================

/**
 * Función de testing simple para verificar tu implementación
 */
function testPasswordValidation() {
    console.log('🧪 Testing password validation...');
    
    // Test cases que tu función debería pasar
    const testCases = [
        {
            input: 'Password123',
            expected: { isValid: true },
            description: 'Valid password should pass'
        },
        {
            input: 'weak',
            expected: { isValid: false },
            description: 'Short password should fail'
        },
        {
            input: null,
            expected: { isValid: false },
            description: 'Null input should be handled gracefully'
        },
        {
            input: 'nouppercasehere123',
            expected: { isValid: false },
            description: 'Password without uppercase should fail'
        }
    ];

    // TODO: Uncomment and run when you've implemented your function
    /*
    testCases.forEach(testCase => {
        try {
            const result = validatePasswordWithDetails(testCase.input);
            const passed = result.isValid === testCase.expected.isValid;
            console.log(`${passed ? '✅' : '❌'} ${testCase.description}`);
            if (!passed) {
                console.log(`Expected: ${testCase.expected.isValid}, Got: ${result.isValid}`);
            }
        } catch (error) {
            console.log(`❌ ${testCase.description} - Threw error: ${error.message}`);
        }
    });
    */
}

// ========================================
// 📋 CHECKLIST DE CALIDAD
// ========================================

/**
 * ✅ ANTES DE ENVIAR TU CÓDIGO, VERIFICA:
 * 
 * 📝 DOCUMENTACIÓN:
 * □ JSDoc completo con @param y @returns
 * □ Ejemplos de uso claros
 * □ Descripción del propósito de la función
 * 
 * 🏗️ ESTRUCTURA:
 * □ Nombres de variables auto-explicativos
 * □ Funciones pequeñas y enfocadas
 * □ Lógica fácil de seguir
 * 
 * 🛡️ ROBUSTEZ:
 * □ Maneja inputs null/undefined
 * □ Retorna información útil sobre errores
 * □ No se rompe con inputs inesperados
 * 
 * 🧪 TESTABILIDAD:
 * □ Función pura (sin efectos secundarios)
 * □ Fácil de testear con diferentes inputs
 * □ Retorna información verificable
 * 
 * 🎯 PROFESIONALISMO:
 * □ Otro desarrollador puede entender el código
 * □ Código que estarías orgulloso de mostrar
 * □ Fácil de mantener y extender
 */

// ========================================
// 💬 ENVÍA TU SOLUCIÓN
// ========================================

/**
 * Cuando termines:
 * 1. Copia tu función validatePasswordWithDetails()
 * 2. Compártela conmigo para feedback
 * 3. Explica las decisiones que tomaste
 * 4. Menciona qué fue lo más difícil
 * 
 * ¡Estoy aquí para ayudarte a mejorar! 🚀
 */