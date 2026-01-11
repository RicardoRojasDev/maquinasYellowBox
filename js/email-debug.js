// Archivo adicional para debug
class EmailDebug {
    static testSend() {
        console.log('🧪 Probando EmailJS...');
        
        const testParams = {
            to_email: 'rickyplaymail@gmail.com',
            from_name: 'Test Debug',
            from_email: 'test@yellowbox.cl',
            message: 'Esta es una prueba de EmailJS',
            fecha_envio: new Date().toLocaleString('es-CL'),
            tipo_formulario: 'Prueba',
            pagina_origen: window.location.href
        };
        
        return emailjs.send(
            'service_7b1d0wb',
            'template_cbawhm6', // O tu nuevo template ID
            testParams
        );
    }
}

// Agrega esto al final del HTML
document.addEventListener('DOMContentLoaded', function() {
    // Botón de prueba
    const testBtn = document.createElement('button');
    testBtn.textContent = '🧪 Test EmailJS';
    testBtn.className = 'btn btn-secondary btn-sm position-fixed';
    testBtn.style.bottom = '60px';
    testBtn.style.right = '10px';
    testBtn.style.zIndex = '9999';
    
    testBtn.onclick = async function() {
        try {
            const result = await EmailDebug.testSend();
            alert('✅ Prueba exitosa! Revisa tu email.');
            console.log('Resultado:', result);
        } catch (error) {
            alert('❌ Error: ' + (error.text || error.message));
            console.error('Error:', error);
        }
    };
    
    document.body.appendChild(testBtn);
});