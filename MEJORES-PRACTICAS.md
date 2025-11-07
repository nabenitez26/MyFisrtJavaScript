# 📋 Mejores Prácticas de Validación - Formulario Empresarial

Este documento explica las mejores prácticas implementadas en el formulario empresarial y cómo reutilizar las validaciones existentes de manera eficiente.

## 🎯 **Mejores Prácticas Implementadas**

### **1. 🔄 Reutilización de Reglas Base**

```javascript
// ✅ BUENA PRÁCTICA: Extender reglas existentes
this.validator.addValidationRule('price', (value, params) => {
    if (!value) return true;
    const price = parseFloat(value);
    return price > 0 && price <= 999999999.99 && /^\d+(\.\d{1,2})?$/.test(value);
}, 'Ingrese un precio válido (máximo 2 decimales)');

// Usar en HTML:
<input data-validate-price="true">
```

**❌ Evitar:** Reescribir validaciones que ya existen
```javascript
// MAL: Duplicar lógica existente
this.validator.addValidationRule('emailEmpresa', (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // Ya existe 'email'
});
```

### **2. 📝 Configuración Declarativa**

```javascript
// ✅ BUENA PRÁCTICA: Configuración centralizada
const configuraciones = {
    capitalSocial: {
        rules: [
            'required',
            'number',
            { name: 'min', params: { value: 1000 } },
            'price'  // ← Reutiliza regla personalizada
        ]
    },
    numeroEmpleados: {
        rules: [
            'required',
            'inventory', // ← Reutiliza regla personalizada
            { name: 'min', params: { value: 1 } }
        ]
    }
};
```

**❌ Evitar:** Configuración dispersa y repetitiva
```javascript
// MAL: Configuración en múltiples lugares
document.getElementById('campo1').addEventListener('blur', validarCampo1);
document.getElementById('campo2').addEventListener('blur', validarCampo2);
// ... código duplicado para cada campo
```

### **3. 🏗️ Validaciones Específicas del Dominio**

```javascript
// ✅ BUENA PRÁCTICA: Validaciones de negocio reutilizables
this.validator.addValidationRule('nitValido', (value, params) => {
    if (!value) return true;
    const nit = value.replace(/\D/g, '');
    return /^\d{8,15}$/.test(nit);
}, 'Ingrese un NIT/RUC válido');

this.validator.addValidationRule('codigoEmpresa', (value, params) => {
    if (!value) return true;
    return /^[A-Z]{2,3}\d{3,7}$/.test(value.toUpperCase());
}, 'Formato: 2-3 letras seguidas de números (ej: EMP001)');
```

### **4. 🔗 Validaciones Cruzadas**

```javascript
// ✅ BUENA PRÁCTICA: Validación que depende de otros campos
this.validator.addValidationRule('minSelected', (value, params, formData) => {
    const form = document.getElementById('empresarialForm');
    const checkboxes = form.querySelectorAll(`[name="${params.group}"]:checked`);
    return checkboxes.length >= (params.min || 1);
}, 'Debe seleccionar al menos {min} opción(es)');

// Uso en HTML:
<input name="servicios" data-validate-minselected='{"min": 1, "group": "servicios"}'>
```

### **5. ⚡ Validación Progresiva**

```javascript
// ✅ BUENA PRÁCTICA: Validación contextual
validarCamposFinancieros() {
    const capital = document.getElementById('capitalSocial').value;
    const ventas = document.getElementById('ventasAnuales').value;
    
    if (capital && ventas) {
        const capitalNum = parseFloat(capital);
        const ventasNum = parseFloat(ventas);
        
        // Lógica de negocio específica
        if (ventasNum > capitalNum * 100) {
            console.warn('Ventas muy altas comparadas con capital');
        }
    }
}
```

### **6. 📊 Retroalimentación Visual**

```javascript
// ✅ BUENA PRÁCTICA: Mostrar progreso en tiempo real
actualizarEstadoValidacion(validationResult) {
    const totalCampos = Object.keys(validationResult.fields).length;
    const camposValidos = Object.values(validationResult.fields)
        .filter(field => field.isValid).length;
    
    const porcentaje = Math.round((camposValidos / totalCampos) * 100);
    
    // Mostrar barra de progreso visual
    estadoElement.innerHTML = `
        <div style="width: ${porcentaje}%; height: 8px; background: #10b981;"></div>
        <p>${camposValidos}/${totalCampos} campos válidos</p>
    `;
}
```

