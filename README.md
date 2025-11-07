# 🚀 Sistema de Validación JavaScript Profesional

Sistema completo de validación de formularios con arquitectura modular, prácticas profesionales y capacidades de extensión dinámicas.

## ✨ Características

- ✅ **Validación en tiempo real** - Valida mientras el usuario escribe
- ✅ **Reglas dinámicas y reutilizables** - Fácil agregar validaciones personalizadas
- ✅ **Arquitectura modular extensible** - Código organizado y escalable
- ✅ **Soporte para temas claro/oscuro** - UI moderna y adaptable
- ✅ **Documentación educativa completa** - Aprende mejores prácticas
- ✅ **Código siguiendo estándares profesionales** - Listo para equipos de trabajo

## 🚀 Demo en Vivo
Abre `index.html` o `formulario-empresarial.html` en tu navegador para ver el sistema en acción.

## 🛠️ Tecnologías
- JavaScript ES6+ (Clases, Módulos, Async/Await)
- HTML5 Semantic
- CSS3 Custom Properties
- LocalStorage API
- Modular Architecture
- **Multiple validation rules per field** - Combine multiple validations
- **Customizable error messages** - Override default messages
- **Responsive design** - Works on all device sizes
- **Accessibility friendly** - Proper ARIA labels and keyboard navigation
- **No dependencies** - Pure vanilla JavaScript

## 🚀 Quick Start

1. **Include the required files in your HTML:**
```html
<link rel="stylesheet" href="css/styles.css">
<script src="js/validator.js"></script>
<script src="js/form-handler.js"></script>
<script src="js/app.js"></script>
```

2. **Create your HTML form with validation attributes:**
```html
<form id="myForm">
    <input type="text" name="username" required minlength="3" maxlength="20">
    <input type="email" name="email" required>
    <button type="submit">Submit</button>
</form>
```

3. **Initialize the form handler:**
```javascript
const validator = new FormValidator();
const formHandler = new FormHandler('#myForm', validator);
```

## 📋 Built-in Validation Rules

### Basic Validations
- `required` - Field must have a value
- `minLength` - Minimum character length
- `maxLength` - Maximum character length
- `pattern` - Regex pattern matching

### Type Validations
- `email` - Valid email format
- `phone` - Valid phone number format
- `number` - Valid numeric value
- `url` - Valid URL format
- `date` - Valid date format

### Range Validations
- `min` - Minimum numeric value
- `max` - Maximum numeric value
- `age` - Age within specified range

### Advanced Validations
- `password` - Strong password requirements
- `confirmPassword` - Password confirmation matching
- `creditCard` - Credit card number validation (Luhn algorithm)
- `cpf` - Brazilian CPF validation

## 🔧 Usage Examples

### Basic Form Setup

```html
<form id="registrationForm">
    <input type="text" 
           name="firstName" 
           required 
           minlength="2" 
           maxlength="50">
    
    <input type="email" 
           name="email" 
           required>
    
    <input type="password" 
           name="password" 
           required
           data-validate-password='{"minLength": 8}'>
    
    <button type="submit">Register</button>
</form>
```

### Custom Validation Rules

```javascript
// Add a custom validation rule
validator.addValidationRule('uniqueUsername', (value, params) => {
    // Simulate API call to check username availability
    const unavailable = ['admin', 'root', 'test'];
    return !unavailable.includes(value.toLowerCase());
}, 'This username is already taken');

// Configure field with custom rule
validator.configureField('username', {
    rules: [
        'required',
        { name: 'minLength', params: { length: 3 } },
        'uniqueUsername'
    ]
});
```

### Dynamic Field Addition

```javascript
// Create new input element
const newField = document.createElement('input');
newField.type = 'text';
newField.name = 'dynamicField';
newField.id = 'dynamicField';

// Add to form
document.getElementById('myForm').appendChild(newField);

// Configure validation
const fieldConfig = {
    rules: [
        'required',
        { name: 'minLength', params: { length: 5 } }
    ]
};

// Register with form handler
formHandler.addField('dynamicField', newField, fieldConfig);
```

### Custom Form Handler

```javascript
class MyFormHandler extends FormHandler {
    onFormValid(formData) {
        console.log('Form is valid!', formData);
        // Send data to server
        this.submitToServer(formData);
    }
    
    onFormInvalid(validationResult) {
        console.log('Validation errors:', validationResult.errors);
        // Show error summary
        this.displayErrorSummary(validationResult);
    }
    
    async submitToServer(data) {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                this.showSuccessMessage('Registration successful!');
            }
        } catch (error) {
            this.showErrorMessage('Network error occurred');
        }
    }
}

const formHandler = new MyFormHandler('#myForm');
```

## 🎨 Styling and Customization

### CSS Classes

The system automatically applies these CSS classes:

