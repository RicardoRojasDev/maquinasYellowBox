// Control de visibilidad para la sección de reclamos y detalles de pago
(function() {
    const asuntoSelect = document.getElementById('asunto');
    const reclamoSection = document.getElementById('reclamo-section');
    const medioPagoInputs = document.getElementsByName('medio-pago');
    const billeteDetails = document.getElementById('billete-details');
    const tarjetaDetails = document.getElementById('tarjeta-details');
    const bancoSelect = document.getElementById('banco-select');
    const otroBancoContainer = document.getElementById('otro-banco-container');
    const bancoOtroInput = document.getElementById('banco-otro');

    // Si existen elementos, agregamos listener
    if (!asuntoSelect || !reclamoSection) return;

    // Manejar la visibilidad de los detalles de pago
    medioPagoInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Ocultar todos los detalles primero
            if (billeteDetails) billeteDetails.style.display = 'none';
            if (tarjetaDetails) tarjetaDetails.style.display = 'none';

            // Mostrar la sección correspondiente
            if (this.value === 'billete' && billeteDetails) {
                billeteDetails.style.display = 'block';
            } else if (this.value === 'tarjeta' && tarjetaDetails) {
                tarjetaDetails.style.display = 'block';
            }
        });
    });

    // Manejar visibilidad de la sección de reclamos
    function updateReclamoVisibility() {
        if (asuntoSelect.value === 'reclamo') {
            reclamoSection.classList.remove('d-lg-none');
            reclamoSection.classList.add('d-block');
            setTimeout(() => reclamoSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        } else {
            reclamoSection.classList.add('d-lg-none');
            reclamoSection.classList.remove('d-block');
        }
    }

    // Inicializar visibilidad
    updateReclamoVisibility();
    asuntoSelect.addEventListener('change', updateReclamoVisibility);

    // Manejar la selección de banco
    if (bancoSelect) {
        bancoSelect.addEventListener('change', function() {
            if (this.value === 'otro') {
                otroBancoContainer.style.display = 'block';
                bancoOtroInput.required = true;
            } else {
                otroBancoContainer.style.display = 'none';
                bancoOtroInput.required = false;
                bancoOtroInput.value = ''; // Limpiar el campo
            }
        });
    }
})();





// Configuración EmailJS - REEMPLAZA CON TUS DATOS
const EMAILJS_CONFIG = {
    USER_ID: 'TU_USER_ID_AQUI',          // De EmailJS
    SERVICE_ID: 'service_7b1d0wb',    // De EmailJS
    TEMPLATE_ID: 'service_7b1d0wb',  // De EmailJS
    TO_EMAIL: 'contacto@smkvending.cl'
};

// Inicializar EmailJS
(function() {
    emailjs.init(EMAILJS_CONFIG.USER_ID);
})();

// Función para enviar el formulario con EmailJS
async function sendFormWithEmailJS(formData) {
    try {
        // Convertir FormData a objeto
        const formObject = {};
        const fileInput = document.getElementById('imagen');
        
        // Procesar todos los campos del formulario
        formData.forEach((value, key) => {
            // Si es un checkbox o radio, acumular valores
            if (key.includes('problema') || key.includes('medio-pago') || 
                key.includes('tipo-') || key.includes('tipo-cuenta') || 
                key.includes('tipo-billete') || key.includes('tipo-moneda') ||
                key.includes('tipo-tarjeta')) {
                
                if (!formObject[key]) {
                    formObject[key] = [];
                }
                if (value) formObject[key].push(value);
            } else {
                formObject[key] = value;
            }
        });

        // Convertir arrays a strings para el email
        Object.keys(formObject).forEach(key => {
            if (Array.isArray(formObject[key])) {
                formObject[key] = formObject[key].join(', ');
            }
        });

        // Añadir información adicional para el email
        formObject['to_email'] = EMAILJS_CONFIG.TO_EMAIL;
        formObject['from_name'] = formObject.name || 'Usuario del formulario';
        formObject['from_email'] = formObject.email;
        formObject['fecha_envio'] = new Date().toLocaleString('es-CL');
        formObject['tipo_formulario'] = formObject.asunto || 'No especificado';
        formObject['subject'] = `Nuevo ${formObject.asunto} - ${formObject.name}`;

        // Manejar archivo adjunto (si existe)
        if (fileInput && fileInput.files[0]) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onloadend = function() {
                // EmailJS requiere archivos en base64 para el plan gratuito
                formObject['imagen_base64'] = reader.result;
                formObject['imagen_nombre'] = file.name;
                formObject['imagen_tipo'] = file.type;
                
                // Enviar email con imagen
                sendEmail(formObject);
            };
            
            reader.readAsDataURL(file);
        } else {
            // Enviar email sin imagen
            sendEmail(formObject);
        }

        return true;
    } catch (error) {
        console.error('Error procesando formulario:', error);
        throw error;
    }
}

// Función para enviar el email
async function sendEmail(data) {
    try {
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            data
        );
        
        console.log('Email enviado exitosamente:', response);
        return response;
    } catch (error) {
        console.error('Error enviando email:', error);
        throw error;
    }
}

// Exportar para usar en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sendFormWithEmailJS };
}