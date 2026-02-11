/**
 * MODAL RECLAMOS YELLOW BOX
 * Versión Profesional 3D - Cross Platform
 * Soporte: iOS, Android, Windows, macOS
 */

const ModalReclamos = (function() {
    'use strict';

    // Configuración
    const CONFIG = {
        MODAL_ID: 'modalReclamos3D',
        DELAY_MS: 400,
        DEBUG: true,
        MESSAGE: 'mensaje que ira despues' // ← CAMBIA AQUÍ EL MENSAJE
    };

    // Estado
    let modalInstance = null;

    /**
     * Inicializa el modal
     */
    function init() {
        if (!shouldShowModal()) return;
        
        log('🎯 Inicializando Modal Reclamos 3D');
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupModal);
        } else {
            setupModal();
        }
    }

    /**
     * Verifica si debe mostrar el modal
     */
    function shouldShowModal() {
        const isReclamosPage = window.location.pathname.includes('formReclamos.html') || 
                              document.getElementById('contactForm') !== null;
        
        if (!isReclamosPage) {
            log('📌 No es página de reclamos, modal omitido');
            return false;
        }
        
        return true;
    }

    /**
     * Configura el modal
     */
    function setupModal() {
        const modalElement = document.getElementById(CONFIG.MODAL_ID);
        
        if (!modalElement) {
            console.error('❌ No se encontró el modal:', CONFIG.MODAL_ID);
            return;
        }

        log('✅ Modal encontrado, configurando...');

        // Configurar backdrop estático pero permitir cierre con click y X
        modalInstance = new bootstrap.Modal(modalElement, {
            backdrop: true,        // Permite cerrar clickeando fuera
            keyboard: true,        // Permite cerrar con ESC
            focus: true
        });

        // Event listeners
        setupEventListeners(modalElement);
        
        // Mostrar modal con delay
        setTimeout(() => {
            showModal();
        }, CONFIG.DELAY_MS);
    }

    /**
     * Configura event listeners
     */
    function setupEventListeners(modalElement) {
        // Cuando el modal se abre
        modalElement.addEventListener('show.bs.modal', function() {
            log('📢 Modal abriéndose');
            document.body.style.overflow = 'hidden'; // Prevenir scroll
        });

        // Cuando el modal se cierra
        modalElement.addEventListener('hidden.bs.modal', function() {
            log('👋 Modal cerrado');
            document.body.style.overflow = ''; // Restaurar scroll
        });

        // Click en backdrop - YA FUNCIONA POR DEFECTO
        // Tecla ESC - YA FUNCIONA POR DEFECTO
        // Botón X - YA FUNCIONA POR DEFECTO
        
        // Botones personalizados
        const btnCerrar = modalElement.querySelector('[data-dismiss="modal"]');
        if (btnCerrar) {
            btnCerrar.addEventListener('click', closeModal);
        }
    }

    /**
     * Muestra el modal
     */
    function showModal() {
        if (modalInstance) {
            log('✨ Mostrando modal');
            modalInstance.show();
            
            // Pequeño efecto de confeti (opcional, se puede quitar)
            // triggerConfetti();
        }
    }

    /**
     * Cierra el modal
     */
    function closeModal() {
        if (modalInstance) {
            log('🔒 Cerrando modal');
            modalInstance.hide();
        }
    }

    /**
     * Actualiza el mensaje del modal (API pública)
     */
    function setMensaje(nuevoMensaje) {
        const mensajeElement = document.getElementById('modalMensajePrincipal');
        if (mensajeElement) {
            mensajeElement.textContent = nuevoMensaje;
            CONFIG.MESSAGE = nuevoMensaje;
            log('📝 Mensaje actualizado:', nuevoMensaje);
        }
    }

    /**
     * Confetti opcional - Solo se activa si existe la librería
     */
    function triggerConfetti() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FFFFFF']
            });
        }
    }

    /**
     * Logger condicional
     */
    function log(...args) {
        if (CONFIG.DEBUG) {
            console.log('%c[ModalReclamos]', 'background: #FFD700; color: #000; padding: 2px 5px; border-radius: 3px;', ...args);
        }
    }

    // API Pública
    return {
        init: init,
        show: showModal,
        close: closeModal,
        setMensaje: setMensaje
    };

})();

// Inicialización automática
ModalReclamos.init();

// Exponer globalmente para debugging
window.ModalReclamos = ModalReclamos;