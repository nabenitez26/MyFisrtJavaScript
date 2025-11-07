/**
 * Dynamic Form Handler
 * Handles form interactions, validation, and UI updates
 */

class FormHandler {
    constructor(formSelector, validator = null) {
        this.form = document.querySelector(formSelector);
        this.validator = validator || new FormValidator();
        this.fields = new Map();
        this.validationResults = {};
        
        if (!this.form) {
            throw new Error(`Form not found with selector: ${formSelector}`);
        }

        this.init();
    }

    /**
     * Initialize form handler
     */
    init() {
        this.setupEventListeners();
        this.discoverFields();
    }

    /**
     * Discover form fields and their validation attributes
     */
    discoverFields() {
        const formElements = this.form.querySelectorAll('input, select, textarea');
        
        formElements.forEach(element => {
            const fieldName = element.name || element.id;
            if (!fieldName) return;

            const config = this.parseValidationAttributes(element);
            this.fields.set(fieldName, {
                element: element,
                config: config
            });

            // Configure validator if rules exist
            if (config.rules && config.rules.length > 0) {
                this.validator.configureField(fieldName, config);
            }
        });
    }

    /**
     * Parse validation attributes from HTML element
     * @param {HTMLElement} element - Form element
     * @returns {object} Validation configuration
     */
    parseValidationAttributes(element) {
        const config = { rules: [] };

        // Required validation
        if (element.hasAttribute('required') || element.dataset.required === 'true') {
            config.rules.push('required');
        }

        // Type-based validation
        if (element.type === 'email') {
            config.rules.push('email');
        }
        if (element.type === 'tel') {
            config.rules.push('phone');
        }
        if (element.type === 'number') {
            config.rules.push('number');
        }
        if (element.type === 'url') {
            config.rules.push('url');
        }
        if (element.type === 'date') {
            config.rules.push('date');
        }

        // Length validations
        const minlengthAttr = element.getAttribute('minlength');
        const maxlengthAttr = element.getAttribute('maxlength');
        
        if (minlengthAttr && !isNaN(minlengthAttr)) {
            config.rules.push({
                name: 'minLength',
                params: { length: parseInt(minlengthAttr) }
            });
        }
        if (maxlengthAttr && !isNaN(maxlengthAttr)) {
            config.rules.push({
                name: 'maxLength',
                params: { length: parseInt(maxlengthAttr) }
            });
        }

        // Value range validations
        if (element.min && !isNaN(element.min)) {
            config.rules.push({
                name: 'min',
                params: { value: parseFloat(element.min) }
            });
        }
        if (element.max && !isNaN(element.max)) {
            config.rules.push({
                name: 'max',
                params: { value: parseFloat(element.max) }
            });
        }

        // Pattern validation
        if (element.pattern) {
            config.rules.push({
                name: 'pattern',
                params: { pattern: element.pattern }
            });
        }

        // Custom validation rules from data attributes
        Object.keys(element.dataset).forEach(key => {
            if (key.startsWith('validate')) {
                const ruleName = key.replace('validate', '').toLowerCase();
                const ruleValue = element.dataset[key];
                
                if (ruleValue === 'true' || ruleValue === '') {
                    config.rules.push(ruleName);
                } else {
                    try {
                        const params = JSON.parse(ruleValue);
                        config.rules.push({
                            name: ruleName,
                            params: params
                        });
                    } catch {
                        config.rules.push({
                            name: ruleName,
                            params: { value: ruleValue }
                        });
                    }
                }
            }
        });

        return config;
    }

