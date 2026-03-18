/**
 * ============================================
 * FORM HANDLERS - Yellow Box
 * Refactorizado para múltiples formularios con EmailJS
 * ============================================
 */

/**
 * CONFIGURACIÓN DE FORMULARIOS
 * Define los templates de EmailJS y validaciones para cada formulario
 */
const FormConfig = {
    'form-reclamo': {
        templateId: 'template_cbawhm6',
        name: 'Reclamo',
        fields: ['nombre', 'email', 'telefono', 'asunto', 'descripcion'],
        requiredFields: ['nombre', 'email', 'descripcion'],
        getData: getDatosReclamo,
        successMessage: 'Tu reclamo ha sido enviado. Te contactaremos pronto.',
        redirectUrl: '../gracias-compra.html'
    },
    'form-contratacion': {
        templateId: 'template_k5wu6tu',
        name: 'Contratación/Ventas',
        fields: ['nombre_empresa', 'email', 'telefono', 'mensaje'],
        requiredFields: ['nombre_empresa', 'email', 'mensaje'],
        getData: getDatosContratacion,
        successMessage: 'Tu solicitud ha sido recibida. Nos contactaremos pronto.',
        redirectUrl: '../gracias-compra.html'
    }
};

/**
 * ============================================
 * FUNCIONES DE OBTENCIÓN DE DATOS
 * ============================================
 */

/**
 * Obtiene y estructura los datos del formulario de reclamo
 */
function getDatosReclamo(form) {
    const formData = new FormData(form);
    
    return {
        from_name: formData.get('nombre') || 'Cliente',
        from_email: formData.get('email') || '',
        asunto: formData.get('asunto') || '',
        descripcion: formData.get('descripcion') || '',
        telefono: formData.get('telefono') || '',
        tipo_maquina: formData.get('tipo-maquina') || '',
        problema: formData.get('snack-problema') || formData.get('cafe-problema') || '',
        fecha_envio: new Date().toLocaleString('es-CL'),
        pagina_origen: window.location.href,
        timestamp: Date.now()
    };
}

/**
 * Obtiene y estructura los datos del formulario de contratación
 */
function getDatosContratacion(form) {
    const formData = new FormData(form);
    
    return {
        from_name: formData.get('nombre_empresa') || 'Empresa',
        from_email: formData.get('email') || '',
        nombre_contacto: formData.get('nombre_contacto') || '',
        telefono: formData.get('telefono') || '',
        rut_empresa: formData.get('rut_empresa') || '',
        mensaje: formData.get('mensaje') || '',
        fecha_envio: new Date().toLocaleString('es-CL'),
        pagina_origen: window.location.href,
        timestamp: Date.now()
    };
}

/**
 * ============================================
 * FUNCIONES DE VALIDACIÓN
 * ============================================
 */

/**
 * Valida campos obligatorios del formulario
 */
function validateRequiredFields(form, config) {
    const requiredFields = config.requiredFields || [];
    const missingFields = [];
    
    requiredFields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!field || !field.value.trim()) {
            missingFields.push(fieldName);
        }
    });
    
    return {
        isValid: missingFields.length === 0,
        missingFields: missingFields
    };
}

/**
 * Valida formato de email
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida longitud mínima de mensaje/descripción
 */
function validateMessageLength(message, minLength = 10) {
    return message.trim().length >= minLength;
}

/**
 * ============================================
 * FUNCIONES DE MANEJO DE ENVÍO
 * ============================================
 */

/**
 * Detecta automáticamente qué formulario se está enviando
 */
function detectFormType(form) {
    const formId = form.id;
    
    // Buscar en la configuración por ID
    if (FormConfig[formId]) {
        return formId;
    }
    
    // Fallback: detectar por página
    if (window.location.pathname.includes('formReclamos') || window.location.pathname.includes('reclamos')) {
        return 'form-reclamo';
    }
    
    if (window.location.pathname.includes('formVentas') || window.location.pathname.includes('contratacion')) {
        return 'form-contratacion';
    }
    
    // Default al primer formulario disponible
    return Object.keys(FormConfig)[0] || null;
}

/**
 * Maneja el envío de cualquier formulario
 */
async function handleFormSubmit(event) {
    const form = event.target;
    event.preventDefault();
    event.stopPropagation();
    
    const formType = detectFormType(form);
    const config = FormConfig[formType];
    
    if (!config) {
        showError('Tipo de formulario no reconocido');
        return;
    }
    
    // Validar campos requeridos
    const validation = validateRequiredFields(form, config);
    if (!validation.isValid) {
        showError(`Por favor completa los campos requeridos: ${validation.missingFields.join(', ')}`);
        form.classList.add('was-validated');
        return;
    }
    
    // Validar email
    const email = form.querySelector('[name="email"]')?.value;
    if (email && !validateEmail(email)) {
        showError('Por favor ingresa un email válido');
        return;
    }
    
    // Validar longitud de mensaje
    const messageField = form.querySelector('[name="descripcion"], [name="mensaje"]');
    if (messageField && !validateMessageLength(messageField.value)) {
        showError('El mensaje debe tener al menos 10 caracteres');
        return;
    }
    
    // Proceder con el envío
    await submitForm(form, formType, config);
}

/**
 * Envía el formulario a través de EmailJS
 */
