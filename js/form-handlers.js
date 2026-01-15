// Control de visibilidad para la sección de reclamos y detalles de pago
document.addEventListener('DOMContentLoaded', function() {
    const asuntoSelect = document.getElementById('asunto');
    const reclamoSection = document.getElementById('reclamo-section');
    const medioPagoInputs = document.getElementsByName('medio-pago');
    const billeteDetailsExtra = document.getElementById('billete-denominacion-extra');
    const tarjetaDetails = document.getElementById('tarjeta-details');
    const bancoSelect = document.getElementById('banco-select');
    const otroBancoContainer = document.getElementById('otro-banco-container');
    const bancoOtroInput = document.getElementById('banco-otro');
    const tipoMaquinaInputs = document.getElementsByName('tipo-maquina');
    const snackProblems = document.getElementById('snack-problems');
    const cafeProblems = document.getElementById('cafe-problems');

    // Si existen elementos, agregamos listener
    if (!asuntoSelect || !reclamoSection) return;

    // Manejar la visibilidad de los detalles de pago
    medioPagoInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Ocultar todos los detalles primero
            if (billeteDetailsExtra) billeteDetailsExtra.style.display = 'none';
            if (tarjetaDetails) tarjetaDetails.style.display = 'none';

            // Mostrar la sección correspondiente
            if (this.value === 'billete' && billeteDetailsExtra) {
                billeteDetailsExtra.style.display = 'block';
            } else if (this.value === 'tarjeta' && tarjetaDetails) {
                tarjetaDetails.style.display = 'block';
            }
        });
    });

    // Manejar visibilidad de la sección de reclamos
    function updateReclamoVisibility() {
        if (asuntoSelect.value === 'reclamo') {
            reclamoSection.style.display = 'block';
            setTimeout(() => reclamoSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        } else {
            reclamoSection.style.display = 'none';
        }
    }

    // Manejar visibilidad de problemas según tipo de máquina
    tipoMaquinaInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (snackProblems) snackProblems.style.display = 'none';
            if (cafeProblems) cafeProblems.style.display = 'none';

            if (this.value === 'snack' && snackProblems) {
                snackProblems.style.display = 'block';
            } else if (this.value === 'cafe' && cafeProblems) {
                cafeProblems.style.display = 'block';
            }
        });
    });

    // Inicializar estado
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
                bancoOtroInput.value = '';
            }
        });
    }
});

// Form Handlers para Yellow Box
(function() {
    'use strict';
    
    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        initFormHandlers();
    });
    
    function initFormHandlers() {
        // Formulario de reclamos
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            setupReclamosForm(contactForm);
        }
    }
    
    function setupReclamosForm(form) {
        // Manejar envío del formulario
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Enviar formulario
            await submitReclamosForm(form);
        });
    }
    
    async function submitReclamosForm(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const successMessage = document.getElementById('success-message');
        
        // Estado de carga
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Enviando...';
        submitBtn.disabled = true;
        
        try {
            // Verificar que EmailJS esté cargado
            if (typeof EmailService === 'undefined') {
                throw new Error('Error de configuración. Por favor recarga la página.');
            }
            
            // Enviar con EmailService
            const result = await EmailService.send(form);
            
            if (result.success) {
                // Mostrar mensaje de éxito
                form.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Resetear formulario
                form.reset();
                form.classList.remove('was-validated');
                
                // Ocultar secciones dinámicas
                document.querySelectorAll('.dynamic-section, .sub-section').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Resetear visibilidad de "Otro banco"
                const otroBancoContainer = document.getElementById('otro-banco-container');
                if (otroBancoContainer) otroBancoContainer.style.display = 'none';
                
                // Scroll al mensaje de éxito
                successMessage.scrollIntoView({ behavior: 'smooth' });
                
                // Auto-redireccionar después de 10 segundos (opcional)
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 10000);
                
            } else {
                throw new Error(result.message);
            }
            
        } catch (error) {
            // Mostrar error
            showError(error.message || 'Error al enviar el formulario');
            console.error('Error:', error);
            
        } finally {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    function showError(message) {
        // Crear o usar contenedor de errores existente
        let errorContainer = document.getElementById('form-error-message');
        
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'form-error-message';
            errorContainer.className = 'alert alert-danger mt-3';
            errorContainer.style.display = 'none';
            const formParent = document.querySelector('form').parentNode;
            formParent.insertBefore(errorContainer, document.querySelector('form').nextSibling);
        }
        
        errorContainer.innerHTML = `
            <h4 class="alert-heading">⚠️ Error</h4>
            <p>${message}</p>
            <hr>
            <p class="mb-0 small">Si el problema persiste, contacta directamente a <a href="mailto:contacto@smkvending.cl" class="alert-link">contacto@smkvending.cl</a> o llama al <strong>+56 9 XXXX XXXX</strong></p>
        `;
        errorContainer.style.display = 'block';
        
        // Auto-ocultar después de 15 segundos
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 15000);
        
        // Scroll al error
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Exponer funciones globales si es necesario
    window.setupFormHandlers = initFormHandlers;
    
})();