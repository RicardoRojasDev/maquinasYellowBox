// Archivo adicional para debug - VERSIÓN ACTUALIZADA
class EmailDebug {
    static testSend() {
        console.log('🧪 Probando EmailJS...');
        
        const testParams = {
            to_email: 'expendedorasyellowbox@gmail.com',
            from_name: 'Test Debug Yellow Box',
            from_email: 'test@yellowbox.cl',
            message: 'Esta es una prueba del sistema de formularios Yellow Box',
            fecha_envio: new Date().toLocaleString('es-CL'),
            tipo_formulario: 'Prueba del Sistema',
            pagina_origen: window.location.href,
            es_reclamo: 'NO',
            titulo_mensaje: 'PRUEBA - Sistema Yellow Box'
        };
        
        console.log('🔍 Enviando prueba a:', testParams.to_email);
        
        return emailjs.send(
            'service_7b1d0wb',
            'template_cbawhm6',
            testParams
        );
    }
    
    static testAllEmails() {
        console.log('🎯 Probando ambos correos...');
        
        const testEmails = [
            'expendedorasyellowbox@gmail.com',
            'rickyplaymail@gmail.com'
        ];
        
        testEmails.forEach(email => {
            const testParams = {
                to_email: email,
                from_name: 'Test Multiple',
                from_email: 'test@yellowbox.cl',
                message: `Prueba enviada a ${email}`,
                fecha_envio: new Date().toLocaleString('es-CL'),
                tipo_formulario: 'Prueba Multiple',
                pagina_origen: window.location.href
            };
            
            emailjs.send('service_7b1d0wb', 'template_cbawhm6', testParams)
                .then(() => console.log(`✅ Prueba enviada a ${email}`))
                .catch(error => console.error(`❌ Error con ${email}:`, error));
        });
    }
}

// Botones de prueba
document.addEventListener('DOMContentLoaded', function() {
    // Contenedor para botones de prueba
    const debugContainer = document.createElement('div');
    debugContainer.className = 'position-fixed';
    debugContainer.style.bottom = '10px';
    debugContainer.style.right = '10px';
    debugContainer.style.zIndex = '9999';
    debugContainer.style.display = 'flex';
    debugContainer.style.flexDirection = 'column';
    debugContainer.style.gap = '5px';
    
    // Botón de prueba principal
    const testBtn = document.createElement('button');
    testBtn.textContent = '🧪 Test EmailJS';
    testBtn.className = 'btn btn-warning btn-sm';
    testBtn.title = 'Enviar prueba a expendedorasyellowbox@gmail.com';
    
    testBtn.onclick = async function() {
        try {
            const result = await EmailDebug.testSend();
            alert(`✅ Prueba exitosa!\nEnviado a: expendedorasyellowbox@gmail.com\n\nRevisa tanto el correo principal como spam.`);
            console.log('Resultado:', result);
        } catch (error) {
            alert('❌ Error: ' + (error.text || error.message));
            console.error('Error:', error);
        }
    };
    
    // Botón de ver datos del formulario
    const dataBtn = document.createElement('button');
    dataBtn.textContent = '🔍 Ver Datos';
    dataBtn.className = 'btn btn-info btn-sm';
    
    dataBtn.onclick = function() {
        const form = document.getElementById('contactForm');
        if (form) {
            const formData = new FormData(form);
            console.log('📋 DATOS ACTUALES DEL FORMULARIO:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: ${value}`);
            }
            alert('📊 Revisa la consola (F12 → Console) para ver los datos del formulario');
        }
    };
    
    debugContainer.appendChild(testBtn);
    debugContainer.appendChild(dataBtn);
    document.body.appendChild(debugContainer);
});