/**
 * 📚 GUÍA: Testing y Documentación Profesional
 * 
 * En equipos: "Si no está testado, está roto"
 */

/**
 * 1. UNIT TESTS (pruebas unitarias)
 */

// Función simple a testear
function calculateAge(birthDate) {
    if (!birthDate) {
        throw new Error('Birth date is required');
    }
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (birth > today) {
        throw new Error('Birth date cannot be in the future');
    }
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

/**
 * Tests profesionales para la función
 */
describe('calculateAge', () => {
    // Test caso feliz
    test('should calculate age correctly for past date', () => {
        const birthDate = '1990-01-01';
        const age = calculateAge(birthDate);
        
        expect(age).toBeGreaterThanOrEqual(33);
        expect(age).toBeLessThan(35); // Rango para evitar problemas con fechas
    });

    // Test casos de borde
    test('should handle birthday today', () => {
        const today = new Date();
        const birthdayToday = new Date();
        birthdayToday.setFullYear(today.getFullYear() - 25);
        
        const age = calculateAge(birthdayToday.toISOString().split('T')[0]);
        expect(age).toBe(25);
    });

    // Test errores esperados
    test('should throw error for missing birth date', () => {
        expect(() => calculateAge()).toThrow('Birth date is required');
        expect(() => calculateAge(null)).toThrow('Birth date is required');
        expect(() => calculateAge('')).toThrow('Birth date is required');
    });

    test('should throw error for future birth date', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const futureDateString = futureDate.toISOString().split('T')[0];
        
        expect(() => calculateAge(futureDateString)).toThrow('Birth date cannot be in the future');
    });

    // Test formatos diferentes
    test('should handle different date formats', () => {
        expect(() => calculateAge('1990-13-45')).toThrow(); // Fecha inválida
        expect(calculateAge('1990-12-01')).toBeGreaterThan(30);
    });
});

/**
 * 2. INTEGRATION TESTS (pruebas de integración)
 */
describe('FormValidator Integration', () => {
    let validator;
    let mockElement;

    beforeEach(() => {
        // Setup antes de cada test
        validator = new FormValidator();
        mockElement = {
            name: 'email',
            type: 'email',
            value: '',
            getAttribute: jest.fn(),
            hasAttribute: jest.fn()
        };
    });

    afterEach(() => {
        // Cleanup después de cada test
        validator = null;
        mockElement = null;
    });

    test('should validate complete form workflow', async () => {
        // Arrange: configurar datos
        const formData = {
            email: 'test@example.com',
            name: 'John Doe',
            age: 25
        };

        const rules = {
            email: { rules: ['required', 'email'] },
            name: { rules: ['required', { name: 'minLength', params: { length: 2 } }] },
            age: { rules: ['required', 'number', { name: 'min', params: { value: 18 } }] }
        };

        // Act: ejecutar validación
        validator.configureFields(rules);
        const result = validator.validateForm(formData);

        // Assert: verificar resultado
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.fields.email.isValid).toBe(true);
        expect(result.fields.name.isValid).toBe(true);
        expect(result.fields.age.isValid).toBe(true);
    });

    test('should handle validation errors correctly', () => {
        const invalidData = {
            email: 'invalid-email',
            name: 'J',
            age: 15
        };

        const rules = {
            email: { rules: ['required', 'email'] },
            name: { rules: ['required', { name: 'minLength', params: { length: 2 } }] },
            age: { rules: ['required', 'number', { name: 'min', params: { value: 18 } }] }
        };

        validator.configureFields(rules);
        const result = validator.validateForm(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.fields.email.isValid).toBe(false);
        expect(result.fields.name.isValid).toBe(false);
        expect(result.fields.age.isValid).toBe(false);
    });
});

/**
 * 3. E2E TESTS (pruebas de extremo a extremo)
 */
describe('Form Submission E2E', () => {
    test('should complete full form submission flow', async () => {
        // Simular interacciones del usuario
        const page = await browser.newPage();
        await page.goto('http://localhost:3000/formulario-empresarial.html');

        // Llenar formulario
        await page.fill('[name="razonSocial"]', 'Mi Empresa S.A.');
        await page.fill('[name="nit"]', '123456789');
        await page.fill('[name="codigoEmpresa"]', 'EMP001');
        await page.selectOption('[name="tipoEmpresa"]', 'SA');

        // Enviar formulario
        await page.click('button[type="submit"]');

        // Verificar éxito
        const successMessage = await page.waitForSelector('.success-message');
        expect(await successMessage.textContent()).toContain('Registro Empresarial Exitoso');
    });

    test('should show validation errors for invalid data', async () => {
        const page = await browser.newPage();
        await page.goto('http://localhost:3000/formulario-empresarial.html');

        // Intentar enviar formulario vacío
        await page.click('button[type="submit"]');

        // Verificar errores
        const errorMessages = await page.$$('.error-message');
        expect(errorMessages.length).toBeGreaterThan(0);
        
        const firstError = await errorMessages[0].textContent();
        expect(firstError).toContain('requerido' || 'required');
    });
});

/**
 * 4. MOCKING (simular dependencias)
 */
describe('ApiService with Mocks', () => {
    test('should handle API success', async () => {
        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true, id: '123' })
            })
        );

        const result = await ApiService.saveUser({
            email: 'test@example.com',
            name: 'Test User'
        });

        expect(fetch).toHaveBeenCalledWith('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                name: 'Test User'
            })
        });

        expect(result.success).toBe(true);
        expect(result.id).toBe('123');
    });

    test('should handle API failure with retries', async () => {
        // Mock fetch que falla 2 veces y luego funciona
        let callCount = 0;
        global.fetch = jest.fn(() => {
            callCount++;
            if (callCount <= 2) {
                return Promise.reject(new Error('Network error'));
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });
        });

        const result = await ApiService.saveUser({
            email: 'test@example.com',
            name: 'Test User'
        });

        expect(fetch).toHaveBeenCalledTimes(3); // 2 fallos + 1 éxito
        expect(result.success).toBe(true);
    });
});

