/**
 * ============================================
 * FORM HANDLERS - Yellow Box
 * VERSIÓN DEFINITIVA - Todo en un solo evento
 * ============================================
 */

(function() {
    'use strict';
    
    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Inicializando sistema completo...');
        
        // ========================================
        // PARTE 1: VERIFICAR EmailService
        // ========================================
        if (typeof EmailService === 'undefined') {
            console.error('❌ EmailService no está disponible');
            return;
        }
        console.log('✅ EmailService disponible');
        
        // ========================================
        // PARTE 2: OBTENER REFERENCIAS A ELEMENTOS
        // ========================================
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
        const contactForm = document.getElementById('contactForm');
        const ventasForm = document.getElementById('ventasForm');
        
        // ========================================
        // PARTE 3: CONFIGURAR VISIBILIDAD DINÁMICA
        // ========================================
        
        // Función para mostrar/ocultar reclamos
        function updateReclamoVisibility() {
            if (!asuntoSelect || !reclamoSection) return;
            
            
            if (asuntoSelect.value === 'reclamo') {
                reclamoSection.style.display = 'block';
                setTimeout(() => {
                    reclamoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                reclamoSection.style.display = 'none';
            }
        }
        
        // Configurar listener de asunto (sin clonar nada)
        if (asuntoSelect && reclamoSection) {
            // Estado inicial
            updateReclamoVisibility();
            
            // Listener para cambios
            asuntoSelect.addEventListener('change', updateReclamoVisibility);
        } else {
            console.warn('⚠️ No se encontraron: asunto=', !!asuntoSelect, 'reclamoSection=', !!reclamoSection);
        }
        
        // Configurar medios de pago
        if (medioPagoInputs.length > 0) {
            Array.from(medioPagoInputs).forEach(input => {
                input.addEventListener('change', function() {
                    if (billeteDetailsExtra) billeteDetailsExtra.style.display = 'none';
                    if (tarjetaDetails) tarjetaDetails.style.display = 'none';
                    
                    if (this.value === 'billete' && billeteDetailsExtra) {
                        billeteDetailsExtra.style.display = 'block';
                    } else if (this.value === 'tarjeta' && tarjetaDetails) {
                        tarjetaDetails.style.display = 'block';
                    }
                });
            });
        }
        
        // Configurar tipo de máquina
        if (tipoMaquinaInputs.length > 0) {
            Array.from(tipoMaquinaInputs).forEach(input => {
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

        }
        
        // Configurar banco
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
        
        // ========================================
        // PARTE 4: CONFIGURAR ENVÍO DE FORMULARIOS
        // ========================================
        console.log('📧 Configurando envío de formularios...');
        
        // Configurar formulario de reclamos (SIN CLONAR)
        if (contactForm) {
            // IMPORTANTE: Usamos el formulario existente, no lo clonamos
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (!contactForm.checkValidity()) {
                    contactForm.classList.add('was-validated');
                    return;
                }
                
                await enviarFormulario(contactForm, 'reclamos');
            });
            console.log('✅ Formulario de reclamos configurado');
        }
        
        // Configurar formulario de ventas (SIN CLONAR)
        if (ventasForm) {
            ventasForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (!ventasForm.checkValidity()) {
                    ventasForm.classList.add('was-validated');
                    return;
                }
                
                await enviarFormulario(ventasForm, 'ventas');
            });
            console.log('✅ Formulario de ventas configurado');
        }
    });
    
    // ========================================
    // PARTE 5: FUNCIÓN DE ENVÍO
    // ========================================
    async function enviarFormulario(form, tipo) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const successMessage = document.getElementById(
            tipo === 'reclamos' ? 'success-message' : 'success-ventas'
        );
        
        // Guardar texto original
        const originalText = submitBtn.innerHTML;
        
        try {
            // Estado de carga
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Enviando...';
            submitBtn.disabled = true;
            
            console.log(`📤 Enviando formulario de ${tipo}...`);
            
            // USAR EmailService
            const result = await EmailService.send(form);
            
            if (result.success) {
                console.log('✅ Envío exitoso:', result);
                
                // Mostrar éxito
                if (successMessage) {
                    form.style.display = 'none';
                    successMessage.style.display = 'block';
                    
                    // Resetear formulario
                    form.reset();
                    form.classList.remove('was-validated');
                    
                    // Ocultar secciones dinámicas
                    if (tipo === 'reclamos') {
                        const reclamoSection = document.getElementById('reclamo-section');
                        if (reclamoSection) reclamoSection.style.display = 'none';
                        
                        const otroBancoContainer = document.getElementById('otro-banco-container');
                        if (otroBancoContainer) otroBancoContainer.style.display = 'none';
                    }
                    
                    // Scroll al éxito
                    successMessage.scrollIntoView({ behavior: 'smooth' });
                    
                    // Restaurar después de 8 segundos
                    setTimeout(() => {
                        form.style.display = 'block';
                        successMessage.style.display = 'none';
                    }, 8000);
                } else {
                    alert('¡Formulario enviado con éxito!');
                    form.reset();
                }
            } else {
                throw new Error(result.message);
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            
            // Mostrar error
            let errorContainer = document.getElementById('form-error-message');
            if (!errorContainer) {
                errorContainer = document.createElement('div');
                errorContainer.id = 'form-error-message';
                errorContainer.className = 'alert alert-danger mt-3';
                form.parentNode.insertBefore(errorContainer, form.nextSibling);
            }
            
            errorContainer.innerHTML = `
                <h4 class="alert-heading">⚠️ Error</h4>
                <p>${error.message || 'Error al enviar el formulario'}</p>
                <hr>
                <p class="mb-0 small">Intenta nuevamente o contacta a soporte@yellowbox.cl</p>
            `;
            errorContainer.style.display = 'block';
            
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 10000);
            
        } finally {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
})();

// ========================================
// PARTE 6: MODAL 3D (si existe)
// ========================================
if (document.getElementById('modalReclamos3D')) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            const modalElement = document.getElementById('modalReclamos3D');
            if (modalElement && window.bootstrap) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
                console.log('📢 Modal 3D mostrado');
            }
        }, 400);
    });
}