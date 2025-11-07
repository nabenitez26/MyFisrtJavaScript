/**
 * Dynamic Form Validator
 * A flexible and extensible form validation system
 */

class FormValidator {
    constructor() {
        this.validationRules = new Map();
        this.errorMessages = new Map();
        this.fieldConfigs = new Map();
        
        // Initialize default validation rules
        this.initializeDefaultRules();
    }

    /**
     * Initialize default validation rules
     */
    initializeDefaultRules() {
        // Required field validation
        this.addValidationRule('required', (value, params) => {
            return value !== null && value !== undefined && value.toString().trim() !== '';
        }, 'This field is required');

        // Minimum length validation
        this.addValidationRule('minLength', (value, params) => {
            if (!value) return true; // Skip if empty (use required rule for that)
            return value.toString().length >= params.length;
        }, 'Must be at least {length} characters long');

        // Maximum length validation
        this.addValidationRule('maxLength', (value, params) => {
            if (!value) return true;
            return value.toString().length <= params.length;
        }, 'Must be no more than {length} characters long');

        // Email validation
        this.addValidationRule('email', (value, params) => {
            if (!value) return true;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }, 'Please enter a valid email address');

        // Phone validation
        this.addValidationRule('phone', (value, params) => {
            if (!value) return true;
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
        }, 'Please enter a valid phone number');

        // Number validation
        this.addValidationRule('number', (value, params) => {
            if (!value) return true;
            return !isNaN(value) && !isNaN(parseFloat(value));
        }, 'Please enter a valid number');

        // Minimum value validation
        this.addValidationRule('min', (value, params) => {
            if (!value) return true;
            return parseFloat(value) >= params.value;
        }, 'Value must be at least {value}');

        // Maximum value validation
        this.addValidationRule('max', (value, params) => {
            if (!value) return true;
            return parseFloat(value) <= params.value;
        }, 'Value must be no more than {value}');

        // Pattern validation
        this.addValidationRule('pattern', (value, params) => {
            if (!value) return true;
            const regex = new RegExp(params.pattern);
            return regex.test(value);
        }, 'Please match the required format');

        // Password strength validation
        this.addValidationRule('password', (value, params) => {
            if (!value) return true;
            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasNumbers = /\d/.test(value);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            const isLongEnough = value.length >= (params.minLength || 8);
            
            return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
        }, 'Password must contain uppercase, lowercase, numbers, special characters, and be at least 8 characters long');

        // Confirm password validation
        this.addValidationRule('confirmPassword', (value, params, formData) => {
            if (!value) return true;
            const originalPassword = formData[params.matchField];
            return value === originalPassword;
        }, 'Passwords do not match');

        // Age validation
        this.addValidationRule('age', (value, params) => {
            if (!value) return true;
            const age = parseInt(value);
            const minAge = params.min || 0;
            const maxAge = params.max || 120;
            return age >= minAge && age <= maxAge;
        }, 'Please enter a valid age between {min} and {max}');

        // Date validation
        this.addValidationRule('date', (value, params) => {
            if (!value) return true;
            const date = new Date(value);
            return date instanceof Date && !isNaN(date);
        }, 'Please enter a valid date');

        // URL validation
        this.addValidationRule('url', (value, params) => {
            if (!value) return true;
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        }, 'Please enter a valid URL');
    }

    /**
     * Add a new validation rule
     * @param {string} name - Rule name
     * @param {function} validator - Validation function
     * @param {string} message - Default error message
     */
    addValidationRule(name, validator, message) {
        this.validationRules.set(name, validator);
        this.errorMessages.set(name, message);
    }

    /**
     * Configure validation for a field
     * @param {string} fieldName - Field name
     * @param {object} config - Validation configuration
     */
    configureField(fieldName, config) {
        this.fieldConfigs.set(fieldName, config);
    }

    /**
     * Configure multiple fields at once
     * @param {object} configs - Object with field configurations
     */
    configureFields(configs) {
        Object.entries(configs).forEach(([fieldName, config]) => {
            this.configureField(fieldName, config);
        });
    }

    /**
     * Validate a single field
     * @param {string} fieldName - Field name
     * @param {any} value - Field value
     * @param {object} formData - Complete form data for cross-field validation
     * @returns {object} Validation result
     */
    validateField(fieldName, value, formData = {}) {
        const config = this.fieldConfigs.get(fieldName);
        if (!config) {
            return { isValid: true, errors: [] };
        }

        const errors = [];

        // Run each validation rule for this field
        config.rules.forEach(rule => {
            const ruleName = typeof rule === 'string' ? rule : rule.name;
            const ruleParams = typeof rule === 'string' ? {} : rule.params || {};
            const customMessage = typeof rule === 'string' ? null : rule.message;

            const validator = this.validationRules.get(ruleName);
            if (!validator) {
                console.warn(`Validation rule "${ruleName}" not found`);
                return;
            }

            const isValid = validator(value, ruleParams, formData);
            if (!isValid) {
                const message = customMessage || this.formatErrorMessage(ruleName, ruleParams);
                errors.push({
                    rule: ruleName,
                    message: message,
                    params: ruleParams
                });
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate entire form
     * @param {object} formData - Form data to validate
     * @returns {object} Validation result
     */
    validateForm(formData) {
        const results = {};
        let isFormValid = true;

        // Validate each configured field
        this.fieldConfigs.forEach((config, fieldName) => {
            const fieldValue = formData[fieldName];
            const fieldResult = this.validateField(fieldName, fieldValue, formData);
            
            results[fieldName] = fieldResult;
            if (!fieldResult.isValid) {
                isFormValid = false;
            }
        });

        return {
            isValid: isFormValid,
            fields: results,
            errors: this.getAllErrors(results)
        };
    }

    /**
     * Format error message with parameters
     * @param {string} ruleName - Rule name
     * @param {object} params - Rule parameters
     * @returns {string} Formatted message
     */
    formatErrorMessage(ruleName, params) {
        let message = this.errorMessages.get(ruleName) || 'Invalid value';
        
        // Ensure params is an object
        if (!params || typeof params !== 'object') {
            return message;
        }
        
        // Replace parameter placeholders
        Object.entries(params).forEach(([key, value]) => {
            // Check for valid values
            if (value !== null && value !== undefined && value !== '') {
                message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
            }
        });

        return message;
    }

    /**
     * Get all errors from validation results
     * @param {object} results - Validation results
     * @returns {array} All errors
     */
    getAllErrors(results) {
        const allErrors = [];
        Object.entries(results).forEach(([fieldName, result]) => {
            if (!result.isValid) {
                result.errors.forEach(error => {
                    allErrors.push({
                        field: fieldName,
                        ...error
                    });
                });
            }
        });
        return allErrors;
    }

    /**
     * Reset field configuration
     * @param {string} fieldName - Field name to reset
     */
    resetField(fieldName) {
        this.fieldConfigs.delete(fieldName);
    }

    /**
     * Clear all field configurations
     */
    clearAll() {
        this.fieldConfigs.clear();
    }

    /**
     * Get list of available validation rules
     * @returns {array} Available rule names
     */
    getAvailableRules() {
        return Array.from(this.validationRules.keys());
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}