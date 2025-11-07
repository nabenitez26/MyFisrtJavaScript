/**
 * 📚 GUÍA: Comentarios Profesionales
 * 
 * ❌ MALO: Comentarios obvios
 * ✅ BUENO: Comentarios que explican "POR QUÉ"
 */

// ❌ MAL EJEMPLO
function validarEmail(email) {
    // Verifica si el email es válido
    if (email.includes('@')) {
        return true; // Retorna true
    }
    return false; // Retorna false
}

// ✅ BUEN EJEMPLO
/**
 * Valida formato de email según RFC 5322 básico
 * 
 * @param {string} email - Dirección de email a validar
 * @returns {boolean} true si el formato es válido, false en caso contrario
 * 
 * @example
 * validateEmail('user@domain.com') // true
 * validateEmail('invalid-email')   // false
 * 
 * @since v1.0.0
 * @author Nilson - 2025-11-07
 */
function validateEmail(email) {
    // Usamos regex simplificada para compatibilidad con formularios web
    // No implementamos RFC completa por rendimiento
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * ✅ PLANTILLA PARA TUS FUNCIONES
 */
/**
 * [Descripción breve de qué hace]
 * 
 * [Descripción más detallada si es necesario]
 * 
 * @param {tipo} nombreParametro - Descripción del parámetro
 * @returns {tipo} Descripción de lo que retorna
 * 
 * @example
 * // Ejemplo de uso
 * 
 * @throws {Error} Cuándo puede fallar
 * @since Versión en que se agregó
 * @author Tu nombre - Fecha
 */

/**
 * 🎯 TU EJERCICIO 1:
 * Toma una función del código actual y documéntala profesionalmente
 */

// Ejemplo para practicar - documenta esta función:
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const diaActual = hoy.getDate();
    
    if (mesActual < nacimiento.getMonth() || 
        (mesActual === nacimiento.getMonth() && diaActual < nacimiento.getDate())) {
        edad--;
    }
    
    return edad;
}