## 🔧 **Cómo Reutilizar las Validaciones**

### **Paso 1: Incluir los archivos base**
```html
<script src="js/validator.js"></script>
<script src="js/form-handler.js"></script>
```

### **Paso 2: Crear validador específico**
```javascript
class MiFormularioValidator extends FormValidator {
    constructor() {
        super(); // ← Hereda todas las reglas base
        this.agregarReglasEspecificas();
    }
    
    agregarReglasEspecificas() {
        // Solo agregar lo que necesites
        this.addValidationRule('miReglaPersonalizada', (value) => {
            // Tu lógica específica
        }, 'Mensaje de error');
    }
}
```

### **Paso 3: Configurar campos de manera declarativa**
```javascript
const configuracion = {
    miCampo: {
        rules: [
            'required',        // ← Regla base
            'email',          // ← Regla base
            'miReglaPersonalizada' // ← Regla específica
        ]
    }
};
```

## 📋 **Mapeo de Atributos HTML a Validaciones**

| **Atributo HTML** | **Regla JavaScript** | **Parámetros** | **Uso** |
|------------------|---------------------|----------------|---------|
| `required` | `'required'` | - | Campo obligatorio |
| `type="email"` | `'email'` | - | Formato email |
| `type="tel"` | `'phone'` | - | Formato teléfono |
| `type="number"` | `'number'` | - | Solo números |
| `minlength="3"` | `{ name: 'minLength', params: { length: 3 } }` | `length: 3` | Longitud mínima |
| `maxlength="50"` | `{ name: 'maxLength', params: { length: 50 } }` | `length: 50` | Longitud máxima |
| `min="1000"` | `{ name: 'min', params: { value: 1000 } }` | `value: 1000` | Valor mínimo |
| `max="999999"` | `{ name: 'max', params: { value: 999999 } }` | `value: 999999` | Valor máximo |
| `pattern="regex"` | `{ name: 'pattern', params: { pattern: 'regex' } }` | `pattern: 'regex'` | Expresión regular |
| `data-validate-price` | `'price'` | personalizable | Validación monetaria |
| `data-validate-password` | `'password'` | `{ minLength: 8 }` | Contraseña segura |

## 🎨 **Patrones de Uso Común**

### **Validación de Campos Financieros**
```html
<input type="number" 
       name="precio" 
       required 
       min="0.01" 
       max="999999.99"
       step="0.01"
       data-validate-price="true">
```

### **Validación de Códigos/SKUs**
```html
<input type="text" 
       name="codigo" 
       required 
       data-validate-pattern='{"pattern": "^[A-Z]{2,3}\\d{3,7}$"}'>
```

### **Validación de Grupos de Checkboxes**
```html
<input type="checkbox" 
       name="servicios" 
       value="consultoria"
       data-validate-minselected='{"min": 1, "group": "servicios"}'>
```

### **Validación de Confirmación**
```html
<input type="password" name="password" data-validate-password="true">
<input type="password" name="confirmPassword" 
       data-validate-confirmpassword='{"matchField": "password"}'>
```

## ✅ **Ventajas de este Enfoque**

1. **🔄 Reutilización:** Las reglas base se usan en múltiples formularios
2. **📝 Mantenimiento:** Cambios centralizados afectan todos los usos
3. **🚀 Velocidad:** No reescribir validaciones comunes
4. **🎯 Consistencia:** Mismo comportamiento en toda la aplicación
5. **🔧 Extensibilidad:** Fácil agregar nuevas validaciones
6. **📱 Accesibilidad:** Retroalimentación clara para usuarios
7. **🐛 Debugging:** Errores centralizados y predecibles

## 🚀 **Próximos Pasos**

1. **Probar el formulario:** Abre `formulario-empresarial.html`
2. **Experimentar:** Modifica valores y observa validaciones
3. **Extender:** Agrega tus propias reglas de negocio
4. **Integrar:** Aplica estos patrones en tus proyectos

## 📞 **API de Extensión**

```javascript
// Obtener estado actual
const estado = appEmpresarial.obtenerEstadoValidacion();

// Validar todo el formulario
const resultado = appEmpresarial.validarFormularioCompleto();

// Obtener datos del formulario
const datos = appEmpresarial.obtenerDatosFormulario();

// Agregar validación personalizada
appEmpresarial.agregarValidacionPersonalizada('miRegla', validador, mensaje);
```

Este enfoque te permite crear formularios robustos y mantenibles reutilizando al máximo el código existente. 🎯