async function submitForm(form, formType, config) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // UI: Mostrar estado de carga
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
    submitBtn.disabled = true;
    
    try {
        // Verificar EmailService
        if (typeof EmailService === 'undefined') {
            throw new Error('Servicio de email no disponible. Por favor recarga la página.');
        }
        
        // Obtener datos estructurados
        const templateParams = config.getData(form);
        
        // Agregar email de destino
        templateParams.to_email = 'expendedorasyellowbox@gmail.com';
        
        console.log(`📤 Enviando ${config.name}...`, templateParams);
        
        // Enviar email
        const response = await emailjs.send(
            'service_7b1d0wb', // SERVICE_ID
            config.templateId,
            templateParams
        );
        
        console.log('✅ Enviado exitosamente:', response);
        
        // Mostrar éxito
        showSuccess(form, config);
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
            window.location.href = config.redirectUrl || '../gracias-compra.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error al enviar:', error);
        showError(error.message || `Error al enviar ${config.name}`);
        
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * ============================================
 * FUNCIONES DE UI
 * ============================================
 */

/**
 * Muestra mensaje de éxito
 */
function showSuccess(form, config) {
    // Ocultar formulario
    form.style.display = 'none';
    
    // Crear o mostrar mensaje de éxito
    let successMessage = document.getElementById('success-message');
    
    if (!successMessage) {
        successMessage = document.createElement('div');
        successMessage.id = 'success-message';
        successMessage.className = 'alert alert-success';
        form.parentNode.insertBefore(successMessage, form);
    }
    
    successMessage.innerHTML = `
        <h4 class="alert-heading">✅ ¡Éxito!</h4>
        <p>${config.successMessage}</p>
    `;
    successMessage.style.display = 'block';
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Limpiar formulario
    form.reset();
    form.classList.remove('was-validated');
}

/**
 * Muestra mensaje de error
 */
function showError(message) {
    let errorContainer = document.getElementById('form-error-message');
    
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'form-error-message';
        errorContainer.className = 'alert alert-danger mt-3';
        
        const form = document.querySelector('form');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(errorContainer, form.nextSibling);
        }
    }
    
    errorContainer.innerHTML = `
        <h4 class="alert-heading">⚠️ Error</h4>
        <p>${message}</p>
        <hr>
        <p class="mb-0 small">Si el problema persiste, contacta a <a href="mailto:contacto@smkvending.cl" class="alert-link">contacto@smkvending.cl</a></p>
    `;
    errorContainer.style.display = 'block';
    
    // Auto-ocultar después de 15 segundos
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 15000);
    
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * ============================================
 * INICIALIZACIÓN
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. Configurar visibilidad de elementos dinámicos
    setupDynamicVisibility();
    
    // 2. Configurar todos los formularios
    setupAllForms();
    
    // 3. Inicializar modales
    initializeModals();
    
    console.log('✅ Form Handlers inicializados');
});

/**
 * Configura la visibilidad dinámica de elementos
 */
function setupDynamicVisibility() {
    // Manejar sección de reclamos si existe
    const asuntoSelect = document.getElementById('asunto');
    const reclamoSection = document.getElementById('reclamo-section');
    
    if (asuntoSelect && reclamoSection) {
        const updateReclamoVisibility = () => {
            if (asuntoSelect.value === 'reclamo') {
                reclamoSection.style.display = 'block';
                setTimeout(() => reclamoSection.scrollIntoView({ behavior: 'smooth' }), 100);
            } else {
                reclamoSection.style.display = 'none';
            }
        };
        
        updateReclamoVisibility();
        asuntoSelect.addEventListener('change', updateReclamoVisibility);
    }
    
    // Manejar medio de pago
    const medioPagoInputs = document.querySelectorAll('[name="medio-pago"]');
    const billeteDetails = document.getElementById('billete-denominacion-extra');
    const tarjetaDetails = document.getElementById('tarjeta-details');
    
    medioPagoInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (billeteDetails) billeteDetails.style.display = this.value === 'billete' ? 'block' : 'none';
            if (tarjetaDetails) tarjetaDetails.style.display = this.value === 'tarjeta' ? 'block' : 'none';
        });
    });
    
    // Manejar tipo de máquina (snack/cafe)
    const tipoMaquinaInputs = document.querySelectorAll('[name="tipo-maquina"]');
    const snackProblems = document.getElementById('snack-problems');
    const cafeProblems = document.getElementById('cafe-problems');
    
    tipoMaquinaInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (snackProblems) snackProblems.style.display = this.value === 'snack' ? 'block' : 'none';
            if (cafeProblems) cafeProblems.style.display = this.value === 'cafe' ? 'block' : 'none';
        });
    });
    
    // Manejar selección de banco
    const bancoSelect = document.getElementById('banco-select');
    const otroBancoContainer = document.getElementById('otro-banco-container');
    const bancoOtroInput = document.getElementById('banco-otro');
    
    if (bancoSelect) {
        bancoSelect.addEventListener('change', function() {
            const showOtro = this.value === 'otro';
            if (otroBancoContainer) otroBancoContainer.style.display = showOtro ? 'block' : 'none';
            if (bancoOtroInput) {
                bancoOtroInput.required = showOtro;
                if (!showOtro) bancoOtroInput.value = '';
            }
        });
    }
}

/**
 * Configura todos los formularios para envío
 */
function setupAllForms() {
    // Buscar todos los formularios en la página
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const formType = detectFormType(form);
        
        // Solo configurar si el tipo de formulario está definido
        if (FormConfig[formType]) {
            form.addEventListener('submit', handleFormSubmit);
            console.log(`✅ Formulario "${formType}" configurado`);
        }
    });
}

/**
 * Inicializa modales si existen
 */
function initializeModals() {
    const modalId = 'modalReclamos3D';
    const modalElement = document.getElementById(modalId);
    
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: true,
            keyboard: true
        });
        
        setTimeout(() => {
            modal.show();
            console.log('[YellowBox] Modal mostrado');
        }, 400);
        
        sessionStorage.removeItem('yellowbox_modal_reclamos');
    }
}

// Exponer al global scope si es necesario
window.FormHandlers = {
    detectFormType,
    submitForm,
    showError,
    showSuccess
};