/**
 * Example: Extending the Validation System
 * This file demonstrates how to create custom validation rules,
 * custom form handlers, and dynamic form configurations
 */

// Example 1: Custom E-commerce Form Validator
class EcommerceValidator extends FormValidator {
    constructor() {
        super();
        this.initEcommerceRules();
    }

    initEcommerceRules() {
        // SKU validation
        this.addValidationRule('sku', (value, params) => {
            if (!value) return true;
            // SKU format: 3 letters + 3-6 digits
            return /^[A-Z]{3}\d{3,6}$/.test(value.toUpperCase());
        }, 'SKU must be 3 letters followed by 3-6 digits (e.g., ABC123)');

        // Price validation
        this.addValidationRule('price', (value, params) => {
            if (!value) return true;
            const price = parseFloat(value);
            return price > 0 && price <= 999999.99;
        }, 'Price must be between $0.01 and $999,999.99');

        // Discount percentage validation
        this.addValidationRule('discount', (value, params) => {
            if (!value) return true;
            const discount = parseFloat(value);
            return discount >= 0 && discount <= 100;
        }, 'Discount must be between 0% and 100%');

        // Inventory quantity validation
        this.addValidationRule('inventory', (value, params) => {
            if (!value) return true;
            const qty = parseInt(value);
            return qty >= 0 && qty <= 999999;
        }, 'Inventory quantity must be between 0 and 999,999');

        // Category validation
        this.addValidationRule('category', (value, params) => {
            if (!value) return true;
            const validCategories = params.categories || [];
            return validCategories.includes(value);
        }, 'Please select a valid category');
    }
}

// Example 2: User Registration Form with Advanced Validations
class UserRegistrationValidator extends FormValidator {
    constructor() {
        super();
        this.initUserRules();
    }

    initUserRules() {
        // Username availability (simulated async check)
        this.addValidationRule('usernameAvailable', async (value, params) => {
            if (!value) return true;
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Simulate taken usernames
            const takenUsernames = ['admin', 'user', 'test', 'demo', 'root'];
            return !takenUsernames.includes(value.toLowerCase());
        }, 'This username is already taken');

        // Password strength with custom requirements
        this.addValidationRule('customPassword', (value, params) => {
            if (!value) return true;
            
            const requirements = {
                minLength: params.minLength || 8,
                requireUppercase: params.requireUppercase !== false,
                requireLowercase: params.requireLowercase !== false,
                requireNumbers: params.requireNumbers !== false,
                requireSpecialChars: params.requireSpecialChars !== false,
                forbiddenWords: params.forbiddenWords || []
            };

            // Check length
            if (value.length < requirements.minLength) return false;

            // Check character requirements
            if (requirements.requireUppercase && !/[A-Z]/.test(value)) return false;
            if (requirements.requireLowercase && !/[a-z]/.test(value)) return false;
            if (requirements.requireNumbers && !/\d/.test(value)) return false;
            if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) return false;

            // Check forbidden words
            const lowerValue = value.toLowerCase();
            for (const word of requirements.forbiddenWords) {
                if (lowerValue.includes(word.toLowerCase())) return false;
            }

            return true;
        }, 'Password does not meet security requirements');

        // Age verification with ID validation
        this.addValidationRule('ageVerification', (value, params, formData) => {
            if (!value) return true;
            
            const birthDate = new Date(value);
            const today = new Date();
            const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
            
            const minAge = params.minAge || 18;
            return age >= minAge;
        }, 'You must be at least {minAge} years old to register');
    }
}

