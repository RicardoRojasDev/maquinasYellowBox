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