/**
 * 5. PERFORMANCE TESTS (pruebas de rendimiento)
 */
describe('Performance Tests', () => {
    test('should validate large form quickly', () => {
        const validator = new FormValidator();
        const startTime = performance.now();

        // Simular formulario grande
        const largeFormData = {};
        for (let i = 0; i < 1000; i++) {
            largeFormData[`field${i}`] = `value${i}`;
        }

        // Configurar reglas
        const rules = {};
        for (let i = 0; i < 1000; i++) {
            rules[`field${i}`] = { rules: ['required'] };
        }

        validator.configureFields(rules);
        validator.validateForm(largeFormData);

        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(duration).toBeLessThan(1000); // Menos de 1 segundo
    });

    test('should handle memory efficiently', () => {
        const validator = new FormValidator();
        const initialMemory = performance.memory?.usedJSHeapSize || 0;

        // Crear y destruir muchos validadores
        for (let i = 0; i < 100; i++) {
            const tempValidator = new FormValidator();
            tempValidator.addValidationRule(`rule${i}`, () => true, 'Test');
        }

        const finalMemory = performance.memory?.usedJSHeapSize || 0;
        const memoryIncrease = finalMemory - initialMemory;

        // No debería usar más de 10MB adicionales
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
});

/**
 * 6. TEST UTILITIES (utilidades para tests)
 */
const TestUtils = {
    /**
     * Crea un mock element para testing
     */
    createMockElement(attributes = {}) {
        return {
            name: attributes.name || 'testField',
            type: attributes.type || 'text',
            value: attributes.value || '',
            getAttribute: jest.fn((attr) => attributes[attr] || null),
            hasAttribute: jest.fn((attr) => attr in attributes),
            setAttribute: jest.fn(),
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                contains: jest.fn()
            },
            parentNode: {
                insertBefore: jest.fn(),
                querySelector: jest.fn()
            }
        };
    },

    /**
     * Crea datos de formulario para testing
     */
    createFormData(overrides = {}) {
        return {
            email: 'test@example.com',
            name: 'Test User',
            age: 25,
            phone: '+1234567890',
            ...overrides
        };
    },

    /**
     * Simula eventos DOM
     */
    simulateEvent(element, eventType, eventData = {}) {
        const event = new Event(eventType, { bubbles: true });
        Object.assign(event, eventData);
        element.dispatchEvent(event);
    },

    /**
     * Espera a que una condición sea verdadera
     */
    async waitFor(condition, timeout = 5000) {
        const startTime = Date.now();
        while (!condition()) {
            if (Date.now() - startTime > timeout) {
                throw new Error('Timeout waiting for condition');
            }
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
};

/**
 * 7. DOCUMENTACIÓN CON EJEMPLOS
 */

/**
 * Calcula la edad basada en la fecha de nacimiento
 * 
 * Esta función maneja automáticamente los años bisiestos y 
 * los casos donde el cumpleaños aún no ha ocurrido en el año actual.
 * 
 * @param {string} birthDate - Fecha de nacimiento en formato YYYY-MM-DD
 * @returns {number} Edad en años completos
 * 
 * @throws {Error} Si birthDate está vacío o es null
 * @throws {Error} Si birthDate es una fecha futura
 * @throws {Error} Si birthDate no es una fecha válida
 * 
 * @example
 * // Calcular edad para alguien nacido en 1990
 * const age = calculateAge('1990-05-15');
 * console.log(age); // 33 (en 2023)
 * 
 * @example
 * // Manejar errores
 * try {
 *   const age = calculateAge('2030-01-01'); // Fecha futura
 * } catch (error) {
 *   console.error('Error:', error.message);
 * }
 * 
 * @example
 * // Uso en validación de formulario
 * const isAdult = calculateAge(userBirthDate) >= 18;
 * 
 * @since 1.0.0
 * @author Nilson
 * @see {@link validateAge} Para validación adicional de edad
 */

/**
 * 8. COVERAGE REPORTS (reportes de cobertura)
 */

// package.json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test"
  },
  "jest": {
    "collectCoverageFrom": [
      "js/**/*.js",
      "!js/**/*.test.js",
      "!js/vendor/**"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}

/**
 * 🎯 TU EJERCICIO 5: ESCRIBIR TESTS
 * 
 * Escribe tests para esta función:
 */
function validatePassword(password) {
    if (!password) return false;
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/\d/.test(password)) return false;
    if (!/[!@#$%^&*]/.test(password)) return false;
    return true;
}

/**
 * Escribe tests que cubran:
 * 1. Contraseñas válidas
 * 2. Contraseñas muy cortas
 * 3. Sin mayúsculas/minúsculas/números/símbolos
 * 4. Casos null/undefined
 * 5. Strings vacíos
 */

/**
 * 💡 PRINCIPIOS DE TESTING PROFESIONAL:
 * 
 * 1. ✅ AAA Pattern: Arrange, Act, Assert
 * 2. ✅ Test Edge Cases: Casos límite y errores
 * 3. ✅ Descriptive Names: Nombres que explican qué testean
 * 4. ✅ Independent Tests: Cada test es independiente
 * 5. ✅ Mock External Dependencies: No depender de APIs reales
 * 6. ✅ Fast Tests: Deben ejecutarse rápido
 * 7. ✅ High Coverage: Apuntar a 80%+ de cobertura
 * 8. ✅ Regression Prevention: Tests que eviten bugs futuros
 */