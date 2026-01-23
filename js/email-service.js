// EmailJS Configuration Service - VERSIÓN CORREGIDA PARA YELLOW BOX
class EmailService {
    constructor() {
        this.config = {
            USER_ID: 'yWyEO_dp5sA6hGS01',
            SERVICE_ID: 'service_7b1d0wb',
            TEMPLATE_ID: 'template_cbawhm6',
            TO_EMAIL: 'expendedorasyellowbox@gmail.com',
            CC_EMAIL: 'rickyplaymail@gmail.com'
        };
        
        console.log('📧 Inicializando EmailJS...');
        emailjs.init(this.config.USER_ID);
    }

    /**
     * Convierte nombres con guiones a guiones bajos para EmailJS
     */
    normalizeFieldName(name) {
        return name.replace(/-/g, '_');
    }

    /**
     * Procesa TODOS los datos del formulario para EmailJS
     */
    processFormData(formData) {
        const processedData = {};
        
        // 1. Recolectar todos los campos del formulario
        for (let [key, value] of formData.entries()) {
            // Normalizar nombre del campo (reemplazar - por _)
            const normalizedKey = this.normalizeFieldName(key);
            
            if (processedData[normalizedKey]) {
                // Si ya existe (como checkboxes), convertir a array
                if (!Array.isArray(processedData[normalizedKey])) {
                    processedData[normalizedKey] = [processedData[normalizedKey]];
                }
                processedData[normalizedKey].push(value);
            } else {
                processedData[normalizedKey] = value;
            }
        }
        
        // 2. Convertir arrays a strings para el template
        Object.keys(processedData).forEach(key => {
            if (Array.isArray(processedData[key])) {
                processedData[key] = processedData[key].join(', ');
            }
        });
        
        // 3. Campos obligatorios para el template
        processedData['to_email'] = this.config.TO_EMAIL;
        processedData['from_name'] = processedData.name || processedData.nombre || 'Cliente';
        processedData['from_email'] = processedData.email || 'no-email@yellowbox.cl';
        processedData['fecha_envio'] = new Date().toLocaleString('es-CL');
        processedData['timestamp'] = Date.now();
        processedData['pagina_origen'] = window.location.href;
        
        // 4. Determinar tipo de formulario
        if (processedData.asunto === 'reclamo') {
            processedData['tipo_formulario'] = '⚠️ RECLAMO';
            processedData['es_reclamo'] = 'SÍ';
            processedData['titulo_mensaje'] = `RECLAMO - ${processedData.nombre || 'Cliente'}`;
        } else if (processedData.asunto === 'sugerencia') {
            processedData['tipo_formulario'] = '💡 SUGERENCIA';
            processedData['es_reclamo'] = 'NO';
            processedData['titulo_mensaje'] = `SUGERENCIA - ${processedData.name || 'Cliente'}`;
        } else if (processedData.asunto === 'felicitacion') {
            processedData['tipo_formulario'] = '👏 FELICITACIÓN';
            processedData['es_reclamo'] = 'NO';
            processedData['titulo_mensaje'] = `FELICITACIÓN - ${processedData.name || 'Cliente'}`;
        } else {
            processedData['tipo_formulario'] = processedData.asunto?.toUpperCase() || 'CONSULTA';
            processedData['es_reclamo'] = 'NO';
            processedData['titulo_mensaje'] = `${processedData.tipo_formulario} - ${processedData.name || 'Cliente'}`;
        }
        
        // 5. Asegurarse de que todos los campos existan (evitar undefined en template)
        const camposEsperados = [
            'nombre', 'rut', 'telefono', 'medio_pago', 'tipo_billete', 'digitos_tarjeta',
            'tipo_tarjeta', 'hora_compra', 'fecha_compra', 'ciudad', 'recinto',
            'numero_maquina', 'tipo_maquina', 'snack_problema', 'cafe_problema',
            'descripcion', 'nombre_banco', 'rut_banco', 'banco', 'banco_otro',
            'numero_cuenta', 'tipo_cuenta', 'correo_devolucion'
        ];
        
        camposEsperados.forEach(campo => {
            if (!processedData[campo]) {
                processedData[campo] = '';
            }
        });
        
        // 6. DEBUG: Verificar qué datos se están enviando
        console.log('📤 Datos que se enviarán a EmailJS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        Object.keys(processedData).forEach(key => {
            if (processedData[key]) {
                console.log(`  ✓ ${key}: ${processedData[key]}`);
            }
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
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
                throw new Error('Por favor completa todos los campos requeridos');
            }
            
            // Crear FormData
            const formData = new FormData(formElement);
            
            // Verificar datos capturados
            console.log('📋 Datos capturados del formulario:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: ${value}`);
            }
            
            // Procesar datos
            const templateParams = this.processFormData(formData);
            
            console.log('🚀 Enviando a EmailJS...');
            console.log('   Service ID:', this.config.SERVICE_ID);
            console.log('   Template ID:', this.config.TEMPLATE_ID);
            console.log('   Destinatario:', this.config.TO_EMAIL);
            console.log('   Total campos:', Object.keys(templateParams).length);
            
            // Enviar email
            const response = await emailjs.send(
                this.config.SERVICE_ID,
                this.config.TEMPLATE_ID,
                templateParams
            );
            
            console.log('✅ Email enviado exitosamente!');
            console.log('   Status:', response.status);
            console.log('   Text:', response.text);
            
            return {
                success: true,
                message: 'Formulario enviado exitosamente',
                data: response
            };
            
        } catch (error) {
            console.error('❌ Error en EmailService:', error);
            
            let userMessage = 'Error al enviar el formulario';
            
            // Mensajes de error más específicos
            if (error.text) {
                console.error('Error detallado:', error.text);
                if (error.text.includes('Invalid template')) {
                    userMessage = 'Error: Template no válido. Verifica el ID del template.';
                } else if (error.text.includes('Invalid user id')) {
                    userMessage = 'Error: User ID no válido. Recarga la página.';
                } else if (error.text.includes('429')) {
                    userMessage = 'Límite de envíos alcanzado. Intenta más tarde.';
                } else if (error.text.includes('Missing')) {
                    userMessage = 'Faltan parámetros requeridos. Contacta al administrador.';
                }
            }
            
            return {
                success: false,
                message: userMessage,
                error: error
            };
        }
    }
    
    /**
     * Método estático para enviar desde cualquier lugar
     */
    static async send(formElement) {
        const service = new EmailService();
        return await service.sendForm(formElement);
    }
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.EmailService = EmailService;
    console.log('✅ EmailService cargado y disponible globalmente');
}