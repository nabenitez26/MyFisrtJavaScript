/**
 * Main Application Script
 * Initializes the form handler and demonstrates the validation system
 */

class ValidationApp {
    constructor() {
        this.validator = new FormValidator();
        this.formHandler = null;
        this.customFieldCounter = 0;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup the application after DOM is ready
     */
    setup() {
        this.initializeFormHandler();
        this.setupCustomValidations();
        this.setupEventListeners();
        this.setupDynamicFields();
        this.setupThemeToggle();
        
        console.log('Validation App initialized successfully');
        console.log('Available validation rules:', this.validator.getAvailableRules());
    }

    /**
     * Initialize the form handler
     */
    initializeFormHandler() {
        // Create custom form handler class that extends the base FormHandler
        class CustomFormHandler extends FormHandler {
            onFormValid(formData) {
                console.log('✅ Form validation passed!', formData);
                this.showFormSummary(formData);
                this.showSuccessMessage();
            }

            onFormInvalid(validationResult) {
                console.log('❌ Form validation failed:', validationResult);
                this.hideFormSummary();
                this.showErrorSummary(validationResult);
            }

            showFormSummary(formData) {
                const summaryElement = document.getElementById('formSummary');
                const summaryContent = document.getElementById('summaryContent');
                
                let html = '';
                Object.entries(formData).forEach(([key, value]) => {
                    if (value && value !== '') {
                        const label = this.getFieldLabel(key);
                        const displayValue = this.formatDisplayValue(key, value);
                        html += `
                            <div class="summary-field">
                                <span class="summary-label">${label}:</span>
                                <span class="summary-value">${displayValue}</span>
                            </div>
                        `;
                    }
                });

                summaryContent.innerHTML = html;
                summaryElement.style.display = 'block';
                summaryElement.scrollIntoView({ behavior: 'smooth' });
            }

            hideFormSummary() {
                const summaryElement = document.getElementById('formSummary');
                summaryElement.style.display = 'none';
            }

            getFieldLabel(fieldName) {
                const element = document.querySelector(`[name="${fieldName}"]`);
                if (element) {
                    const label = document.querySelector(`label[for="${element.id}"]`);
                    if (label) {
                        return label.textContent.replace('*', '').trim();
                    }
                }
                return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
            }

            formatDisplayValue(fieldName, value) {
                // Format boolean values
                if (typeof value === 'boolean') {
                    return value ? 'Yes' : 'No';
                }

                // Format arrays (for checkboxes)
                if (Array.isArray(value)) {
                    return value.join(', ');
                }

                // Format password fields
                if (fieldName.toLowerCase().includes('password')) {
                    return '••••••••';
                }

                // Truncate long text
                if (typeof value === 'string' && value.length > 50) {
                    return value.substring(0, 50) + '...';
                }

                return value;
            }

            showSuccessMessage() {
                // Remove existing success messages
                const existingMessage = document.querySelector('.success-message');
                if (existingMessage) {
                    existingMessage.remove();
                }

                const message = document.createElement('div');
                message.className = 'success-message';
                message.innerHTML = `
                    <strong>🎉 Registration Successful!</strong>
                    <br>Your account has been created successfully. Check your email for confirmation.
                `;

                const form = document.getElementById('registrationForm');
                form.insertBefore(message, form.firstChild);
            }

            showErrorSummary(validationResult) {
                console.log('Validation errors:', validationResult.errors);
                
                // Focus on first invalid field
                const firstError = validationResult.errors[0];
                if (firstError) {
                    const field = document.querySelector(`[name="${firstError.field}"]`);
                    if (field) {
                        field.focus();
                    }
                }
            }
        }

        this.formHandler = new CustomFormHandler('#registrationForm', this.validator);
    }

    /**
     * Setup custom validation rules
     */
    setupCustomValidations() {
        // Add a custom username availability validation (simulated)
        this.validator.addValidationRule('usernameAvailable', (value, params) => {
            if (!value) return true;
            
            // Simulate checking username availability
            const unavailableUsernames = ['admin', 'root', 'user', 'test', 'demo'];
            return !unavailableUsernames.includes(value.toLowerCase());
        }, 'This username is not available');

        // Add Brazilian CPF validation example
        this.validator.addValidationRule('cpf', (value, params) => {
            if (!value) return true;
            
            // Remove non-numeric characters
            const cpf = value.replace(/\D/g, '');
            
            // Check if it has 11 digits
            if (cpf.length !== 11) return false;
            
            // Check for invalid sequences
            if (/^(\d)\1{10}$/.test(cpf)) return false;
            
            // CPF validation algorithm
            let sum = 0;
            for (let i = 0; i < 9; i++) {
                sum += parseInt(cpf.charAt(i)) * (10 - i);
            }
            let remainder = 11 - (sum % 11);
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cpf.charAt(9))) return false;
            
            sum = 0;
            for (let i = 0; i < 10; i++) {
                sum += parseInt(cpf.charAt(i)) * (11 - i);
            }
            remainder = 11 - (sum % 11);
            if (remainder === 10 || remainder === 11) remainder = 0;
            return remainder === parseInt(cpf.charAt(10));
        }, 'Please enter a valid CPF number');

