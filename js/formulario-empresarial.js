/**
 * Formulario Empresarial - Aplicación de Mejores Prácticas
 * Demuestra el uso avanzado del sistema de validación con reglas reutilizables
 */

class FormularioEmpresarial {
    constructor() {
        this.validator = new FormValidator();
        this.formHandler = null;
        this.validationStatus = {};
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.agregarReglasPersonalizadas();
        this.configurarFormHandler();
        this.configurarEventosAdicionales();
        this.configurarValidacionEnTiempoReal();
        this.configurarModoOscuro();
        
        console.log('📋 Formulario Empresarial inicializado');
        console.log('🔧 Reglas disponibles:', this.validator.getAvailableRules());
    }

    /**
     * 🎯 MEJOR PRÁCTICA 1: Extender reglas existentes con validaciones específicas del dominio
     */
    agregarReglasPersonalizadas() {
        // Validación de precios/moneda
        this.validator.addValidationRule('price', (value, params) => {
            if (!value) return true;
            const price = parseFloat(value);
            return price > 0 && price <= 999999999.99 && /^\d+(\.\d{1,2})?$/.test(value);
        }, 'Ingrese un precio válido (máximo 2 decimales)');

        // Validación de inventario/empleados
        this.validator.addValidationRule('inventory', (value, params) => {
            if (!value) return true;
            const qty = parseInt(value);
            return Number.isInteger(qty) && qty >= 0 && qty <= 999999;
        }, 'Ingrese una cantidad válida (número entero positivo)');

        // Validación de rango de fechas
        this.validator.addValidationRule('dateRange', (value, params) => {
            if (!value) return true;
            
            const date = new Date(value);
            const after = params.after ? new Date(params.after) : null;
            const before = params.before ? new Date(params.before) : null;
            
            if (after && date < after) return false;
            if (before && date > before) return false;
            
            return true;
        }, 'La fecha debe estar dentro del rango permitido');

        // Validación de selección mínima en checkboxes
        this.validator.addValidationRule('minSelected', (value, params, formData) => {
            if (!params.group) return true;
            
            // Contar checkboxes seleccionados en el grupo
            const form = document.getElementById('empresarialForm');
            const checkboxes = form.querySelectorAll(`[name="${params.group}"]:checked`);
            
            return checkboxes.length >= (params.min || 1);
        }, 'Debe seleccionar al menos {min} opción(es)');

        // Validación de NIT/RUC con algoritmo específico
        this.validator.addValidationRule('nitValido', (value, params) => {
            if (!value) return true;
            
            // Remover caracteres no numéricos
            const nit = value.replace(/\D/g, '');
            
            // Verificar longitud mínima
            if (nit.length < 8) return false;
            
            // Aquí puedes implementar el algoritmo específico de tu país
            // Por ahora, validación básica
            return /^\d{8,15}$/.test(nit);
        }, 'Ingrese un NIT/RUC válido');

        // Validación de código de empresa con formato específico
        this.validator.addValidationRule('codigoEmpresa', (value, params) => {
            if (!value) return true;
            
            // Formato: 2-3 letras seguidas de 3-7 números
            return /^[A-Z]{2,3}\d{3,7}$/.test(value.toUpperCase());
        }, 'Formato: 2-3 letras mayúsculas seguidas de 3-7 números (ej: EMP001)');

        // Validación de año en rango razonable
        this.validator.addValidationRule('anoValido', (value, params) => {
            if (!value) return true;
            
            const year = parseInt(value);
            const currentYear = new Date().getFullYear();
            const minYear = params.min || 1800;
            const maxYear = params.max || currentYear;
            
            return year >= minYear && year <= maxYear;
        }, 'Ingrese un año válido entre {min} y {max}');

        console.log('✅ Reglas personalizadas agregadas');
    }

