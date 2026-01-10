// EmailJS Configuration Service
class EmailService {
    constructor() {
        // Configuración - REEMPLAZAR CON TUS DATOS REALES
        this.config = {
            USER_ID: 'YOUR_USER_ID',          // De EmailJS.com
            SERVICE_ID: 'YOUR_SERVICE_ID',    // De EmailJS.com
            TEMPLATE_ID: 'YOUR_TEMPLATE_ID',  // De EmailJS.com
            TO_EMAIL: 'contacto@smkvending.cl',
            CC_EMAIL: '' // Opcional
        };
        
        // Inicializar EmailJS
        this.init();
    }
    
    init() {
        emailjs.init(this.config.USER_ID);
        console.log('EmailJS inicializado');
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
        
        // Agregar metadatos
        processedData['to_email'] = this.config.TO_EMAIL;
        processedData['from_name'] = processedData.name || 'Cliente Yellow Box';
        processedData['from_email'] = processedData.email || 'no-email@yellowbox.cl';
        processedData['fecha_envio'] = new Date().toLocaleString('es-CL');
        processedData['tipo_formulario'] = processedData.asunto || 'Consulta general';
        
        return processedData;
    }
    
    /**
     * Envía el formulario usando EmailJS
     */
    async sendForm(formElement) {
        try {
            // Validar formulario
            if (!formElement.checkValidity()) {
                throw new Error('Por favor completa todos los campos requeridos');
            }
            
            // Crear FormData
            const formData = new FormData(formElement);
            
            // Procesar datos
            const templateParams = this.processFormData(formData);
            
            // Enviar email
            const response = await emailjs.send(
                this.config.SERVICE_ID,
                this.config.TEMPLATE_ID,
                templateParams
            );
            
            return {
                success: true,
                message: 'Formulario enviado exitosamente',
                data: response
            };
            
        } catch (error) {
            console.error('Error en EmailService:', error);
            return {
                success: false,
                message: error.message || 'Error al enviar el formulario',
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