- `.valid` - Applied to valid fields
- `.invalid` - Applied to invalid fields
- `.error-message` - Container for error messages
- `.error-item` - Individual error message

### Custom Error Messages

```javascript
// Override default error message
validator.addValidationRule('customRule', 
    (value, params) => { /* validation logic */ },
    'Your custom error message here'
);

// Or use parameterized messages
validator.addValidationRule('minValue', 
    (value, params) => value >= params.min,
    'Value must be at least {min}'
);
```

## 📱 HTML Validation Attributes

The system automatically recognizes these HTML5 attributes:

```html
<!-- Basic validations -->
<input required>
<input minlength="3" maxlength="50">
<input min="1" max="100">
<input pattern="[A-Za-z]+">

<!-- Type-based validations -->
<input type="email">
<input type="tel">
<input type="number">
<input type="url">
<input type="date">

<!-- Custom validations via data attributes -->
<input data-validate-password='{"minLength": 10}'>
<input data-validate-confirmpassword='{"matchField": "password"}'>
<input data-validate-age='{"min": 18, "max": 65}'>
```

## 🔌 API Reference

### FormValidator Class

#### Methods

```javascript
// Add validation rule
addValidationRule(name, validator, message)

// Configure field validation
configureField(fieldName, config)
configureFields(configs)

// Validate
validateField(fieldName, value, formData)
validateForm(formData)

// Utility
getAvailableRules()
formatErrorMessage(ruleName, params)
resetField(fieldName)
clearAll()
```

### FormHandler Class

#### Methods

```javascript
// Field management
addField(fieldName, element, config)
removeField(fieldName)

// Validation
validateFieldRealtime(element)
validateAll()

// Data
getFormData()
getValidationState()

// UI
reset()
displayValidationResults(result)
clearFieldValidation(element)

// Hooks (override these)
onFormValid(formData)
onFormInvalid(validationResult)
```

## 🛠️ Advanced Examples

### Cross-Field Validation

```javascript
// Validate that end date is after start date
validator.addValidationRule('afterDate', (value, params, formData) => {
    if (!value || !formData[params.afterField]) return true;
    
    const startDate = new Date(formData[params.afterField]);
    const endDate = new Date(value);
    
    return endDate > startDate;
}, 'End date must be after start date');

// Configure the field
validator.configureField('endDate', {
    rules: [
        'required',
        'date',
        { name: 'afterDate', params: { afterField: 'startDate' } }
    ]
});
```

### Conditional Validation

```javascript
// Only validate phone if communication method is phone
validator.addValidationRule('conditionalRequired', (value, params, formData) => {
    const condition = formData[params.dependsOn];
    if (condition !== params.when) return true; // Skip validation
    
    return value && value.trim() !== '';
}, 'This field is required when {dependsOn} is {when}');

validator.configureField('phone', {
    rules: [
        'phone',
        { 
            name: 'conditionalRequired', 
            params: { 
                dependsOn: 'communicationMethod', 
                when: 'phone' 
            },
            message: 'Phone number is required when communication method is phone'
        }
    ]
});
```

### Async Validation

```javascript
// Async validation for checking username availability
validator.addValidationRule('asyncUsername', async (value, params) => {
    if (!value) return true;
    
    try {
        const response = await fetch(`/api/check-username?username=${value}`);
        const result = await response.json();
        return result.available;
    } catch (error) {
        return false; // Assume invalid on error
    }
}, 'Username is not available');
```

## 🎯 Best Practices

1. **Use semantic HTML** - Leverage HTML5 input types and attributes
2. **Progressive enhancement** - Form should work without JavaScript
3. **Clear error messages** - Be specific about what's wrong and how to fix it
4. **Real-time feedback** - Validate on blur, not just on submit
5. **Accessible design** - Use proper labels and ARIA attributes
6. **Mobile-friendly** - Test on various screen sizes
7. **Performance** - Debounce expensive validations like API calls

## 🐛 Troubleshooting

### Common Issues

**Validation not working:**
- Check that field has `name` or `id` attribute
- Ensure validation rules are configured before form interaction
- Verify CSS classes are being applied

**Custom rules not found:**
- Add custom rules before configuring fields
- Check rule name spelling
- Ensure rule returns boolean value

**Styling issues:**
- Include the CSS file
- Check for CSS conflicts
- Verify browser compatibility

### Debug Mode

```javascript
// Enable debug logging
window.DEBUG_VALIDATION = true;

// Check validation state
console.log(app.getValidationStatus());

// Get available rules
console.log(validator.getAvailableRules());
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - feel free to use in your projects!

## 🙏 Acknowledgments

- HTML5 Form Validation API
- Modern JavaScript ES6+ features
- CSS Grid and Flexbox for responsive design
- Accessibility guidelines from WCAG 2.1