    /**
     * Setup event listeners for form interactions
     */
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation on input
        this.form.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateFieldRealtime(e.target);
            }
        });

        // Validation on blur
        this.form.addEventListener('blur', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateFieldRealtime(e.target);
            }
        }, true);

        // Clear validation on focus
        this.form.addEventListener('focus', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.clearFieldValidation(e.target);
            }
        }, true);
    }

    /**
     * Handle form submission
     */
    handleSubmit() {
        const formData = this.getFormData();
        const validationResult = this.validator.validateForm(formData);
        
        this.displayValidationResults(validationResult);

        if (validationResult.isValid) {
            this.onFormValid(formData);
        } else {
            this.onFormInvalid(validationResult);
        }
    }

    /**
     * Get form data as object
     * @returns {object} Form data
     */
    getFormData() {
        const formData = {};
        this.fields.forEach((fieldInfo, fieldName) => {
            const element = fieldInfo.element;
            
            if (element.type === 'checkbox') {
                formData[fieldName] = element.checked;
            } else if (element.type === 'radio') {
                if (element.checked) {
                    formData[fieldName] = element.value;
                }
            } else {
                formData[fieldName] = element.value;
            }
        });
        return formData;
    }

    /**
     * Validate field in real-time
     * @param {HTMLElement} element - Form element
     */
    validateFieldRealtime(element) {
        const fieldName = element.name || element.id;
        if (!fieldName || !this.fields.has(fieldName)) return;

        const formData = this.getFormData();
        const result = this.validator.validateField(fieldName, element.value, formData);
        
        this.displayFieldValidation(element, result);
    }

    /**
     * Display validation results for the entire form
     * @param {object} validationResult - Validation result
     */
    displayValidationResults(validationResult) {
        this.validationResults = validationResult;

        // Display field-specific errors
        Object.entries(validationResult.fields).forEach(([fieldName, result]) => {
            const fieldInfo = this.fields.get(fieldName);
            if (fieldInfo) {
                this.displayFieldValidation(fieldInfo.element, result);
            }
        });
    }

    /**
     * Display validation result for a specific field
     * @param {HTMLElement} element - Form element
     * @param {object} result - Validation result
     */
    displayFieldValidation(element, result) {
        // Remove existing validation classes and messages
        this.clearFieldValidation(element);

        if (result.isValid) {
            element.classList.add('valid');
        } else {
            element.classList.add('invalid');
            this.showFieldErrors(element, result.errors);
        }
    }

    /**
     * Clear validation styling and messages for a field
     * @param {HTMLElement} element - Form element
     */
    clearFieldValidation(element) {
        element.classList.remove('valid', 'invalid');
        
        // Remove existing error messages
        const existingError = element.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    /**
     * Show error messages for a field
     * @param {HTMLElement} element - Form element
     * @param {array} errors - Array of error objects
     */
    showFieldErrors(element, errors) {
        if (errors.length === 0) return;

        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        
        errors.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-item';
            errorElement.textContent = error.message;
            errorContainer.appendChild(errorElement);
        });

        // Insert error message after the field
        element.parentNode.insertBefore(errorContainer, element.nextSibling);
    }

    /**
     * Add a new field dynamically
     * @param {string} fieldName - Field name
     * @param {HTMLElement} element - Form element
     * @param {object} config - Validation configuration
     */
    addField(fieldName, element, config = {}) {
        this.fields.set(fieldName, {
            element: element,
            config: config
        });

        if (config.rules && config.rules.length > 0) {
            this.validator.configureField(fieldName, config);
        }

        // Add event listeners to new field
        element.addEventListener('input', () => this.validateFieldRealtime(element));
        element.addEventListener('blur', () => this.validateFieldRealtime(element));
        element.addEventListener('focus', () => this.clearFieldValidation(element));
    }

    /**
     * Remove a field
     * @param {string} fieldName - Field name
     */
    removeField(fieldName) {
        const fieldInfo = this.fields.get(fieldName);
        if (fieldInfo) {
            this.clearFieldValidation(fieldInfo.element);
            this.fields.delete(fieldName);
            this.validator.resetField(fieldName);
        }
    }

    /**
     * Get validation state
     * @returns {object} Current validation state
     */
    getValidationState() {
        return {
            isValid: this.validationResults.isValid || false,
            results: this.validationResults,
            formData: this.getFormData()
        };
    }

    /**
     * Override this method to handle valid form submission
     * @param {object} formData - Valid form data
     */
    onFormValid(formData) {
        console.log('Form is valid:', formData);
        // Override this method in your implementation
    }

    /**
     * Override this method to handle invalid form submission
     * @param {object} validationResult - Validation result
     */
    onFormInvalid(validationResult) {
        console.log('Form is invalid:', validationResult);
        // Override this method in your implementation
    }

    /**
     * Manually trigger validation for all fields
     */
    validateAll() {
        const formData = this.getFormData();
        const validationResult = this.validator.validateForm(formData);
        this.displayValidationResults(validationResult);
        return validationResult;
    }

    /**
     * Reset form and clear all validation
     */
    reset() {
        this.form.reset();
        this.fields.forEach((fieldInfo) => {
            this.clearFieldValidation(fieldInfo.element);
        });
        this.validationResults = {};
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
}