    /**
     * 🎯 MEJOR PRÁCTICA 2: Configuración declarativa y reutilizable
     */
    configurarFormHandler() {
        class FormHandlerEmpresarial extends FormHandler {
            constructor(selector, validator) {
                super(selector, validator);
                this.configurarValidacionesEspecificas();
            }

            configurarValidacionesEspecificas() {
                // Configurar validaciones adicionales no declaradas en HTML
                const configuraciones = {
                    // Capital social con validación de precio
                    capitalSocial: {
                        rules: [
                            'required',
                            'number',
                            { name: 'min', params: { value: 1000 } },
                            'price'
                        ]
                    },
                    
                    // Ventas anuales (opcional pero si se llena, debe ser válida)
                    ventasAnuales: {
                        rules: [
                            'number',
                            { name: 'min', params: { value: 0 } },
                            'price'
                        ]
                    },
                    
                    // Número de empleados
                    numeroEmpleados: {
                        rules: [
                            'required',
                            'inventory',
                            { name: 'min', params: { value: 1 } }
                        ]
                    },
                    
                    // Año de fundación
                    anoFundacion: {
                        rules: [
                            'required',
                            'number',
                            { name: 'anoValido', params: { min: 1800, max: 2025 } }
                        ]
                    },
                    
                    // NIT con validación específica
                    nit: {
                        rules: [
                            'required',
                            'nitValido'
                        ]
                    },
                    
                    // Código de empresa
                    codigoEmpresa: {
                        rules: [
                            'required',
                            'codigoEmpresa'
                        ]
                    },
                    
                    // Servicios (validación de grupo)
                    servicios: {
                        rules: [
                            { name: 'minSelected', params: { min: 1, group: 'servicios' } }
                        ]
                    }
                };

                // Aplicar configuraciones
                Object.entries(configuraciones).forEach(([campo, config]) => {
                    const campoExistente = this.validator.fieldConfigs.get(campo);
                    if (campoExistente) {
                        // Combinar reglas existentes con nuevas
                        campoExistente.rules = [...campoExistente.rules, ...config.rules];
                        this.validator.configureField(campo, campoExistente);
                    } else {
                        this.validator.configureField(campo, config);
                    }
                });
            }

            onFormValid(formData) {
                console.log('✅ Formulario empresarial válido!', formData);
                this.mostrarResumenEmpresa(formData);
                this.mostrarMensajeExito();
                this.simularEnvioServidor(formData);
            }

            onFormInvalid(validationResult) {
                console.log('❌ Formulario con errores:', validationResult);
                this.actualizarEstadoValidacion(validationResult);
                this.enfocarPrimerError(validationResult);
            }

            mostrarResumenEmpresa(formData) {
                const resumen = document.getElementById('empresarialSummary');
                const contenido = document.getElementById('empresarialSummaryContent');
                
                const datosImportantes = {
                    'Razón Social': formData.razonSocial,
                    'NIT/RUC': formData.nit,
                    'Código Empresa': formData.codigoEmpresa,
                    'Tipo': formData.tipoEmpresa,
                    'Sector': formData.sector,
                    'Capital Social': formData.capitalSocial ? `$${formData.capitalSocial}` : 'No especificado',
                    'Empleados': formData.numeroEmpleados,
                    'Representante': formData.nombreRepresentante,
                    'Email': formData.emailRepresentante,
                    'Ciudad': formData.ciudadEmpresa
                };

                let html = '';
                Object.entries(datosImportantes).forEach(([label, value]) => {
                    if (value && value !== '') {
                        html += `
                            <div class="summary-field">
                                <span class="summary-label">${label}:</span>
                                <span class="summary-value">${value}</span>
                            </div>
                        `;
                    }
                });

                contenido.innerHTML = html;
                resumen.style.display = 'block';
                resumen.scrollIntoView({ behavior: 'smooth' });
            }

            mostrarMensajeExito() {
                const mensajeExistente = document.querySelector('.success-message');
                if (mensajeExistente) mensajeExistente.remove();

                const mensaje = document.createElement('div');
                mensaje.className = 'success-message';
                mensaje.innerHTML = `
                    <strong>🎉 ¡Registro Empresarial Exitoso!</strong>
                    <br>La empresa ha sido registrada correctamente en el sistema.
                    <br>Recibirá un email de confirmación en las próximas horas.
                `;

                const form = document.getElementById('empresarialForm');
                form.insertBefore(mensaje, form.firstChild);
            }

            async simularEnvioServidor(formData) {
                console.log('📡 Simulando envío al servidor...');
                
                // Simular delay de red
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Aquí harías la llamada real al servidor
                console.log('✅ Datos enviados al servidor:', {
                    empresa: {
                        razonSocial: formData.razonSocial,
                        nit: formData.nit,
                        codigo: formData.codigoEmpresa
                    },
                    representante: {
                        nombre: formData.nombreRepresentante,
                        email: formData.emailRepresentante
                    },
                    timestamp: new Date().toISOString()
                });
            }

            actualizarEstadoValidacion(validationResult) {
                const estadoElement = document.getElementById('validationStatus');
                const totalCampos = Object.keys(validationResult.fields).length;
                const camposValidos = Object.values(validationResult.fields)
                    .filter(field => field.isValid).length;
                
                const porcentaje = Math.round((camposValidos / totalCampos) * 100);
                
                estadoElement.innerHTML = `
                    <div class="validation-progress">
                        <p><strong>Progreso de Validación:</strong></p>
                        <div style="background: #e5e7eb; border-radius: 8px; overflow: hidden; margin: 8px 0;">
                            <div style="width: ${porcentaje}%; height: 8px; background: ${porcentaje === 100 ? '#10b981' : '#3b82f6'}; transition: width 0.3s;"></div>
                        </div>
                        <p style="font-size: 0.9em; color: #6b7280;">
                            ${camposValidos}/${totalCampos} campos válidos (${porcentaje}%)
                        </p>
                        ${validationResult.errors.length > 0 ? `
                            <p style="color: #ef4444; font-size: 0.85em; margin-top: 8px;">
                                ${validationResult.errors.length} error(es) por corregir
                            </p>
                        ` : ''}
                    </div>
                `;
            }

            enfocarPrimerError(validationResult) {
                if (validationResult.errors.length > 0) {
                    const primerError = validationResult.errors[0];
                    const campo = document.querySelector(`[name="${primerError.field}"]`);
                    if (campo) {
                        campo.focus();
                        campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        }

        this.formHandler = new FormHandlerEmpresarial('#empresarialForm', this.validator);
        console.log('✅ FormHandler configurado');
    }

    /**
     * 🎯 MEJOR PRÁCTICA 3: Eventos y retroalimentación en tiempo real
     */
    configurarEventosAdicionales() {
        // Botón para limpiar formulario
        const resetBtn = document.getElementById('resetEmpresarialBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.formHandler.reset();
                this.limpiarEstado();
            });
        }

        // Botón para validar todo
        const validateBtn = document.getElementById('validateAllBtn');
        if (validateBtn) {
            validateBtn.addEventListener('click', () => {
                const resultado = this.formHandler.validateAll();
                this.mostrarResultadoValidacion(resultado);
            });
        }

        // Validación automática de código de empresa
        const codigoInput = document.getElementById('codigoEmpresa');
        if (codigoInput) {
            codigoInput.addEventListener('input', (e) => {
                // Convertir a mayúsculas automáticamente
                e.target.value = e.target.value.toUpperCase();
            });
        }

        // Formateo automático de NIT
        const nitInput = document.getElementById('nit');
        if (nitInput) {
            nitInput.addEventListener('input', (e) => {
                // Permitir solo números y guiones
                e.target.value = e.target.value.replace(/[^\d\-]/g, '');
            });
        }

        // Validación condicional de servicios
        const serviciosCheckboxes = document.querySelectorAll('[name="servicios"]');
        serviciosCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.validarGrupoServicios();
            });
        });

        console.log('✅ Eventos adicionales configurados');
    }

    /**
     * 🎯 MEJOR PRÁCTICA 4: Validación contextual y progresiva
     */
    configurarValidacionEnTiempoReal() {
        const form = document.getElementById('empresarialForm');
        
        // Validación progresiva: validar campos relacionados
        form.addEventListener('input', (e) => {
            const campo = e.target;
            
            // Validaciones específicas por campo
            switch (campo.name) {
                case 'capitalSocial':
                case 'ventasAnuales':
                    this.validarCamposFinancieros();
                    break;
                    
                case 'anoFundacion':
                    this.validarConsistenciaFechas();
                    break;
                    
                case 'passwordEmpresa':
                    this.validarConsistenciaPassword();
                    break;
            }
            
            this.actualizarProgreso();
        });

        console.log('✅ Validación en tiempo real configurada');
    }

    /**
     * 🎯 MEJOR PRÁCTICA 5: Validaciones contextuales específicas
     */
    validarCamposFinancieros() {
        const capital = document.getElementById('capitalSocial').value;
        const ventas = document.getElementById('ventasAnuales').value;
        
        if (capital && ventas) {
            const capitalNum = parseFloat(capital);
            const ventasNum = parseFloat(ventas);
            
            // Lógica de negocio: las ventas no deberían ser 100 veces mayor al capital
            if (ventasNum > capitalNum * 100) {
                console.log('⚠️ Advertencia: Ventas muy altas comparadas con capital');
            }
        }
    }

    validarConsistenciaFechas() {
        const anoFundacion = document.getElementById('anoFundacion').value;
        const fechaOperaciones = document.getElementById('fechaInicioOperaciones').value;
        
        if (anoFundacion && fechaOperaciones) {
            const anoOperaciones = new Date(fechaOperaciones).getFullYear();
            
            if (parseInt(anoFundacion) > anoOperaciones) {
                console.log('⚠️ Inconsistencia: Año de fundación posterior a inicio de operaciones');
            }
        }
    }

    validarConsistenciaPassword() {
        const confirmField = document.getElementById('confirmarPassword');
        if (confirmField.value) {
            // Re-validar confirmación de password
            this.formHandler.validateFieldRealtime(confirmField);
        }
    }

    validarGrupoServicios() {
        // Obtener el primer checkbox del grupo para validar
        const primerCheckbox = document.querySelector('[name="servicios"]');
        if (primerCheckbox) {
            const formData = this.formHandler.getFormData();
            const resultado = this.validator.validateField('servicios', null, formData);
            
            // Mostrar/ocultar mensaje de error para el grupo
            this.mostrarErrorGrupo('servicios', resultado);
        }
    }

    mostrarErrorGrupo(nombreGrupo, resultado) {
        const fieldset = document.querySelector(`[name="${nombreGrupo}"]`).closest('fieldset');
        const errorExistente = fieldset.querySelector('.error-message');
        
        if (errorExistente) {
            errorExistente.remove();
        }
        
        if (!resultado.isValid) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                <div class="error-item">${resultado.errors[0].message}</div>
            `;
            fieldset.appendChild(errorDiv);
        }
    }

    /**
     * 🎯 MEJOR PRÁCTICA 6: Retroalimentación visual y progreso
     */
    actualizarProgreso() {
        const formData = this.formHandler.getFormData();
        const resultado = this.validator.validateForm(formData);
        
        if (resultado.fields && Object.keys(resultado.fields).length > 0) {
            this.formHandler.actualizarEstadoValidacion(resultado);
        }
    }

    mostrarResultadoValidacion(resultado) {
        const alertaExistente = document.querySelector('.validation-alert');
        if (alertaExistente) alertaExistente.remove();

        const alerta = document.createElement('div');
        alerta.className = `validation-alert ${resultado.isValid ? 'success-message' : 'error-message'}`;
        
        if (resultado.isValid) {
            alerta.innerHTML = `
                <strong>✅ Validación Exitosa</strong>
                <br>Todos los campos del formulario son válidos.
            `;
        } else {
            alerta.innerHTML = `
                <strong>❌ Errores de Validación</strong>
                <br>Se encontraron ${resultado.errors.length} error(es):
                <ul style="margin: 8px 0 0 20px;">
                    ${resultado.errors.slice(0, 5).map(error => 
                        `<li style="margin: 4px 0;">${error.field}: ${error.message}</li>`
                    ).join('')}
                    ${resultado.errors.length > 5 ? `<li>... y ${resultado.errors.length - 5} más</li>` : ''}
                </ul>
            `;
        }

        const form = document.getElementById('empresarialForm');
        form.insertBefore(alerta, form.firstChild);
        
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.remove();
            }
        }, 8000);
    }

    limpiarEstado() {
        const estadoElement = document.getElementById('validationStatus');
        estadoElement.innerHTML = '<p>Formulario limpiado. Complete los campos para ver el progreso.</p>';
        
        const resumen = document.getElementById('empresarialSummary');
        resumen.style.display = 'none';
        
        const mensajes = document.querySelectorAll('.success-message, .validation-alert');
        mensajes.forEach(msg => msg.remove());
    }

    /**
     * � NUEVA FUNCIONALIDAD: Configurar modo día/noche
     */
    configurarModoOscuro() {
        // Obtener referencias a los elementos
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        const themeText = themeToggle.querySelector('.theme-text');
        
        // Verificar si hay una preferencia guardada
        const temaGuardado = localStorage.getItem('tema') || 'light';
        this.aplicarTema(temaGuardado);
        
        // Configurar el botón según el tema actual
        this.actualizarBotonTema(temaGuardado, themeIcon, themeText);
        
        // Evento para cambiar el tema
        themeToggle.addEventListener('click', () => {
            const temaActual = document.documentElement.getAttribute('data-theme') || 'light';
            const nuevoTema = temaActual === 'light' ? 'dark' : 'light';
            
            // Aplicar el nuevo tema
            this.aplicarTema(nuevoTema);
            
            // Actualizar el botón
            this.actualizarBotonTema(nuevoTema, themeIcon, themeText);
            
            // Guardar preferencia
            localStorage.setItem('tema', nuevoTema);
            
            console.log(`🌓 Tema cambiado a: ${nuevoTema}`);
        });
        
        console.log('✅ Modo día/noche configurado');
    }
    
    /**
     * Aplicar tema al documento
     */
    aplicarTema(tema) {
        document.documentElement.setAttribute('data-theme', tema);
        
        // También agregar clase al body para compatibilidad
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${tema}`);
    }
    
    /**
     * Actualizar el aspecto del botón de tema
     */
    actualizarBotonTema(tema, themeIcon, themeText) {
        if (tema === 'dark') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Modo Claro';
            themeIcon.title = 'Cambiar a modo claro';
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Modo Oscuro';
            themeIcon.title = 'Cambiar a modo oscuro';
        }
    }

    /**
     * �🎯 MEJOR PRÁCTICA 7: API pública para extensión
     */
    agregarValidacionPersonalizada(nombre, validador, mensaje) {
        return this.validator.addValidationRule(nombre, validador, mensaje);
    }

    obtenerEstadoValidacion() {
        return this.formHandler.getValidationState();
    }

    obtenerDatosFormulario() {
        return this.formHandler.getFormData();
    }

    validarFormularioCompleto() {
        return this.formHandler.validateAll();
    }
    
    /**
     * Cambiar tema programáticamente
     * @param {string} tema - 'light' o 'dark'
     */
    cambiarTema(tema) {
        if (tema !== 'light' && tema !== 'dark') {
            console.warn('Tema inválido. Use "light" o "dark"');
            return;
        }
        
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        const themeText = themeToggle.querySelector('.theme-text');
        
        this.aplicarTema(tema);
        this.actualizarBotonTema(tema, themeIcon, themeText);
        localStorage.setItem('tema', tema);
        
        console.log(`🌓 Tema cambiado programáticamente a: ${tema}`);
    }
    
    /**
     * Obtener tema actual
     */
    obtenerTemaActual() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
}

// Inicializar aplicación
const appEmpresarial = new FormularioEmpresarial();

// Exponer para debugging y extensión
window.appEmpresarial = appEmpresarial;

// Ejemplos de extensión en runtime
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Formulario Empresarial Listo!');
    console.log('');
    console.log('📚 MEJORES PRÁCTICAS IMPLEMENTADAS:');
    console.log('1. ✅ Reutilización de reglas base');
    console.log('2. ✅ Validaciones específicas del dominio');
    console.log('3. ✅ Configuración declarativa');
    console.log('4. ✅ Validación en tiempo real');
    console.log('5. ✅ Validaciones cruzadas');
    console.log('6. ✅ Retroalimentación visual');
    console.log('7. ✅ API extensible');
    console.log('');
    console.log('🔧 Comandos disponibles:');
    console.log('- appEmpresarial.obtenerEstadoValidacion()');
    console.log('- appEmpresarial.validarFormularioCompleto()');
    console.log('- appEmpresarial.obtenerDatosFormulario()');
    console.log('- appEmpresarial.cambiarTema("dark" | "light")');
    console.log('- appEmpresarial.obtenerTemaActual()');
});