        // Add credit card validation
        this.validator.addValidationRule('creditCard', (value, params) => {
            if (!value) return true;
            
            // Remove spaces and dashes
            const cardNumber = value.replace(/[\s-]/g, '');
            
            // Check if it's all digits
            if (!/^\d+$/.test(cardNumber)) return false;
            
            // Luhn algorithm
            let sum = 0;
            let isEven = false;
            
            for (let i = cardNumber.length - 1; i >= 0; i--) {
                let digit = parseInt(cardNumber.charAt(i));
                
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }
                
                sum += digit;
                isEven = !isEven;
            }
            
            return sum % 10 === 0;
        }, 'Please enter a valid credit card number');

        // Configure the username field with custom validation
        const usernameConfig = this.formHandler.fields.get('username')?.config || { rules: [] };
        usernameConfig.rules.push('usernameAvailable');
        this.validator.configureField('username', usernameConfig);
    }

    /**
     * Setup additional event listeners
     */
    setupEventListeners() {
        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.formHandler.reset();
                this.hideMessages();
            });
        }

        // Add field button
        const addFieldBtn = document.getElementById('addFieldBtn');
        if (addFieldBtn) {
            addFieldBtn.addEventListener('click', () => {
                this.addCustomField();
            });
        }

        // Form validation trigger on field changes
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.updateValidationState();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to submit form
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('registrationForm').dispatchEvent(new Event('submit'));
            }
            
            // Escape to reset form
            if (e.key === 'Escape') {
                this.formHandler.reset();
                this.hideMessages();
            }
        });
    }

    /**
     * Setup dynamic field functionality
     */
    setupDynamicFields() {
        // Example of adding a field programmatically
        this.addExampleCustomField();
    }

    /**
     * Add an example custom field to demonstrate dynamic field addition
     */
    addExampleCustomField() {
        // This is just for demonstration - normally you wouldn't add this automatically
        console.log('Dynamic field system ready. Click "Add Custom Field" to see it in action.');
    }

    /**
     * Add a custom field dynamically
     */
    addCustomField() {
        this.customFieldCounter++;
        const fieldName = `customField${this.customFieldCounter}`;
        const container = document.getElementById('customFieldContainer');

        const fieldHtml = `
            <div class="custom-field" id="customField_${this.customFieldCounter}">
                <label for="${fieldName}">Custom Field ${this.customFieldCounter}</label>
                <input type="text" 
                       id="${fieldName}" 
                       name="${fieldName}" 
                       placeholder="Enter value..."
                       minlength="3"
                       maxlength="50"
                       required>
                <button type="button" class="remove-field" onclick="app.removeCustomField(${this.customFieldCounter})">
                    Remove Field
                </button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', fieldHtml);

        // Get the newly created input element
        const inputElement = document.getElementById(fieldName);

        // Configure validation for the new field
        const fieldConfig = {
            rules: [
                'required',
                { name: 'minLength', params: { length: 3 } },
                { name: 'maxLength', params: { length: 50 } }
            ]
        };

        // Add the field to the form handler
        this.formHandler.addField(fieldName, inputElement, fieldConfig);

        console.log(`Added custom field: ${fieldName}`);
    }

    /**
     * Remove a custom field
     * @param {number} fieldNumber - Field number to remove
     */
    removeCustomField(fieldNumber) {
        const fieldElement = document.getElementById(`customField_${fieldNumber}`);
        const fieldName = `customField${fieldNumber}`;

        if (fieldElement) {
            // Remove from form handler
            this.formHandler.removeField(fieldName);
            
            // Remove from DOM
            fieldElement.remove();
            
            console.log(`Removed custom field: ${fieldName}`);
        }
    }

    /**
     * Update validation state display
     */
    updateValidationState() {
        // This could be used to show real-time validation status
        const state = this.formHandler.getValidationState();
        // You could update a status indicator here
    }

    /**
     * Hide success/error messages
     */
    hideMessages() {
        const messages = document.querySelectorAll('.success-message, .error-message');
        messages.forEach(msg => msg.remove());
    }

    /**
     * Add a new validation rule dynamically
     * @param {string} name - Rule name
     * @param {function} validator - Validation function
     * @param {string} message - Error message
     */
    addValidationRule(name, validator, message) {
        this.validator.addValidationRule(name, validator, message);
        console.log(`Added validation rule: ${name}`);
    }

    /**
     * Setup theme toggle functionality
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const themeIcon = themeToggle.querySelector('.theme-icon');
        const themeText = themeToggle.querySelector('.theme-text');
        
        // Verificar tema guardado o usar tema claro por defecto
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(savedTheme);
        this.updateThemeButton(savedTheme, themeIcon, themeText);
        
        // Evento para cambiar tema
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            this.applyTheme(newTheme);
            this.updateThemeButton(newTheme, themeIcon, themeText);
            localStorage.setItem('theme', newTheme);
            
            console.log(`🌓 Theme changed to: ${newTheme}`);
        });
        
        console.log('✅ Theme toggle configured');
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
    }

    /**
     * Update theme button appearance
     */
    updateThemeButton(theme, themeIcon, themeText) {
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Dark Mode';
        }
    }

    /**
     * Get form validation status
     * @returns {object} Validation status
     */
    getValidationStatus() {
        return this.formHandler.getValidationState();
    }

    /**
     * Validate form programmatically
     * @returns {object} Validation result
     */
    validateForm() {
        return this.formHandler.validateAll();
    }

    /**
     * Get form data
     * @returns {object} Current form data
     */
    getFormData() {
        return this.formHandler.getFormData();
    }

    /**
     * Change theme programmatically
     * @param {string} theme - 'light' or 'dark'
     */
    changeTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.warn('Invalid theme. Use "light" or "dark"');
            return;
        }
        
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const themeIcon = themeToggle.querySelector('.theme-icon');
        const themeText = themeToggle.querySelector('.theme-text');
        
        this.applyTheme(theme);
        this.updateThemeButton(theme, themeIcon, themeText);
        localStorage.setItem('theme', theme);
        
        console.log(`🌓 Theme changed programmatically to: ${theme}`);
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
}

// Initialize the application when the script loads
const app = new ValidationApp();

// Expose app to global scope for debugging and console interaction
window.app = app;

// Example of how to add custom validation rules at runtime
document.addEventListener('DOMContentLoaded', () => {
    // Example: Add a custom validation rule for strong passwords
    app.addValidationRule('superStrongPassword', (value, params) => {
        if (!value) return true;
        
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        const hasNoCommonWords = !/(password|123456|qwerty|admin)/i.test(value);
        const isLongEnough = value.length >= 12;
        
        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && hasNoCommonWords && isLongEnough;
    }, 'Password must be at least 12 characters with uppercase, lowercase, numbers, special characters, and no common words');

    console.log('🚀 Dynamic Form Validation System Ready!');
    console.log('📝 Try filling out the form to see validation in action');
    console.log('🔧 Use app.addValidationRule() to add custom rules');
    console.log('📊 Use app.validateForm() to validate programmatically');
    console.log('📋 Use app.getFormData() to get current form data');
});