// Example 3: Dynamic Form Builder
class DynamicFormBuilder {
    constructor(container, validator) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.validator = validator || new FormValidator();
        this.fields = [];
        this.fieldCounter = 0;
    }

    addTextField(config) {
        const fieldId = `field_${++this.fieldCounter}`;
        const field = {
            id: fieldId,
            type: 'text',
            ...config
        };

        const html = `
            <div class="dynamic-field" data-field-id="${fieldId}">
                <label for="${fieldId}">${field.label} ${field.required ? '*' : ''}</label>
                <input type="text" 
                       id="${fieldId}" 
                       name="${field.name || fieldId}"
                       placeholder="${field.placeholder || ''}"
                       ${field.required ? 'required' : ''}
                       ${field.minlength ? `minlength="${field.minlength}"` : ''}
                       ${field.maxlength ? `maxlength="${field.maxlength}"` : ''}>
                <button type="button" class="remove-field-btn" onclick="this.closest('.dynamic-field').remove()">
                    Remove Field
                </button>
            </div>
        `;

        this.container.insertAdjacentHTML('beforeend', html);
        this.fields.push(field);

        // Configure validation if provided
        if (field.validation) {
            this.validator.configureField(field.name || fieldId, field.validation);
        }

        return fieldId;
    }

    addSelectField(config) {
        const fieldId = `field_${++this.fieldCounter}`;
        const field = {
            id: fieldId,
            type: 'select',
            ...config
        };

        const optionsHtml = field.options.map(option => 
            `<option value="${option.value}">${option.label}</option>`
        ).join('');

        const html = `
            <div class="dynamic-field" data-field-id="${fieldId}">
                <label for="${fieldId}">${field.label} ${field.required ? '*' : ''}</label>
                <select id="${fieldId}" 
                        name="${field.name || fieldId}"
                        ${field.required ? 'required' : ''}>
                    <option value="">Select ${field.label}</option>
                    ${optionsHtml}
                </select>
                <button type="button" class="remove-field-btn" onclick="this.closest('.dynamic-field').remove()">
                    Remove Field
                </button>
            </div>
        `;

        this.container.insertAdjacentHTML('beforeend', html);
        this.fields.push(field);

        return fieldId;
    }

    addDateField(config) {
        const fieldId = `field_${++this.fieldCounter}`;
        const field = {
            id: fieldId,
            type: 'date',
            ...config
        };

        const html = `
            <div class="dynamic-field" data-field-id="${fieldId}">
                <label for="${fieldId}">${field.label} ${field.required ? '*' : ''}</label>
                <input type="date" 
                       id="${fieldId}" 
                       name="${field.name || fieldId}"
                       ${field.required ? 'required' : ''}
                       ${field.min ? `min="${field.min}"` : ''}
                       ${field.max ? `max="${field.max}"` : ''}>
                <button type="button" class="remove-field-btn" onclick="this.closest('.dynamic-field').remove()">
                    Remove Field
                </button>
            </div>
        `;

        this.container.insertAdjacentHTML('beforeend', html);
        this.fields.push(field);

        return fieldId;
    }

    getFormConfig() {
        return {
            fields: this.fields,
            validationRules: this.validator.getAvailableRules()
        };
    }

    loadFromConfig(config) {
        // Clear existing fields
        this.container.innerHTML = '';
        this.fields = [];

        // Add fields from config
        config.fields.forEach(fieldConfig => {
            switch (fieldConfig.type) {
                case 'text':
                    this.addTextField(fieldConfig);
                    break;
                case 'select':
                    this.addSelectField(fieldConfig);
                    break;
                case 'date':
                    this.addDateField(fieldConfig);
                    break;
            }
        });
    }
}

// Example 4: Form Wizard with Step Validation
class FormWizard {
    constructor(formSelector, steps) {
        this.form = document.querySelector(formSelector);
        this.steps = steps;
        this.currentStep = 0;
        this.validator = new FormValidator();
        this.stepResults = {};

        this.init();
    }

    init() {
        this.createStepNavigation();
        this.showStep(0);
        this.setupEventListeners();
    }

