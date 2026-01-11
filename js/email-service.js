// EmailJS Configuration Service - ACTUALIZADO
class EmailService {
    constructor() {
        this.config = {
            USER_ID: 'yWyEO_dp5sA6hGS01',
            SERVICE_ID: 'service_7b1d0wb',
            TEMPLATE_ID: 'template_cbawhm6',
            TO_EMAIL: 'rickyplaymail@gmail.com',
            CC_EMAIL: 'expendedorasyellowbox@gmail.com'
        };
        
        // Inicializar EmailJS
        console.log('🔧 Inicializando EmailJS con Public Key:', this.config.USER_ID);
        emailjs.init(this.config.USER_ID);
        console.log('✅ EmailJS inicializado correctamente');
    }

    /**
     * Procesa los datos del formulario para EmailJS
     */
    processFormData(formData) {
        const processedData = {};
        
        // Convertir FormData a objeto
        formData.forEach((value, key) => {
            // Manejar arrays (checkboxes, radios con mismo name)
            if (processedData[key]) {
                if (!Array.isArray(processedData[key])) {
                    processedData[key] = [processedData[key]];
                }
                processedData[key].push(value);
            } else {
                processedData[key] = value;
            }
        });
        
        // Convertir arrays a strings
        Object.keys(processedData).forEach(key => {
            if (Array.isArray(processedData[key])) {
                processedData[key] = processedData[key].join(', ');
            }
        });
        
        // Agregar metadatos importantes para el template
        processedData['to_email'] = this.config.TO_EMAIL;
        processedData['from_name'] = processedData.name || processedData.nombre || 'Cliente Yellow Box';
        processedData['from_email'] = processedData.email || processedData.correo || 'no-email@yellowbox.cl';
        processedData['fecha_envio'] = new Date().toLocaleString('es-CL');
        processedData['tipo_formulario'] = processedData.asunto || 'Consulta general';
        processedData['pagina_origen'] = window.location.href;
        
        // Procesar datos específicos del reclamo
        if (processedData.asunto === 'reclamo') {
            processedData['es_reclamo'] = 'SÍ';
            processedData['titulo_mensaje'] = `RECLAMO - ${processedData.nombre || 'Cliente'}`;
        } else {
            processedData['es_reclamo'] = 'NO';
            processedData['titulo_mensaje'] = `${processedData.asunto?.toUpperCase() || 'CONSULTA'} - ${processedData.name || 'Cliente'}`;
        }
        
        return processedData;
    }
    
    /**
     * Envía el formulario usando EmailJS
     */
    async sendForm(formElement) {
        try {
            console.log('📤 Iniciando envío de formulario...');
            
            // Validar formulario
            if (!formElement.checkValidity()) {
                console.error('❌ Validación fallida');
                formElement.classList.add('was-validated');
                throw new Error('Por favor completa todos los campos requeridos correctamente');
            }
            
            // Crear FormData
            const formData = new FormData(formElement);
            
            // Verificar datos
            console.log('📋 Datos del formulario:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: ${value}`);
            }
            
            // Procesar datos
            const templateParams = this.processFormData(formData);
            
            console.log('🚀 Enviando a EmailJS...');
            console.log('   Service ID:', this.config.SERVICE_ID);
            console.log('   Template ID:', this.config.TEMPLATE_ID);
            
            // Enviar email
            const response = await emailjs.send(
                this.config.SERVICE_ID,
                this.config.TEMPLATE_ID,
                templateParams
            );
            
            console.log('✅ Email enviado exitosamente:', response);
            
            return {
                success: true,
                message: 'Formulario enviado exitosamente',
                data: response
            };
            
        } catch (error) {
            console.error('❌ Error en EmailService:', error);
            
            let userMessage = 'Error al enviar el formulario';
            
            if (error.text) {
                // Error de EmailJS
                if (error.text.includes('Invalid template')) {
                    userMessage = 'Error de configuración del template. Contacta al administrador.';
                } else if (error.text.includes('Invalid user id')) {
                    userMessage = 'Error de configuración. Recarga la página.';
                }
            } else if (error.message) {
                userMessage = error.message;
            }
            
            return {
                success: false,
                message: userMessage,
                error: error
            };
        }
    }
    
    /**
     * Método estático para fácil uso
     */
    static async send(formElement) {
        const service = new EmailService();
        return await service.sendForm(formElement);
    }
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.EmailService = EmailService;
}