    createStepNavigation() {
        const nav = document.createElement('div');
        nav.className = 'wizard-navigation';
        
        this.steps.forEach((step, index) => {
            const stepIndicator = document.createElement('div');
            stepIndicator.className = 'step-indicator';
            stepIndicator.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-title">${step.title}</div>
            `;
            stepIndicator.addEventListener('click', () => this.goToStep(index));
            nav.appendChild(stepIndicator);
        });

        this.form.insertBefore(nav, this.form.firstChild);
        this.navigation = nav;
    }

    showStep(stepIndex) {
        // Hide all steps
        this.steps.forEach((step, index) => {
            const stepElement = document.querySelector(step.selector);
            if (stepElement) {
                stepElement.style.display = index === stepIndex ? 'block' : 'none';
            }
        });

        // Update navigation
        const indicators = this.navigation.querySelectorAll('.step-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index === stepIndex) {
                indicator.classList.add('active');
            } else if (index < stepIndex) {
                indicator.classList.add('completed');
            }
        });

        this.currentStep = stepIndex;
    }

    validateCurrentStep() {
        const step = this.steps[this.currentStep];
        const stepElement = document.querySelector(step.selector);
        const fields = stepElement.querySelectorAll('input, select, textarea');
        
        let isValid = true;
        const stepData = {};

        fields.forEach(field => {
            const fieldName = field.name || field.id;
            stepData[fieldName] = field.value;

            // Validate field if rules exist
            if (step.validation && step.validation[fieldName]) {
                this.validator.configureField(fieldName, step.validation[fieldName]);
                const result = this.validator.validateField(fieldName, field.value, stepData);
                
                if (!result.isValid) {
                    isValid = false;
                    this.displayFieldError(field, result.errors);
                } else {
                    this.clearFieldError(field);
                }
            }
        });

        this.stepResults[this.currentStep] = { isValid, data: stepData };
        return isValid;
    }

    nextStep() {
        if (this.validateCurrentStep() && this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    goToStep(stepIndex) {
        // Validate all previous steps
        let canGo = true;
        for (let i = 0; i < stepIndex; i++) {
            this.showStep(i);
            if (!this.validateCurrentStep()) {
                canGo = false;
                break;
            }
        }

        if (canGo) {
            this.showStep(stepIndex);
        }
    }

    setupEventListeners() {
        // Add next/previous buttons to each step
        this.steps.forEach((step, index) => {
            const stepElement = document.querySelector(step.selector);
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'wizard-buttons';
            
            if (index > 0) {
                const prevBtn = document.createElement('button');
                prevBtn.type = 'button';
                prevBtn.textContent = 'Previous';
                prevBtn.className = 'btn btn-secondary';
                prevBtn.addEventListener('click', () => this.previousStep());
                buttonContainer.appendChild(prevBtn);
            }

            if (index < this.steps.length - 1) {
                const nextBtn = document.createElement('button');
                nextBtn.type = 'button';
                nextBtn.textContent = 'Next';
                nextBtn.className = 'btn btn-primary';
                nextBtn.addEventListener('click', () => this.nextStep());
                buttonContainer.appendChild(nextBtn);
            } else {
                const submitBtn = document.createElement('button');
                submitBtn.type = 'submit';
                submitBtn.textContent = 'Submit';
                submitBtn.className = 'btn btn-primary';
                buttonContainer.appendChild(submitBtn);
            }

            stepElement.appendChild(buttonContainer);
        });
    }

    displayFieldError(field, errors) {
        this.clearFieldError(field);
        
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        
        errors.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-item';
            errorElement.textContent = error.message;
            errorContainer.appendChild(errorElement);
        });

        field.parentNode.insertBefore(errorContainer, field.nextSibling);
        field.classList.add('invalid');
    }

    clearFieldError(field) {
        field.classList.remove('invalid');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    getAllData() {
        const allData = {};
        Object.values(this.stepResults).forEach(step => {
            Object.assign(allData, step.data);
        });
        return allData;
    }
}

// Example usage demonstrations
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Advanced validation examples loaded!');
    console.log('Available classes:');
    console.log('- EcommerceValidator: Specialized for e-commerce forms');
    console.log('- UserRegistrationValidator: Advanced user registration');
    console.log('- DynamicFormBuilder: Build forms programmatically');
    console.log('- FormWizard: Multi-step form with validation');
});

// Export classes for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EcommerceValidator,
        UserRegistrationValidator,
        DynamicFormBuilder,
        FormWizard
    };
}